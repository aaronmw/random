# Property Randomizer

A Figma plugin for randomizing text, size, position, rotation, opacity, fills, strokes, blur, and arc values across selected layers.

[View Property Randomizer in the Figma Community][pluginStore].

## Development

```bash
npm ci
npm run dev
```

In the Figma desktop app, open a Figma Design file, run **Import plugin from manifest...**, and choose `manifest.json`.

## Build

```bash
npm run typecheck
npm run build
```

The plugin uses `dist/code.js` as the controller and `dist/ui.html` as the inline React UI bundle.

## Review Notes

- The plugin only works on the user's current selection on the current page.
- The manifest declares dynamic page loading support with `"documentAccess": "dynamic-page"`.
- The manifest declares no network access with `"networkAccess": { "allowedDomains": ["none"] }`.
- User presets are stored locally with Figma `clientStorage`; no plugin data is written to documents and no external services receive data.

[pluginStore]: https://www.figma.com/community/plugin/829089184334973766/Random
