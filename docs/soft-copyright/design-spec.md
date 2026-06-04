# 课研魔方课程设计与质量分析平台 V1.0 — 设计说明书

版本：V1.0　编写目的：说明本软件的系统结构、功能划分、业务流程、数据设计与主要界面，供软件著作权登记使用。

适用对象：内部员工、培训负责人、OPC 讲师、平台管理员。

---

## 一、概述

本系统为 B/S 架构 Web 应用，将培训课程设计中的隐性经验转化为可执行规则，支持内部员工与合作 OPC 讲师在约 30 分钟内形成可用课程设计初稿，并通过课后反馈与质量分析形成持续迭代闭环。系统涵盖课程设计中心、知识库中心、反馈分析中心、OPC 积分运营、报告分享与管理后台，并实现内部与 OPC 数据域隔离。

## 二、系统总体设计

### 2.1 技术架构

| 层级 | 技术选型 |
|------|----------|
| 表现层 | Next.js 16 App Router、React 19、Tailwind CSS 4、shadcn/ui |
| 业务层 | Server Actions、`lib/*` 领域服务、Route Handlers |
| 认证 | Cookie 会话（`kymf_session`）+ SQLite 会话表 |
| 权限 | 角色 INTERNAL / OPC / MANAGER / ADMIN + 数据 scope 隔离 |
| 持久化 | SQLite（Node.js DatabaseSync）+ SQL 迁移脚本 |
| 外部能力 | 知识推荐、市场与 LLM、支付等外部接口（Route Handler 封装） |

### 2.2 部署形态

客户端使用 Chrome/Edge 等现代浏览器访问；服务端以 `pnpm dev` / `pnpm start` 运行 Node.js 进程。数据库文件位于 `data/app.sqlite`，通过 `scripts/db-migrate.mjs` 应用 `supabase/migrations` 下 SQL 迁移。路由守卫由 `proxy.ts` 与 `lib/auth.ts` 协同完成。

## 三、功能结构设计

| 模块 | 主要功能 | 路由/入口 |
|------|----------|-----------|
| 认证 | 邮箱密码登录、会话校验 | `/login` |
| 工作台 | 设计进度、快捷入口、待办提示 | `/dashboard` |
| 课程设计 | 向导式发起设计、框架编辑、成果输出 | `/courses/design`、`/courses/my`、`/courses/versions` |
| 知识库 | 检索、新增、列表与审核状态 | `/knowledge/search`、`/knowledge/new`、`/knowledge/list` |
| 反馈分析 | 问卷、录入、列表、质量分析 | `/feedback/survey` 等 |
| 质量看板 | 管理层指标趋势 | `/analytics` |
| 报告分享 | 报告生成、对外分享链接 | `/reports/analysis`、`/reports/share` |
| OPC 积分 | 余额、扣费记录、规则说明 | `/opc` |
| 管理后台 | 双侧课程全景、课程详情 | `/admin`、`/admin/courses/[id]` |
| 公开页 | 学员问卷、企业分享展示 | `/survey/[token]`、`/share/[token]` |

## 四、核心业务流程设计

### 4.1 课程设计主流程

1. 用户选择课型、目标学员与核心用户问题，建立设计上下文。
2. 填写市场竞品、用户洞察、产品植入、授课技巧四类输入。
3. 系统基于模板与知识库推荐课程框架草案。
4. 用户在框架编辑器中增删模块、调整顺序与重点。
5. 生成课程大纲、练习册、课件包，并标注来源与缺失风险。

### 4.2 反馈闭环流程

1. 课程交付后，培训师发起课后问卷或补录口头反馈。
2. 反馈进入待审核队列，负责人审核通过后纳入分析。
3. 系统汇总整体评分与模块级反馈，生成迭代建议。
4. 设计人员基于建议改版课程，形成新版本并可版本对比。

### 4.3 OPC 积分与分享流程

1. OPC 讲师查看积分余额，点击开始设计时按次扣费。
2. 具备反馈数据后按次生成质量分析报告，重复查看不重复扣费。
3. 讲师在报告模块创建分享链接，企业客户通过链接查看摘要页。
4. 内部员工与 OPC 前台数据互不可见，管理员可在后台全量查看。

## 五、数据库设计

主要数据表（SQLite）：

| 表名 | 说明 |
|------|------|
| users / sessions | 用户账号、角色、scope、积分与会话 |
| courses / course_outputs | 课程主档、版本、框架与三类输出物 |
| knowledge_items | 功能模块、案例、技巧及审核状态 |
| feedbacks | 问卷与口头反馈、评分与审核 |
| course_surveys / survey_responses | 公开问卷与回收答案 |
| quality_reports | 质量分析报告 |
| share_links | OPC 对外分享令牌与有效期 |
| point_ledger | OPC 积分扣费流水 |
| platform_settings | 平台运营配置 |

## 六、接口设计概要

| 接口 | 用途 |
|------|------|
| Server Actions（`app/actions.ts`） | 登录、课程设计提交、知识/反馈/报告/分享等业务写操作 |
| GET/POST `/api/courses/[id]/download` | 课程成果下载 |
| POST `/api/knowledge/recommend` | 知识推荐 |
| POST `/api/external/llm` | 大模型辅助 |
| POST `/api/external/market` | 市场信息辅助 |
| POST `/api/external/payment` | 支付/充值相关（预留） |

## 七、界面设计

以下为核心界面说明及系统运行截图。

### 7.1 系统登录与工作台

邮箱密码登录入口；登录后工作台聚合课程设计、知识库、反馈与报告入口。

### 7.2 课程设计中心

发起设计向导、我的课程列表与版本对比界面。

### 7.3 知识库与反馈分析

知识检索、质量分析看板及反馈处理相关界面。

### 7.4 报告、OPC 与管理

质量报告、OPC 积分页与平台管理后台界面。
