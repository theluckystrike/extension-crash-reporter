# extension-crash-reporter

[![npm](https://img.shields.io/npm/v/extension-crash-reporter.svg)](https://www.npmjs.com/package/extension-crash-reporter)
[![License MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![Zero Dependencies](https://img.shields.io/badge/dependencies-0-green.svg)]()
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)]()
[![Chrome Extensions](https://img.shields.io/badge/Chrome-Extensions-blue.svg)](https://developer.chrome.com/docs/extensions/mv3/intro/)

> Lightweight crash reporting for Chrome extensions. Built for Manifest V3. Zero runtime dependencies.

extension-crash-reporter automatically captures uncaught errors and unhandled promise rejections in your Chrome extension, deduplicates them by message, tracks frequency, and persists everything to `chrome.storage`. Perfect for developers who need reliable crash diagnostics without the overhead of external services.

---

## Features

### 🔍 Automatic Crash Detection
- Captures uncaught JavaScript errors via global `error` event listeners
- Catches unhandled promise rejections with the `unhandledrejection` event
- Works seamlessly in background service workers, popup scripts, and content scripts

### 📊 Stack Trace Collection
- Full stack trace preservation for every captured error
- Automatic extraction of error message and stack information
- Supports both Error objects and string-based error reporting

### 🍞 Breadcrumb Tracking
- Each crash report includes:
  - Timestamp (ms since epoch)
  - Extension version (from `chrome.runtime.getManifest()`)
  - Page URL where the error occurred
  - Hit count for frequency analysis

### 📈 Frequency Analysis
- Intelligent deduplication by error message
- Automatic count incrementing for repeated crashes
- Top-crashes ranking to identify the most impactful issues

### 💾 Persistent Storage
- Built-in integration with `chrome.storage.local`
- Automatic save/load cycle support
- Configurable storage keys and maximum report limits

### 🛠️ Developer-Friendly API
- Simple install-and-forget initialization
- Chainable method calls
- JSON export for easy debugging
- Filter by time range for trend analysis

---

## Installation

```bash
npm install extension-crash-reporter
```

Or using yarn:

```bash
yarn add extension-crash-reporter
```

Or using pnpm:

```bash
pnpm add extension-crash-reporter
```

---

## Quick Start

### Basic Usage

```typescript
import { CrashReporter } from 'extension-crash-reporter';

// Create and install the reporter
const reporter = new CrashReporter().install();

// Errors and unhandled rejections are now captured automatically

// Manually capture an error with context
try {
    await riskyOperation();
} catch (err) {
    reporter.capture(err.message, err.stack);
}

// Persist reports to chrome.storage.local
await reporter.save();
```

### Background Service Worker

```typescript
import { CrashReporter } from 'extension-crash-reporter';

const reporter = new CrashReporter(100, '__crash_reports__').install();

// Load persisted reports when the extension starts
chrome.runtime.onInstalled.addListener(async () => {
    await reporter.load();
});

// Save reports before the service worker suspends
chrome.runtime.onSuspend.addListener(async () => {
    await reporter.save();
});
```

### Popup or Options Page

```typescript
import { CrashReporter } from 'extension-crash-reporter';

const reporter = new CrashReporter();
await reporter.load();

// Get crash statistics
const recent = reporter.countSince(Date.now() - 86400000);
console.log(`Crashes in the last 24 hours: ${recent}`);

const top = reporter.getTopCrashes(3);
top.forEach(r => console.log(`${r.message} (${r.count}x)`));
```

---

## API Reference

### Constructor

```typescript
new CrashReporter(maxReports?: number, storageKey?: string): CrashReporter
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `maxReports` | `number` | `50` | Maximum number of crash entries to retain. When exceeded, the oldest entry is evicted. |
| `storageKey` | `string` | `'__crash_reports__'` | The key used in `chrome.storage.local` for persistence. |

---

### Methods

#### `install(): this`

Attaches global `error` and `unhandledrejection` event listeners. This method is chainable, allowing you to create and install in a single statement.

```typescript
const reporter = new CrashReporter().install();
```

---

#### `capture(message: string, stack?: string): void`

Manually records an error. If an entry with the same message already exists, increments its count and refreshes its timestamp. Otherwise creates a new CrashReport.

```typescript
try {
    doSomethingRisky();
} catch (error) {
    reporter.capture(error.message, error.stack);
}
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `message` | `string` | The error message |
| `stack` | `string` | Optional stack trace |

---

#### `getReports(): CrashReport[]`

Returns a shallow copy of all stored crash reports.

```typescript
const allReports = reporter.getReports();
```

---

#### `getTopCrashes(count?: number): CrashReport[]`

Returns the top N crashes sorted by frequency (highest count first). Defaults to 5.

```typescript
const topCrashes = reporter.getTopCrashes(10);
```

---

#### `save(): Promise<void>`

Writes the current reports array to `chrome.storage.local` under the configured key.

```typescript
await reporter.save();
```

---

#### `load(): Promise<void>`

Reads reports from `chrome.storage.local` and replaces the in-memory array.

```typescript
await reporter.load();
```

---

#### `clear(): void`

Empties the in-memory reports array without affecting storage.

```typescript
reporter.clear();
```

---

#### `export(): string`

Serializes all reports as pretty-printed JSON.

```typescript
const json = reporter.export();
await navigator.clipboard.writeText(json);
```

---

#### `countSince(timestamp: number): number`

Returns the total crash count (summing individual hit counts) for all reports with a timestamp at or after the given value.

```typescript
const lastHour = reporter.countSince(Date.now() - 3600000);
const lastDay = reporter.countSince(Date.now() - 86400000);
```

---

### Type Definitions

#### CrashReport

```typescript
interface CrashReport {
    message: string;      // Error message
    stack: string;        // Stack trace
    timestamp: number;    // Unix timestamp (ms)
    version: string;      // Extension version from manifest
    url: string;          // Current page URL
    count: number;        // Number of times this error occurred
}
```

---

## Advanced Usage

### Custom Transport (Send to External API)

You can extend the reporter to send crashes to your own endpoint:

```typescript
import { CrashReporter, CrashReport } from 'extension-crash-reporter';

class CustomCrashReporter extends CrashReporter {
    private endpoint: string;

    constructor(endpoint: string, maxReports?: number, storageKey?: string) {
        super(maxReports, storageKey);
        this.endpoint = endpoint;
    }

    async sendToEndpoint(): Promise<void> {
        const reports = this.getReports();
        if (reports.length === 0) return;

        await fetch(this.endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                extension_version: chrome.runtime.getManifest().version,
                crashes: reports,
                timestamp: Date.now()
            })
        });
    }
}

const reporter = new CustomCrashReporter(
    'https://api.example.com/crashes'
).install();
```

---

### Sentry Integration

Send crash reports to Sentry for advanced error tracking:

```typescript
import { CrashReporter, CrashReport } from 'extension-crash-reporter';
import * as Sentry from '@sentry/browser';

class SentryReporter extends CrashReporter {
    private dsn: string;

    constructor(dsn: string, maxReports?: number, storageKey?: string) {
        super(maxReports, storageKey);
        this.dsn = dsn;
        Sentry.init({ dsn: this.dsn });
    }

    capture(message: string, stack: string = ''): void {
        super.capture(message, stack);
        
        // Also send immediately to Sentry
        Sentry.captureException(new Error(message), {
            extra: { stack }
        });
    }

    async syncToSentry(): Promise<void> {
        const reports = this.getReports();
        for (const report of reports) {
            Sentry.captureException(new Error(report.message), {
                extra: {
                    stack: report.stack,
                    count: report.count,
                    url: report.url
                }
            });
        }
    }
}

const reporter = new SentryReporter(
    'https://xxxxx@sentry.io/xxxxxx'
).install();
```

---

### Sampling Strategy

For high-volume extensions, implement sampling to reduce storage and reporting overhead:

```typescript
import { CrashReporter } from 'extension-crash-reporter';

class SamplingReporter extends CrashReporter {
    private sampleRate: number;

    constructor(sampleRate: number = 0.1, maxReports?: number, storageKey?: string) {
        super(maxReports, storageKey);
        this.sampleRate = sampleRate;
    }

    capture(message: string, stack: string = ''): void {
        // Only capture a percentage of errors
        if (Math.random() > this.sampleRate) {
            return;
        }
        super.capture(message, stack);
    }
}

// Capture only 10% of crashes in production
const reporter = new SamplingReporter(0.1).install();
```

---

### Error Boundary Pattern

For React-based extension UIs, combine with error boundaries:

```typescript
import { CrashReporter } from 'extension-crash-reporter';

const reporter = new CrashReporter().install();

// React error boundary component
class ErrorBoundary extends React.Component {
    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        reporter.capture(error.message, error.stack);
        // Also log to console in development
        console.error('Caught error:', error, errorInfo);
    }

    render() {
        return this.props.children;
    }
}
```

---

## Configuration Examples

### Manifest V3 Permissions

Ensure your `manifest.json` includes the required permissions:

```json
{
    "permissions": [
        "storage"
    ],
    "host_permissions": [
        "<all_urls>"
    ]
}
```

### TypeScript Configuration

For best results, use strict mode in your `tsconfig.json`:

```json
{
    "compilerOptions": {
        "strict": true,
        "target": "ES2020",
        "module": "ESNext",
        "moduleResolution": "node"
    }
}
```

---

## Requirements

- Chrome extension environment with Manifest V3
- `chrome.storage` permission in your `manifest.json` for save/load
- TypeScript 5.0+ (or use the compiled JS from `dist/`)
- Zero external runtime dependencies

---

## Development

```bash
# Clone and install
git clone https://github.com/theluckystrike/extension-crash-reporter.git
cd extension-crash-reporter

# Install dependencies
npm install

# Build TypeScript
npm run build

# Run tests (if available)
npm test
```

---

## Contributing

Contributions are welcome! Please read our [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on:

- Submitting issues and bug reports
- Proposing new features
- Code style and standards
- Pull request process

---

## License

MIT License. See [LICENSE](LICENSE) for the full text.

---

## Support

- 📖 [Documentation](https://github.com/theluckystrike/extension-crash-reporter)
- 🐛 [Issue Tracker](https://github.com/theluckystrike/extension-crash-reporter/issues)
- 💬 [Discussions](https://github.com/theluckystrike/extension-crash-reporter/discussions)

---

<div align="center">

Built with ❤️ by <a href="https://github.com/theluckystrike">theluckystrike</a> / <a href="https://zovo.one">zovo.one</a>

</div>
