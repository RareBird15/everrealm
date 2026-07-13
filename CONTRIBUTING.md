# Contributing to Everrealm

Thank you for your interest in contributing to Everrealm. This document
explains how to set up the project and what to expect when contributing.

## Getting Started

1. Clone the repository.
2. Run `npm install` to install dependencies.
3. Run `npm run dev` to start the development server at `localhost:5173`.
4. Run `npm run test` to run the test suite.

## Development Workflow

- **Write tests.** The engine is designed to be fully testable without React.
  New game mechanics should include engine tests in `src/tests/engine/`.
- **Keep the engine separate from the UI.** The `src/engine/` directory must
  not import from `src/ui/`. This separation is a core architectural principle.
- **Use semantic HTML.** Everrealm is screen-reader first. New UI components
  should use native HTML elements with appropriate ARIA labels. Avoid
  color-only information. Test with keyboard navigation only.
- **Match existing style.** Follow the patterns you see in neighboring files.
  The project uses TypeScript strict mode, functional React components, and
  branded types for domain identifiers.

## Before Submitting a PR

Run all checks:

```bash
npm run test
npm run build
npm run lint
```

All three must pass. The CI workflow will run these same checks.

## Accessibility Guidelines

Everrealm's primary audience is screen reader users. When adding or changing
UI:

- Every interactive element must have a descriptive `aria-label` or visible
  text label.
- Test with keyboard only — no mouse. Every action must be reachable and
  operable via Tab, Enter, and Space.
- Announcements go through the `LiveRegion` component with `aria-live="polite"`.
- Do not use `window.confirm` or other native dialogs that steal focus. Use
  inline UI patterns instead.
- Do not rely on color, position, or visual layout to convey information.

## Design Principles

From the spec:

- Screen-reader first, not screen-reader compatible.
- Minimize spatial memory requirements.
- Every common action should require as few keystrokes as possible.
- The game should feel calm rather than frantic.
- No action should require time-sensitive input or fast reflexes.
- Prefer meaningful decisions over larger numbers.
- Reward curiosity rather than optimization.

## Reporting Bugs

Use the bug report issue template. Include:

- What you expected to happen.
- What actually happened.
- Steps to reproduce.
- Whether you're using a screen reader (and which one).

## Suggesting Features

Use the feature request issue template. Explain:

- What the feature does.
- Why it fits the design principles above.
- How it affects screen reader users.