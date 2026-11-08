# 贡献指南

感谢你有意愿为 Full Stack FastAPI 模板做出贡献！🙇

## 先进行讨论

对于**重大变更**（新功能、架构调整、大规模重构），请先发起一个 [GitHub Discussion](https://github.com/fastapi/full-stack-fastapi-template/discussions)。这样在你投入大量时间实现之前，社区和维护者就能先对方案给出反馈。

对于小型、明确的改动，你可以直接提交 Pull Request，无需先发起讨论。包括：

- 拼写和语法修正
- 小型且可复现的 bug 修复
- 修复 lint 警告或类型错误
- 轻微的代码改进（例如移除无用代码）

注意，为防止供应链风险，非团队成员的 PR 不允许修改 `pyproject.toml` 或 `uv.lock`。
如果你需要添加新的依赖，请新建一个 [Discussion](https://github.com/fastapi/full-stack-fastapi-template/discussions) 说明原因。

## 开发

关于开发环境搭建、运行技术栈、代码检查、pre-commit hooks 等的详细说明，请参阅[开发指南](development.md)。

## Pull Requests

提交 pull request 时：

1. 确保提交前所有测试都能通过。
2. 保持 PR 聚焦于单一变更。
3. 如果你修改了功能，请同步更新测试。
4. 在 PR 描述中引用相关的 issue。

## 自动化代码与 AI

我们鼓励你使用任何你想要的工具来高效地完成工作和贡献，包括 AI（LLM）工具等。但贡献中应当包含有意义的人工介入、判断与上下文。

如果在一个 PR 上投入的**人工精力**（例如编写 LLM 提示词）**少于**我们**审查它所需要投入的精力**，请**不要**提交该 PR。

可以这样想：我们自己也能编写 LLM 提示词或运行自动化工具，那会比审查外部 PR 更快。

### 关闭自动化与 AI 生成的 PR

如果我们看到疑似 AI 生成或以类似方式自动化的 PR，我们会标记并关闭它们。

评论和描述同理，请不要直接复制粘贴 LLM 生成的内容。

### 人力拒绝服务（Human Effort Denial of Service）

使用自动化工具和 AI 提交需要我们要仔细审查和处理的 PR 或评论，等同于对我们的人力发起[拒绝服务攻击（Denial-of-service attack）](https://en.wikipedia.org/wiki/Denial-of-service_attack)。

提交者只需花费极少精力（一条 LLM 提示词），却会给我们这边造成大量工作（仔细审查代码）。

请不要这样做。

对于反复用自动化 PR 或评论刷屏的账户，我们不得不将其封禁。

### 明智地使用工具

正如本叔叔所说：

> 能力越大，责任越大。（~~power~~ **tools**）

避免无意造成伤害。

你手中有非常强大的工具，请明智地使用它们，有效地提供帮助。

## 有疑问？

如果你对如何贡献有疑问，欢迎随时发起 [GitHub Discussion](https://github.com/fastapi/full-stack-fastapi-template/discussions)。
