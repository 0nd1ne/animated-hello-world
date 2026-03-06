# Animated Hello World

Minimal repo for the animated greeting used in the TodoFlow pipeline.

## Personalize the greeting

Pass a `name` query parameter to `/` to customize the heading:

- `http://localhost:3000/?name=Ondine`
- `http://localhost:3000/?name=Hello%20Team`

If the value is missing or sanitizes to empty, the app falls back to `World`.
