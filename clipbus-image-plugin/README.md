# Image Tools

*English · [中文](./README_zh.md)*

Image Tools adds an interactive **Crop & Compress** action for images in Clipbus.

## Crop & Compress

- Drag or resize a crop rectangle over the current action input image.
- Enter an output width or height while preserving the crop aspect ratio.
- Adjust compression quality from 1–100.
- Preserve JPEG, PNG, or WebP output format; unsupported source formats fall back to PNG.
- Process a host-materialized copy with `sharp` and return a host-allocated temporary image without mutating the original clipboard item.

This is a draft action because crop geometry, output resolution, and quality require visual interaction. It reads the current action input, so it can consume an image produced by an earlier Clipbus action.

## Development

```sh
npm install
npm run dev:action
npm run verify
```

The installed `@clipbus/plugin-sdk/API.md` is the capability signature source of truth.
