# FastAPI 项目 - Docker Compose 部署

你可以使用 Docker Compose 将项目部署到自己的远程服务器。部署配置包含 Traefik，用于处理 HTTPS 并将传入流量路由到应用。

## 准备工作

* 准备好一台可用的远程服务器。
* 为应用域名以及你想暴露的辅助服务子域名配置指向该服务器的 DNS 记录，例如 `fastapi-project.example.com` 和 `adminer.fastapi-project.example.com`。
* 在远程服务器上安装并配置 [Docker](https://docs.docker.com/engine/install/)（Docker Engine，不是 Docker Desktop）。

## 复制代码

```bash
rsync -av --exclude=".git/" --filter=":- .gitignore" ./ root@your-server.example.com:/root/code/app/
```

`--filter=":- .gitignore"` 选项让 `rsync` 使用与 Git 相同的忽略规则，从而排除 Python 虚拟环境等文件。

## 配置应用

### 环境变量

设置应用域名、项目名称和第一个超级用户的邮箱：

```bash
export DOMAIN=fastapi-project.example.com
export PROJECT_NAME="Full Stack FastAPI Project"
export FIRST_SUPERUSER=admin@example.com
```

你也可以按需配置以下环境变量：

* `SMTP_HOST`：你的邮件服务商提供的 SMTP 服务器主机。
* `SMTP_USER`：SMTP 服务器用户名。
* `EMAILS_FROM_EMAIL`：用于发送邮件的邮箱账户。
* `SENTRY_DSN`：Sentry 的 DSN。

### 密钥（Secrets）

为数据库密码、令牌签名密钥和第一个超级用户密码生成并设置安全的值：

```bash
export POSTGRES_PASSWORD="$(python -c 'import secrets; print(secrets.token_urlsafe(32))')"
export SECRET_KEY="$(python -c 'import secrets; print(secrets.token_urlsafe(32))')"
export FIRST_SUPERUSER_PASSWORD="$(python -c 'import secrets; print(secrets.token_urlsafe(32))')"
```

要使用需要认证的邮件服务商，还需要设置 `SMTP_PASSWORD`。

## 部署

```bash
cd /root/code/app/
docker compose -f compose.yml -f compose.deploy.yml build
docker compose -f compose.yml -f compose.deploy.yml run --rm backend bash scripts/prestart.sh
docker compose -f compose.yml -f compose.deploy.yml up -d
```

`compose.deploy.yml` 文件在共享的 `compose.yml` 配置基础上添加了 HTTPS 和自动证书处理。显式列出这两个文件会排除 `compose.override.yml` 中的本地开发设置。

后端 Docker 镜像会自行构建前端，因此服务器上不需要安装 Bun，也不需要预先构建好的前端文件。

## 通过 GitHub Actions 部署

内置的 `.github/workflows/deploy-docker-compose.yml` 工作流会在从 GitHub Actions 手动触发时，在服务器上运行部署命令。

仅在你信任仓库的贡献者和工作流代码时才使用自托管 runner。GitHub 建议私有仓库才搭配自托管 runner，因为工作流会直接在 runner 所在机器上执行。

### 配置仓库变量与密钥

在仓库中进入 **Settings** > **Secrets and variables** > **Actions**，添加以下仓库变量：

* `DOMAIN`
* `PROJECT_NAME`
* `FIRST_SUPERUSER`

要启用邮件功能，请添加以下可选仓库变量：

* `SMTP_HOST`
* `SMTP_USER`
* `EMAILS_FROM_EMAIL`

要启用 Sentry，请添加可选仓库变量 `SENTRY_DSN`。

添加以下仓库密钥：

* `POSTGRES_PASSWORD`
* `SECRET_KEY`
* `FIRST_SUPERUSER_PASSWORD`

要使用需要认证的邮件服务商，请添加可选仓库密钥 `SMTP_PASSWORD`。

### 安装自托管 Runner

在服务器上创建一个专用用户并授予其 Docker 访问权限：

```bash
sudo adduser github
sudo usermod -aG docker github
sudo su - github
```

在 GitHub 仓库中进入 **Settings** > **Actions** > **Runners**，选择 **New self-hosted runner**，选择 Linux，然后按照 GitHub 提供的命令下载、配置并注册 runner。将其安装到 `/home/github/actions-runner`。

注册 runner 后，退出 `github` 用户会话，并将 runner 安装为系统服务：

```bash
exit
cd /home/github/actions-runner
sudo ./svc.sh install github
sudo ./svc.sh start
sudo ./svc.sh status
```

参考 GitHub 官方指南：[添加自托管 runner](https://docs.github.com/en/actions/how-tos/manage-runners/self-hosted-runners/add-runners) 和 [将 runner 配置为服务](https://docs.github.com/en/actions/how-tos/manage-runners/self-hosted-runners/configure-the-application?platform=linux)。

### 运行部署

当 runner 处于在线状态时，打开仓库的 **Actions** 标签页，选择 **Deploy with Docker Compose**，然后选择 **Run workflow**。

## URLs

请将 `fastapi-project.example.com` 替换为你的域名。

应用（前端和 API）：`https://fastapi-project.example.com`

交互式 API 文档：`https://fastapi-project.example.com/docs`

Adminer：`https://adminer.fastapi-project.example.com`
