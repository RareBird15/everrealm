# Project Instructions

These instructions apply to all work on Everrealm.

## Read the specification first

Always read `SPEC.md` before making implementation decisions.

The specification is the authoritative source for:

- Gameplay
- Terminology
- Architecture
- Accessibility
- Design philosophy

Do not assume mechanics that are not described in the specification.

If the specification is ambiguous, ask for clarification rather than inventing
new gameplay.

---

## Respect the design philosophy

Everrealm is a calm kingdom-building strategy game.

It is **not** intended to imitate traditional mobile merge games.

When making implementation decisions:

- Prefer thoughtful choices over rapid interaction.
- Prefer accessibility over realism.
- Prefer clarity over cleverness.
- Prefer simple systems over unnecessary complexity.
- Favor player agency over automation.

---

## Accessibility

Accessibility is a core requirement, not an enhancement.

Always:

- Use semantic HTML whenever possible.
- Support full keyboard operation.
- Avoid unnecessary ARIA when native HTML is sufficient.
- Keep announcements concise and predictable.
- Consider screen-reader users first.

Never introduce mechanics that depend on:

- Color
- Drag-and-drop
- Precise mouse movement
- Timed reactions
- Audio positioning

---

## Architecture

Keep gameplay rules completely independent from React.

The game engine should:

- Contain all gameplay rules.
- Produce structured game events.
- Be independently testable.
- Know nothing about React or HTML.

React is responsible only for:

- Rendering the interface.
- Handling user interaction.
- Managing keyboard focus.
- Presenting game events.

---

## Implementation

Implement one gameplay system at a time.

Prefer small pull requests and focused changes.

Avoid implementing multiple unrelated systems in a single change.

Write clear, maintainable TypeScript.

---

## Testing

Gameplay logic should be unit-testable.

Whenever practical:

- Add tests for new gameplay systems.
- Keep business logic separate from UI logic.
- Prefer pure functions.

---

## Do Not

Do not:

- Rewrite large sections of the project without discussion.
- Introduce new gameplay systems without updating the specification.
- Add dependencies without a clear reason.
- Over-engineer solutions.
- Replace semantic HTML with custom controls.

---

## When Unsure

If a decision is not covered by the specification:

1. Choose the simplest implementation.
2. Explain the tradeoffs.
3. Ask for guidance before making significant gameplay changes.

Favor consistency with the existing design over introducing new ideas.
