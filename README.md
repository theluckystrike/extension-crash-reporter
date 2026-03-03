# extension-crash-reporter — Crash Reporting for Chrome Extensions

[![npm](https://img.shields.io/npm/v/extension-crash-reporter.svg)](https://www.npmjs.com/package/extension-crash-reporter)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![Zero Dependencies](https://img.shields.io/badge/dependencies-0-green.svg)]()

> **Built by [Zovo](https://zovo.one)** — error tracking across 18+ Chrome extensions

**Error collection, deduplication, frequency tracking, and storage persistence** for Chrome extensions. Zero runtime dependencies.

## 📦 Install

```bash
npm install extension-crash-reporter
```

## 🚀 Quick Start

```typescript
import { CrashReporter } from 'extension-crash-reporter';

// Install global error handler
const reporter = new CrashReporter().install();

// Report errors manually
try {
    await riskyOperation();
} catch (error) {
    reporter.report(error);
}

// Get top crashes
const top = reporter.getTopCrashes(5);
/*
[
  { error: 'TypeError: Cannot read...', count: 42 },
  { error: 'RangeError: Invalid...', count: 15 }
]
*/

// Save to storage
await reporter.save();
```

## ✨ Features

### Automatic Error Capture

```typescript
const reporter = new CrashReporter().install();

// Catches unhandled errors and unhandled promise rejections
window.addEventListener('error', (event) => {
    reporter.report(event.error);
});

window.addEventListener('unhandledrejection', (event) => {
    reporter.report(event.reason);
});
```

### Deduplication

```typescript
// Group similar errors together
const reporter = new CrashReporter({
    deduplicate: true  // Default: true
});

// Two similar errors counted as one
reporter.report(new Error('Cannot read property of undefined'));
reporter.report(new Error('Cannot read property of undefined'));
// count = 1 (deduplicated)
```

### Frequency Tracking

```typescript
// Track how often each error occurs
const top = reporter.getTopCrashes(10);

// Get error counts
const stats = reporter.getStats();
/*
{
  totalErrors: 57,
  uniqueErrors: 12,
  lastError: Date
}
*/
```

### Storage Persistence

```typescript
// Auto-save to chrome.storage
const reporter = new CrashReporter({ persist: true });

// Load on startup
await reporter.load();

// Clear old errors
await reporter.clear();
```

### Error Context

```typescript
// Add context to errors
reporter.report(error, {
    userId: 'user123',
    page: '/popup.html',
    action: 'saveSettings'
});
```

## API Reference

### `CrashReporter`

| Method | Description |
|--------|-------------|
| `install()` | Install global error handlers |
| `report(error, context?)` | Report an error |
| `getTopCrashes(n)` | Get N most common errors |
| `getStats()` | Get error statistics |
| `save()` | Persist to storage |
| `load()` | Load from storage |
| `clear()` | Clear all errors |

### Options

```typescript
interface CrashReporterOptions {
    deduplicate?: boolean;   // Group similar errors (default: true)
    persist?: boolean;      // Auto-save to storage (default: false)
    maxErrors?: number;      // Max errors to track (default: 100)
}
```

## 📄 License

MIT — [Zovo](https://zovo.one)
