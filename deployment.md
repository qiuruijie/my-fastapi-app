# FastAPI 项目 - 部署

使用项目内置的 GitHub Actions 工作流将项目部署到 [FastAPI Cloud](https://fastapicloud.com)。

## 创建 FastAPI Cloud 应用

在 FastAPI Cloud 中创建一个应用，并将其 [Application Directory](https://fastapicloud.com/docs/builds-and-deployments/application-directory/) 设置为 `backend`。

使用 [Neon](https://fastapicloud.com/docs/integrations/neon-integration/) 或 [Supabase](https://fastapicloud.com/docs/integrations/supabase-integration/) 集成连接 PostgreSQL 数据库。这两种集成都会自动配置 `DATABASE_URL` 密钥。你也可以为其他 PostgreSQL 服务商手动配置 `DATABASE_URL`。

## 配置应用

### 环境变量

在 FastAPI Cloud 应用中添加以下必需的[环境变量](https://fastapicloud.com/docs/builds-and-deployments/environment-variables/)：

* `PROJECT_NAME`：项目名称，用于 API 文档和邮件。
* `FIRST_SUPERUSER`：第一个超级用户的邮箱地址。
* `FRONTEND_HOST`：应用的公网 URL，例如生成的 `https://your-app.fastapicloud.dev` URL 或自定义域名。

要启用邮件功能，请添加以下可选环境变量，取值来自你的邮件服务商：

* `SMTP_HOST`
* `SMTP_USER`
* `EMAILS_FROM_EMAIL`

要启用 Sentry，请配置 `SENTRY_DSN`。

### 密钥（Secrets）

添加以下必需的值，并将其标记为密钥：

* `SECRET_KEY`：用于签发安全令牌的密钥。
* `FIRST_SUPERUSER_PASSWORD`：第一个超级用户的密码。
* `DATABASE_URL`：PostgreSQL 连接 URL，使用数据库集成时会自动配置。

要使用需要认证的邮件服务商，请将 `SMTP_PASSWORD` 添加为密钥。

可以用以下命令为 `SECRET_KEY` 和 `FIRST_SUPERUSER_PASSWORD` 生成安全值：

```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

## 配置持续部署

内置的 `.github/workflows/deploy.yml` 工作流会在有变更推送到 `master` 分支时构建前端、准备数据库并部署应用。你也可以在 **Actions** 标签页手动运行它。

登录 FastAPI Cloud，并将 [deploy token](https://fastapicloud.com/docs/advanced-features/deploy-tokens/) 和应用 ID 配置为 GitHub 仓库密钥：

```bash
uv run fastapi login
uv run fastapi cloud setup-ci --secrets-only --app-id <your-app-id>
```

如果已安装并通过身份验证的 GitHub CLI，该命令会自动配置 `FASTAPI_CLOUD_TOKEN` 和 `FASTAPI_CLOUD_APP_ID`。否则，它会打印出这些值，你可以自行添加到仓库的 **Settings** > **Secrets and variables** > **Actions** 中。

该工作流会在部署前运行数据库迁移并创建第一个超级用户。请在仓库的 **Settings** > **Secrets and variables** > **Actions** 页面添加以下仓库变量：

* `PROJECT_NAME`
* `FIRST_SUPERUSER`

并添加以下仓库密钥：

* `DATABASE_URL`
* `SECRET_KEY`
* `FIRST_SUPERUSER_PASSWORD`

请使用与 FastAPI Cloud 中配置相同的值。`DATABASE_URL` 使用你的数据库服务商提供的连接 URL。数据库必须能从 GitHub 托管 runner 访问到，这样准备步骤才能连接它。

部署工作流会执行以下步骤：

1. 安装依赖并将前端构建到 `backend/app/frontend`。
2. 运行 `backend/scripts/prestart.sh` 以应用数据库迁移并创建第一个超级用户。
3. 使用 `uv run fastapi deploy` 部署项目。

## URLs

请将 `your-app.fastapicloud.dev` 替换为你的 FastAPI Cloud 应用 URL。

应用（前端和 API）：`https://your-app.fastapicloud.dev`

交互式 API 文档：`https://your-app.fastapicloud.dev/docs`

## Docker Compose

要部署到你自己的服务器，请看 [Docker Compose 部署指南](./deployment-docker-compose.md)。

## GitHub 仓库自动化

安装以下 GitHub Apps 以启用内置的仓库自动化：

* [Latest Changes](https://github.com/apps/latest-changes)：在 pull request 合并后更新 `release-notes.md`。
* [PR Push](https://github.com/apps/pr-push)：允许 pre-commit 工作流将自动修复推送到 pull request 分支。
* [PR Submit](https://github.com/apps/pr-submit)：允许 **Bump pre-commit hooks** 和 **Prepare Release** 工作流创建 pull request。

要使用 [Smokeshow](https://github.com/samuelcolvin/smokeshow) 发布代码覆盖率，请将 `SMOKESHOW_AUTH_KEY` 添加为仓库密钥。
