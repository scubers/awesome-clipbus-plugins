# 图片工具

*[English](./README.md) · 中文*

Image Tools 为 Clipbus 中的图片提供交互式 **Crop & Compress** action。

## 裁剪与压缩

- 拖动或缩放裁剪框。
- 输入输出宽高，并保持裁剪区域的宽高比。
- 调整 1–100 的压缩质量。
- 保持 JPEG、PNG、WebP 输出格式；不支持的来源格式回退到 PNG。
- 使用 `sharp` 处理宿主物化的图片副本，通过宿主分配的临时路径返回结果，不修改原剪贴板项。

该能力需要裁剪、尺寸和质量交互，因此保留为 draft action。它读取当前 action 输入，也可以继续处理前一个 Clipbus action 产生的图片。

## 开发

```sh
npm install
npm run dev:action
npm run verify
```
