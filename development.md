# FastAPI 项目 - 开发

## 本地开发

本地开发时，使用 Docker Compose 运行 PostgreSQL 和 Mailpit，并在本地运行 FastAPI 和 Vite 开发服务器。

先启动支撑服务：

```bash
docker compose up -d db mailpit
```

然后，在 `backend` 目录下安装依赖并准备数据库。

**Linux / macOS：**

```bash
uv sync
uv run bash scripts/prestart.sh
```

**Windows（PowerShell）：** `scripts/prestart.sh` 需要 `bash`，而 PowerShell 会把它解析到 `C:\Windows\System32\bash.exe`（WSL 入口）。若本机没有安装 Linux 发行版，这条命令会失败，或进入一个既没有 `alembic` 也没有本项目虚拟环境的错误环境。该脚本只有两条实质命令，直接展开执行即可，结果完全一致：

```powershell
uv sync
uv run alembic upgrade head
uv run python app/initial_data.py
```

**跨平台通用写法：** 让容器代跑，`bash` 存在于 Linux 镜像内部，因此在 Windows、macOS、Linux 上都能用：

```powershell
docker compose run --rm backend bash scripts/prestart.sh
```

> 说明：本项目是 uv workspace，虚拟环境创建在**仓库根目录**的 `.venv`，而不是 `backend/.venv`。激活命令因平台而异：Linux / macOS 用 `source .venv/bin/activate`，Windows 用 `.\.venv\Scripts\Activate.ps1`。通常无需激活，直接用 `uv run` 前缀即可。

启动 FastAPI 开发服务器（Linux / macOS / Windows 命令相同）：

```bash
uv run fastapi dev
```

`fastapi dev` 默认只绑定 `127.0.0.1`。即使本机已有进程监听 `0.0.0.0:8000`（例如 VMware 的 `vmnat`），Windows 也允许这种更具体的绑定，两者共存，浏览器访问 `http://127.0.0.1:8000` 仍会命中本地后端。若你确实遇到 `address already in use`，再换用一个空闲端口：

```powershell
uv run fastapi dev --port 8011
```

此时需要同步修改 `frontend/.env` 中的 `VITE_API_URL`（见下方说明）。

> 区分一下：Docker Compose 需要将容器端口绑定到宿主机 `0.0.0.0`，那种情况下同端口才是真冲突，因此 `compose.override.yml` 里把后端的宿主机端口改为了 `8010`。

另开一个终端，在项目根目录安装前端依赖并启动 Vite 开发服务器（命令跨平台通用）：

```bash
bun install
bun run dev
```

现在你可以打开以下 URL：

前端开发服务器：<http://localhost:5173>

后端 API：<http://localhost:8000>（默认为 `8000`，若启动时改用 `--port` 则相应调整）

基于 Swagger UI 的自动交互式 API 文档：<http://localhost:8000/docs>

Mailpit：<http://localhost:8025>

前端开发服务器使用 `http://localhost:8000` 的后端，该地址在 `frontend/.env` 中配置。若后端改用了其他端口，这里也要一并修改后重启 Vite。

数据库运行在 Docker 中，宿主机映射端口为 `5233`（见 `compose.override.yml`，因为本机 `5432` 常被独立安装的 PostgreSQL 占用）。用 Navicat、DBeaver 等客户端连接时填：主机 `localhost`、端口 `5233`、初始数据库 `app`、用户名 `postgres`、密码取自 `.env` 的 `POSTGRES_PASSWORD`。注意容器内部仍是 `5432`，`compose.yml` 里后端使用的 `db:5432` 不需要改动。

### 关于“Frontend directory does not exist”警告

本地启动 `fastapi dev` 时，日志会出现：

```
UserWarning: Frontend directory '...backend/app/frontend' does not exist
```

同时访问后端根路径 `http://127.0.0.1:8000/` 会返回 **500**。这是预期行为：本模板让 FastAPI 直接托管前端静态文件，而 `backend/app/frontend` 是构建产物且未纳入版本管理，没构建过就不存在。此时 API 本身完全正常（`/docs` 与 `/api/v1/utils/health-check/` 可用）。

两种处理方式：

- **开发前端代码（推荐）**：不需要该目录，直接另开终端跑 `bun run dev`，访问 Vite 开发服务器 <http://localhost:5173>，获得热重载。
- **希望后端直接输出页面**：先在 `frontend` 目录执行 `bun run build` 生成产物，重启后端后访问 <http://localhost:8000>；但每改一次前端都要重新构建，开发期效率较低。

### 由 FastAPI 提供前端服务

在 `frontend` 目录构建前端：

```bash
bun run build
```

构建产物会写入 `backend/app/frontend`，并由本地运行的 FastAPI 在其服务端口（默认为 <http://localhost:8000>）提供服务。修改前端后需要重新构建。

### 平台命令差异速查

| 场景 | Linux / macOS | Windows（PowerShell） |
| --- | --- | --- |
| 启动支撑服务 | `docker compose up -d db mailpit` | 同左 |
| 安装依赖 | `uv sync` | 同左 |
| 建表与初始数据 | `uv run bash scripts/prestart.sh` | `uv run alembic upgrade head` 然后 `uv run python app/initial_data.py`；或用 `docker compose run --rm backend bash scripts/prestart.sh` |
| 启动后端 | `uv run fastapi dev` | 同左 |
| 激活虚拟环境 | `source .venv/bin/activate` | `.\.venv\Scripts\Activate.ps1` |
| 前端依赖与开发服务 | `bun install` / `bun run dev` | 同左 |
| 代码检查 | `uv run prek run --all-files` | 同左 |

只有两处真正需要区分平台：**调用 `bash` 的脚本**和**激活虚拟环境的 `bin` / `Scripts` 路径**（Windows 下是 `Scripts\*.ps1`，且分隔符用 `\`）。其余命令跨平台一致。

## 使用 Docker Compose 运行全栈

在 Docker Compose 中运行后端与已构建的前端。以下两条命令跨平台通用（`bash` 位于容器内部，Windows 可直接执行）：

```bash
docker compose run --rm backend bash scripts/prestart.sh
docker compose watch
```

现在你可以打开以下 URL：

本项目把宿主机端口调整为非默认值（`compose.override.yml`），以避免与本机已有服务冲突（`80` 被加速器占用、`8000` 被 `vmnat` 占用），因此访问地址如下：

应用（前端和 API 均由 FastAPI 提供服务）：<http://localhost:8010>

基于 Swagger UI 的自动交互式 API 文档：<http://localhost:8010/docs>

Adminer，数据库 Web 管理工具：<http://localhost:8080>

经 Traefik 访问应用：<http://localhost:8088>

Traefik UI，查看代理当前的路由处理方式：<http://localhost:8090>

Mailpit：<http://localhost:8025>

在启动 Compose 后端之前，请先停止本地运行的 FastAPI 服务器，因为两者最终都使用容器内的 `8000` 端口。

**注意**：首次启动技术栈时，所有服务就绪可能需要一分钟。可以用 `docker compose logs` 监控，或用 `docker compose logs backend` 查看后端服务日志。

## Mailpit

[Mailpit](https://mailpit.axllent.org) 会捕获本地开发期间发送的邮件，而不是真正投递。本地后端连接 `localhost:1025`，Compose 中的后端连接 `mailpit` 服务。捕获的邮件可在 <http://localhost:8025> 查看。

## Docker Compose 文件与环境变量

主文件 `compose.yml` 包含整个技术栈共享的配置，Docker Compose 会自动加载它。

`compose.override.yml` 文件添加了本地开发设置，例如将源码挂载为数据卷。Docker Compose 也会自动加载它，并将其配置叠加应用到 `compose.yml` 之上。

`compose.deploy.yml` 文件包含部署相关的专门设置，包括 HTTPS 和自动证书处理。部署应用时，需要将它与 `compose.yml` 显式组合使用。

后端从 `.env` 文件读取本地设置。Docker Compose 也会使用该文件进行变量插值，并把各容器需要的设置传入容器。

修改变量后，请确保重启技术栈：

```bash
docker compose watch
```

## `.env` 文件

纳入版本管理的 `.env` 文件包含本地开发默认值、密码以及其他配置。其中的主机名使用 `localhost`，对应运行在你本机上的进程。Docker Compose 会将数据库、SMTP 服务器等主机名覆盖为对应的 Compose 服务名。

不要在 `.env` 中存储部署密钥。请按照 [FastAPI Cloud 部署指南](./deployment.md) 或 [Docker Compose 部署指南](./deployment-docker-compose.md) 说明的方式配置它们。

## Pre-commit Hooks 与代码检查

本项目使用 [prek](https://prek.j178.dev/)（[pre-commit](https://pre-commit.com/) 的现代替代方案）进行代码检查与格式化。

项目根目录下有包含相关配置的 `.pre-commit-config.yaml` 文件。

### 安装 `prek` 实现自动运行

`prek` 已经是项目依赖之一。以下命令跨平台通用（已验证在 Windows 上可用），在项目根目录安装 Git hook，让 `prek` 在每次提交前自动运行：

```bash
uv run prek install -f
```

`-f` 参数用于强制安装，以防之前已经安装过 `pre-commit` 的 hook。

之后每次尝试提交时，例如：

```bash
git commit
```

`prek` 会检查并格式化你即将提交的代码。如果它修改了某些文件，请在提交前将这些文件重新添加到 Git。

### 手动运行 `prek`

你也可以在项目根目录对所有文件手动运行 `prek`：

```bash
uv run prek run --all-files
```
