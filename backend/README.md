# FastAPI 项目 - 后端

## 环境要求

* [Docker](https://www.docker.com/)。
* [uv](https://docs.astral.sh/uv/)：用于 Python 包与环境管理。

## 本地开发

在本地运行后端，并连接到 Docker Compose 中的 PostgreSQL。

在项目根目录，启动 PostgreSQL 和 Mailpit：

```console
$ docker compose up -d db mailpit
```

然后，在 `./backend/` 目录下安装依赖、准备数据库并启动开发服务器：

```console
$ uv sync
$ uv run bash scripts/prestart.sh
$ uv run fastapi dev
```

API 可通过 `http://localhost:8000` 访问，`http://localhost:8000/docs` 提供自动生成的交互式文档。

## 通用工作流

在 `./backend/` 目录下使用 `uv run` 运行后端命令。请确保你的编辑器使用项目根目录下 `.venv/bin/python` 的 Python 解释器。

在 `./backend/app/models.py` 中修改或新增用于数据和 SQL 表的 SQLModel 模型，在 `./backend/app/api/` 中定义 API 端点，在 `./backend/app/crud.py` 中编写 CRUD（增、删、改、查）工具函数。

## VS Code

项目中已经配置好通过 VS Code 调试器运行后端，因此你可以使用断点、暂停并查看变量等功能。

同时，也已配置好可以通过 VS Code 的 Python 测试标签页运行测试。

## 使用 Docker Compose 运行全栈

在 Docker Compose 中运行后端与已构建的前端：

```console
$ docker compose run --rm backend bash scripts/prestart.sh
$ docker compose watch
```

应用可通过 `http://localhost:8000` 访问。

### Docker Compose Override

`compose.override.yml` 文件包含本地开发设置，例如端口映射、源码同步、镜像自动重建以及后端自动重载。当你运行 `docker compose` 而没有显式指定文件列表时，Docker Compose 会自动应用该文件。

在后端容器中打开一个 shell：

```console
$ docker compose exec backend bash
```

## 后端测试

要在 `backend` 目录下测试后端，运行：

```console
$ uv run bash scripts/test.sh
```

测试基于 Pytest 运行。可以在 `./backend/tests/` 中修改现有测试或添加新测试。

如果你使用 GitHub Actions，测试将会自动运行。

### 测试已运行的技术栈

如果你的技术栈已经在运行，你只是想跑一下测试，可以使用：

```bash
docker compose exec backend bash scripts/tests-start.sh
```

`/app/backend/scripts/tests-start.sh` 脚本会调用 `pytest`。如果需要给 `pytest` 传递额外参数，直接传给该命令即可，参数会被透传。

例如，在遇到第一个错误时停止：

```bash
docker compose exec backend bash scripts/tests-start.sh -x
```

### 测试覆盖率

测试运行后会生成 `htmlcov/index.html`。在浏览器中打开它即可查看测试覆盖率。

## 数据库迁移

每次修改模型后，务必为模型创建一个修订版本（revision），并用该修订版本升级数据库。在 `backend` 目录下，使用 `uv` 针对 PostgreSQL 容器运行 Alembic：

* Alembic 已配置为从 `./backend/app/models.py` 导入你的 SQLModel 模型。

* 修改模型后（例如新增一列），创建一个修订版本：

```console
$ uv run alembic revision --autogenerate -m "Add column last_name to User model"
```

* 将 alembic 目录中生成的文件提交到 git 仓库。

* 创建修订版本后，在数据库中运行迁移（这才是真正改变数据库的操作）：

```console
$ uv run alembic upgrade head
```

如果你完全不想使用迁移，取消 `./backend/app/core/db.py` 文件中以下结尾行的注释：

```python
SQLModel.metadata.create_all(engine)
```

并注释掉 `scripts/prestart.sh` 文件中包含以下内容的行：

```console
$ alembic upgrade head
```

如果你不想从默认模型开始，并希望移除或修改它们，可以在一开始还没有任何历史修订版本时，删除 `./backend/app/alembic/versions/` 下的修订版本文件（`.py` Python 文件），然后按上文所述创建第一个迁移。

## 邮件模板

邮件模板使用 [React Email](https://react.email) 编写，位于 `./packages/react-email/`。`emails` 目录中每个邮件对应一个组件，`ui` 目录中存放共享组件（布局、标题、按钮、链接、标注框）。

`./backend/app/email-templates/` 中渲染好的 HTML 由这些组件生成，是应用实际发送的内容，不应手动编辑。

要在编辑时预览邮件，请在项目根目录启动开发服务器：

```console
$ bun run email:dev
```

来自后端的值在组件 props 中声明为 Jinja 占位符，例如 `username = "{{ username }}"`。每封邮件的上下文在 `./backend/app/utils.py` 的 `generate_*_email()` 函数中构建，因此新增占位符时也需要同步添加到那里。

完成后，重新生成应用使用的模板：

```console
$ bun run email:export
```
