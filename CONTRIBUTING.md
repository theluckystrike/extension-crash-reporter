# Contributing to extension-crash-reporter

Thanks for your interest in contributing. This document covers the basics.

GETTING STARTED

1. Fork the repository on GitHub.
2. Clone your fork locally.
3. Run `npm install` to pull in dev dependencies.
4. Run `npm run build` to compile TypeScript and confirm everything works.

MAKING CHANGES

- Create a feature branch from `main`.
- Keep commits focused. One logical change per commit.
- Write clear commit messages that explain what changed and why.
- Make sure the project still builds cleanly with `npm run build`.

PULL REQUESTS

- Open your PR against `main`.
- Describe what the change does and why it matters.
- Keep PRs small when possible. Smaller changes are easier to review.
- If your PR addresses an open issue, reference it in the description.

REPORTING BUGS

Open an issue using the bug report template. Include the extension manifest version, Chrome version, and steps to reproduce the problem. Stack traces and console output help a lot.

SUGGESTING FEATURES

Open an issue using the feature request template. Describe the use case and how you think it should work. Concrete examples are always welcome.

CODE STYLE

- TypeScript strict mode is enabled. Do not disable it.
- Keep functions small and focused.
- Avoid adding runtime dependencies. This library ships with zero deps and should stay that way.

LICENSE

By contributing you agree that your contributions will be licensed under the MIT License.
