# SQL Formatter Plugin

一个 Clipbus 插件，用于自动识别剪贴板中的 SQL 语句并将其重排为可读格式。

## 功能

- **自动识别**：检测剪贴板文本中的 SQL 语句（SELECT / INSERT / UPDATE / DELETE / CREATE / ALTER / DROP / WITH）
- **护栏防误判**：要求文本同时含有 SQL 信号（`;` `*` `=` `(` 或 WHERE / JOIN / GROUP BY 等子句关键字），避免误判英文散文
- **轻量格式化**：将主要子句关键字大写并各自换行（SELECT、FROM、WHERE、AND、OR、JOIN 等），提升可读性；不做语义级 SQL 解析
- **卡片渲染**：以 monospace 代码块展示格式化后的 SQL，支持横向滚动；顶部显示语句类型徽章
- **一键复制**：卡片按钮及 auto-run action 均可将格式化 SQL 写入剪贴板

## 能力清单

| 能力 | id | 说明 |
|---|---|---|
| detector | `sql-detector` | 识别文本中的 SQL 语句 |
| attachment renderer | `sql-renderer` | 展示格式化 SQL 卡片 |
| auto-run action | `sql-copy` | 自动将格式化 SQL 写入剪贴板 |

## 注意事项

- 格式化仅做**可读性重排**（子句关键字大写 + 换行），不进行语义级 SQL 解析或验证
- 支持识别：`SELECT…FROM`、`INSERT INTO`、`UPDATE…SET`、`DELETE FROM`、`CREATE TABLE/VIEW/INDEX/DATABASE`、`ALTER`、`DROP`、`WITH…AS`
- 不支持方言特有语法的深度格式化（如 PL/pgSQL 块、存储过程体等）

## 开发命令

```sh
npm install       # 安装依赖
npm run dev       # 启动 Vite 预览工作台
npm test          # 运行测试
npm run verify    # 完整门禁（typecheck + lint + build + test）
```
