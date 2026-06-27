# clipbus-formatter-plugin

格式美化插件：识别剪贴板中的 JSON、XML、SQL 内容，自动格式化并展示预览，支持一键复制结果。

## 功能

### JSON

- **识别**（`json-detector`）：对 `text` 类型输入尝试 `JSON.parse`，成功且为对象/数组时挂 `plugin.formatter.json` 附件
- **缩进美化**（`json-renderer`）：卡片展示顶层类型（对象/数组）、字段数、2 空格缩进后的代码块
- **一键复制**（`json-copy`，auto-run）：直接将格式化后的 JSON 文本返回至剪贴板

### XML

- **识别**（`xml-detector`）：检测包含合法标签结构（元素对/prolog/注释）的文本，挂 `plugin.xml.formatted` 附件
- **缩进美化**（`xml-renderer`）：卡片展示元素数、属性数、格式化后的 XML 代码块
- **一键复制**（`xml-copy`，auto-run）：将缩进格式化后的 XML 文本返回至剪贴板

### SQL

- **识别**（`sql-detector`）：检测 SELECT/INSERT/UPDATE/DELETE 等 SQL 语句特征，挂 `plugin.sql.formatted` 附件；过滤口语化英文（如 "select the best option from the menu"）
- **大写美化**（`sql-renderer`）：卡片展示语句类型（SELECT/INSERT/UPDATE/DELETE）、关键字大写 + 换行缩进后的 SQL
- **一键复制**（`sql-copy`，auto-run）：将格式化后的 SQL 文本返回至剪贴板

## 本地开发

```sh
npm install
npm run dev       # Vite 预览工作台
npm run verify    # typecheck + lint + build + 测试（全绿才算完成）
```
