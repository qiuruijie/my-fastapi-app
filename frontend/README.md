# FastAPI 项目 - 前端

前端使用 [Vite](https://vitejs.dev/)、[React](https://react.dev/)、[TypeScript](https://www.typescriptlang.org/)、[TanStack Query](https://tanstack.com/query)、[TanStack Router](https://tanstack.com/router)、[Tailwind CSS](https://tailwindcss.com/) 和 [shadcn/ui](https://ui.shadcn.com/) 构建。

## 环境要求

- [Bun](https://bun.sh/)

## 快速开始

在项目根目录安装依赖并启动前端开发服务器：

```bash
bun install
bun run dev
```

然后在浏览器中打开 <http://localhost:5173/>。

在 `backend` 目录下运行 `uv run bash scripts/prestart.sh` 和 `uv run fastapi dev`，并在 Docker Compose 中运行 PostgreSQL。完整的环境搭建请看 [../development.md](../development.md)。

要由 FastAPI 提供前端服务，请在 `frontend` 目录运行 `bun run build`，然后打开 `http://localhost:8000`。

查看 `frontend/package.json` 了解其他可用命令。

## 移除前端

如果你只开发纯 API 应用，想要移除前端，可以这样做：

- 删除 `./frontend` 目录。

- 在 `backend/app/main.py` 文件中，删除 `app.frontend()` 调用。

- 在 `backend/Dockerfile` 文件中，删除前端构建阶段和 `COPY --from=frontend-build` 指令。

- 在 `compose.override.yml` 文件中，删除 `playwright` 服务。

- 在 `.github/workflows/deploy.yml` 文件中，删除 **Set up Bun**、**Install frontend dependencies** 和 **Build frontend** 步骤。

- 在 `.fastapicloudignore` 文件中，删除 `!backend/app/frontend/` 条目。

完成，现在你拥有了一个纯 API 应用。🤓

## 生成客户端

### 自动方式

- 在项目根目录运行脚本：

```bash
bash ./scripts/generate-client.sh
```

- 提交更改。

### 手动方式

- 确保后端正在运行。

- 从 `http://localhost:8000/api/v1/openapi.json` 下载 OpenAPI JSON 文件，并将其复制为 `frontend` 目录根下名为 `openapi.json` 的新文件。

- 生成前端客户端，运行：

```bash
bun run generate-client
```

- 提交更改。

当后端变更影响 OpenAPI schema 时，需要重新生成客户端。

## 使用远程 API

默认情况下，构建后的前端与 FastAPI 应用使用同一来源。如果你希望在运行 Vite 开发服务器时调用远程 API，可以将环境变量 `VITE_API_URL` 设置为远程 API 的 URL。例如，在 `frontend/.env` 文件中设置：

```env
VITE_API_URL=https://my-domain.example.com
```

之后运行前端时，就会使用该 URL 作为 API 的基础 URL。

## 代码结构

前端代码结构如下：

- `frontend/src` - 主要的前端代码。
- `frontend/public` - 静态资源。
- `frontend/src/client` - 生成的 OpenAPI 客户端。
- `frontend/src/components` - 前端组件，其中 `frontend/src/components/ui` 是 shadcn/ui 组件。
- `frontend/src/hooks` - 自定义 hooks。
- `frontend/src/lib` - 前端共享工具函数。
- `frontend/src/routes` - 前端路由与页面。

## 使用 Playwright 进行端到端测试

前端内置了使用 Playwright 的初始端到端测试。运行这些测试需要 Docker Compose 技术栈处于运行状态。先用以下命令启动技术栈：

```bash
docker compose run --rm backend bash scripts/prestart.sh
docker compose up -d --wait backend
```

然后，可以用以下命令运行测试：

```bash
bunx playwright test
```

你也可以用 UI 模式运行测试，以便看到浏览器并与之交互：

```bash
bunx playwright test --ui
```

要停止并移除 Docker Compose 技术栈、清理测试产生的数据，请使用以下命令：

```bash
docker compose down -v
```

要更新测试，请进入 tests 目录，修改现有测试文件或按需添加新文件。

关于编写和运行 Playwright 测试的更多信息，请参考官方 [Playwright 文档](https://playwright.dev/docs/intro)。
