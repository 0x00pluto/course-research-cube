# 课研魔方 · Keyan Cube

企业培训课程设计与质量分析平台（Next.js 全栈 + SQLite）。

## 能做什么

- **课程设计**：按课型/学员/问题推荐框架，生成大纲、练习册、课件包
- **知识库**：模块、案例、讲师技巧检索与沉淀
- **反馈分析**：课后问卷、反馈审核、模块评分与质量看板
- **报告分享**：质量报告归档，OPC 可生成对外分享页
- **OPC 运营**：积分余额、按次扣费（开始设计、生成报告）

## 快速开始

环境：**Node.js 20+**，包管理器推荐 **pnpm**。

```bash
pnpm install
pnpm dev
```

浏览器打开 [http://localhost:3000](http://localhost:3000)，从首页或 `/login` 登录。

首次启动会自动执行数据库迁移，并在空库时写入演示数据（`data/app.sqlite`）。

## 演示账号

密码均为 **`demo1234`**（仅用于本地演示，勿用于生产）。

| 角色 | 邮箱 | 说明 |
|------|------|------|
| 内部讲师 | `internal@demo.local` | 课程设计、知识库（内部域） |
| 合作讲师（OPC） | `opc@demo.local` | OPC 课程与积分；预置 30 积分、示例课程/报告 |
| 培训负责人 | `manager@demo.local` | 质量看板、反馈分析 |
| 平台管理员 | `admin@demo.local` | 管理后台、内外课程总览 |

## 无需登录

| 路径 | 说明 |
|------|------|
| `/share/demo` | 对外分享页版式预览（非真实报告数据） |
| `/survey/<token>` | 课后问卷；token 由登录后在「反馈 → 课后问卷」创建 |

## 重置演示数据

删除本地库后重启开发服务即可重新种子化：

```bash
rm -f data/app.sqlite
pnpm dev
```

## 常用命令

| 命令 | 说明 |
|------|------|
| `pnpm dev` | 开发服务 |
| `pnpm build` / `pnpm start` | 构建与生产运行 |
| `pnpm db:migrate` | 手动执行迁移（一般不必，启动时已自动迁移） |

## 技术栈

Next.js 16 · React 19 · TypeScript · SQLite（`node:sqlite`）
