# extension-crash-reporter — Crash Reporting for Extensions
> **Built by [Zovo](https://zovo.one)** | `npm i extension-crash-reporter`

Error collection, deduplication, frequency tracking, and storage persistence.

```typescript
import { CrashReporter } from 'extension-crash-reporter';
const reporter = new CrashReporter().install();
const top = reporter.getTopCrashes(5);
await reporter.save();
```
MIT License
