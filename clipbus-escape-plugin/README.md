# Escape & Encode Plugin

Clipbus draft action 插件，提供常用编码/转义工具。

## 功能

- **URL 编码**：`encodeURIComponent` / `decodeURIComponent`
- **HTML 转义**：`& < > " '` 互转 HTML 实体，支持命名实体与数字实体解码
- **Base64**：UTF-8 安全编解码（支持中文等多字节字符）
- **Unicode 转义**：字符 ↔ `\uXXXX` 序列
- **JSON 字符串转义**：特殊字符 ↔ JSON 转义序列

## 使用方式

1. 在 Clipbus 中触发 **Escape & Encode** action。
2. 选择编码模式（URL / HTML / Base64 / Unicode / JSON）。
3. 在输入框中输入或粘贴文本，实时查看「编码结果」与「解码结果」。
4. 点击任意结果旁的「复制」按钮，或点击「复制编码结果」按钮完成 action。
