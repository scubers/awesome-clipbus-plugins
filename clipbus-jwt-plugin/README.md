# clipbus-jwt-plugin — JWT Inspector

识别剪贴板中的 **JWT（JSON Web Token）**，解码 header 与 payload，展示标准 claims 与过期状态，一键复制 payload。

## 功能

- **JWT 识别**（detector `jwt-detector`）：识别 `header.payload.signature` 形态的 JWT。仅当 header 与 payload 段都是合法 base64url-JSON、且 header 含字符串 `alg` 字段时才触发，避免把任意带点的 base64url 串误判为 JWT。
- **JWT 解析卡片**（renderer `jwt-renderer`）：
  - `alg` / `typ` 徽章；
  - 过期状态药丸：根据 `exp` 显示「N 天后过期」或「已过期 N 天」（绿色/红色），并标注「无签名」；
  - 标准 claims 列表：`iss` / `sub` / `aud` / `azp` / `scope` / `name` / `email` / `jti` / `iat` / `nbf`（时间戳转 ISO）；
  - 完整 payload 的格式化 JSON；
  - 卡片按钮「复制 Payload」。
- **复制动作**（auto-run `jwt-copy`）：直接复制解码后的 payload（格式化 JSON）。

## 说明

- 本插件**仅解码、不校验签名**——它不持有密钥，无法验证 HMAC/RSA 签名是否有效；过期状态来自 `exp` claim。
- 解码纯在本地完成，不发起任何网络请求。

## 开发

```sh
npm install
npm run verify   # typecheck + lint + build + verify-build + 测试
```

架构与约定见仓库根 `CLAUDE.md` 与 `template-plugin/`。
