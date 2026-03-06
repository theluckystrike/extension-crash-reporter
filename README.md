# extension-crash-reporter

[![npm](https://img.shields.io/npm/v/extension-crash-reporter.svg)](https://www.npmjs.com/package/extension-crash-reporter)
[![License MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![Zero Dependencies](https://img.shields.io/badge/dependencies-0-green.svg)]()

Lightweight crash reporting for Chrome extensions. Captures uncaught errors and unhandled promise rejections, deduplicates them by message, tracks frequency, and persists everything to chrome.storage. Built for Manifest V3. Zero runtime dependencies.

INSTALL

```bash
npm install extension-crash-reporter
```

QUICK START

```typescript
import { CrashReporter } from 'extension-crash-reporter';

const reporter = new CrashReporter().install();

// errors and unhandled rejections are now captured automatically

// manually capture something
try {
    await riskyOperation();
} catch (err) {
    reporter.capture(err.message, err.stack);
}

// persist to chrome.storage.local
await reporter.save();
```

HOW IT WORKS

When you call `install()`, the reporter attaches listeners for the global `error` and `unhandledrejection` events. Each captured error is stored with its message, stack trace, timestamp, extension version (read from `chrome.runtime.getManifest`), current URL, and a hit count.

If the same error message appears again, the existing entry gets its count incremented and its timestamp updated instead of creating a duplicate. The reporter keeps a configurable maximum number of reports (default 50) and drops the oldest entry when the limit is reached.

CONSTRUCTOR

```typescript
const reporter = new CrashReporter(maxReports?, storageKey?);
```

`maxReports` controls how many crash entries are retained before the oldest is evicted. Defaults to 50.

`storageKey` is the key used in chrome.storage.local for persistence. Defaults to `__crash_reports__`.

API

`install()` returns `this`
Attaches global error and unhandledrejection listeners. Chainable so you can create and install in one line.

`capture(message, stack?)` returns `void`
Records an error. If an entry with the same message already exists, increments its count and refreshes its timestamp. Otherwise pushes a new CrashReport with the current extension version and page URL.

`getReports()` returns `CrashReport[]`
Returns a shallow copy of all stored crash reports.

`getTopCrashes(count?)` returns `CrashReport[]`
Returns the top N crashes sorted by frequency (highest count first). Defaults to 5.

`save()` returns `Promise<void>`
Writes the current reports array to chrome.storage.local under the configured key.

`load()` returns `Promise<void>`
Reads reports from chrome.storage.local and replaces the in-memory array.

`clear()` returns `void`
Empties the in-memory reports array.

`export()` returns `string`
Serializes all reports as pretty-printed JSON.

`countSince(timestamp)` returns `number`
Returns the total crash count (summing individual counts) for all reports with a timestamp at or after the given value.

CRASH REPORT SHAPE

```typescript
interface CrashReport {
    message: string;
    stack: string;
    timestamp: number;
    version: string;
    url: string;
    count: number;
}
```

EXAMPLES

Background service worker

```typescript
import { CrashReporter } from 'extension-crash-reporter';

const reporter = new CrashReporter(100).install();

chrome.runtime.onInstalled.addListener(async () => {
    await reporter.load();
});

chrome.runtime.onSuspend.addListener(async () => {
    await reporter.save();
});
```

Popup crash summary

```typescript
import { CrashReporter } from 'extension-crash-reporter';

const reporter = new CrashReporter();
await reporter.load();

const recent = reporter.countSince(Date.now() - 86400000);
console.log(`Crashes in the last 24 hours: ${recent}`);

const top = reporter.getTopCrashes(3);
top.forEach(r => console.log(`${r.message} (${r.count}x)`));
```

Export diagnostics to clipboard

```typescript
const json = reporter.export();
await navigator.clipboard.writeText(json);
```

REQUIREMENTS

- Chrome extension environment with Manifest V3
- chrome.storage permission in your manifest.json for save/load
- TypeScript 5.0+ (or use the compiled JS from dist/)

DEVELOPMENT

```bash
git clone https://github.com/theluckystrike/extension-crash-reporter.git
cd extension-crash-reporter
npm install
npm run build
```

CONTRIBUTING

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on submitting issues and pull requests.

LICENSE

MIT. See [LICENSE](LICENSE) for the full text.

Built by [theluckystrike](https://github.com/theluckystrike) / [zovo.one](https://zovo.one)
