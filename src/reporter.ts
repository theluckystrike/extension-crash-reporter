/**
 * Crash Reporter — Error collection and diagnostics
 */
export interface CrashReport { message: string; stack: string; timestamp: number; version: string; url: string; count: number; }

export class CrashReporter {
    private reports: CrashReport[] = [];
    private maxReports: number;
    private storageKey: string;

    constructor(maxReports: number = 50, storageKey: string = '__crash_reports__') {
        this.maxReports = maxReports; this.storageKey = storageKey;
    }

    /** Start listening for errors */
    install(): this {
        if (typeof globalThis !== 'undefined') {
            globalThis.addEventListener?.('error', (e: any) => this.capture(e.message, e.error?.stack || ''));
            globalThis.addEventListener?.('unhandledrejection', (e: any) => this.capture(e.reason?.message || String(e.reason), e.reason?.stack || ''));
        }
        return this;
    }

    /** Capture an error */
    capture(message: string, stack: string = ''): void {
        const existing = this.reports.find((r) => r.message === message);
        if (existing) { existing.count++; existing.timestamp = Date.now(); return; }
        const version = typeof chrome !== 'undefined' ? chrome.runtime?.getManifest?.()?.version || '0.0.0' : '0.0.0';
        this.reports.push({ message, stack, timestamp: Date.now(), version, url: typeof location !== 'undefined' ? location.href : '', count: 1 });
        if (this.reports.length > this.maxReports) this.reports.shift();
    }

    /** Get all reports */
    getReports(): CrashReport[] { return [...this.reports]; }

    /** Get most frequent crashes */
    getTopCrashes(count: number = 5): CrashReport[] {
        return [...this.reports].sort((a, b) => b.count - a.count).slice(0, count);
    }

    /** Save reports to storage */
    async save(): Promise<void> { await chrome.storage.local.set({ [this.storageKey]: this.reports }); }

    /** Load reports from storage */
    async load(): Promise<void> {
        const result = await chrome.storage.local.get(this.storageKey);
        this.reports = (result[this.storageKey] as CrashReport[]) || [];
    }

    /** Clear all reports */
    clear(): void { this.reports = []; }

    /** Export as JSON */
    export(): string { return JSON.stringify(this.reports, null, 2); }

    /** Get crash count since timestamp */
    countSince(timestamp: number): number {
        return this.reports.filter((r) => r.timestamp >= timestamp).reduce((sum, r) => sum + r.count, 0);
    }
}
