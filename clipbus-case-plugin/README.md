# clipbus-case-plugin

Clipbus 命名风格转换插件（Case Converter）。

## 功能

从剪贴板文本一键转换为 8 种命名风格，实时预览并逐条复制：

| 风格 | 示例 |
|---|---|
| camelCase | `helloWorldFooBar` |
| PascalCase | `HelloWorldFooBar` |
| snake_case | `hello_world_foo_bar` |
| CONSTANT_CASE | `HELLO_WORLD_FOO_BAR` |
| kebab-case | `hello-world-foo-bar` |
| Title Case | `Hello World Foo Bar` |
| Sentence case | `Hello world foo bar` |
| dot.case | `hello.world.foo.bar` |

## 使用

1. 复制任意标识符或句子到剪贴板，触发 "Case Converter" action。
2. 输入框自动预填剪贴板文本，实时显示全部 8 种风格。
3. 点击各行"复制"按钮单独复制任意风格；或点击宿主"复制 camelCase"按钮直接提交 camelCase 结果。

## 支持的分词边界

空白符、`_`、`-`、`/`、`.`，以及 camelCase / PascalCase 大小写转换边界。
