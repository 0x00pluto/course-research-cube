import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { AsyncLocalStorage } from "node:async_hooks";
import { createClient, type Client, type Row, type Transaction } from "@libsql/client";
import { migrationsDir, resolveTursoClientConfig } from "@/lib/db-config";

const txStorage = new AsyncLocalStorage<Transaction>();

let clientPromise: Promise<Client> | null = null;
let readyPromise: Promise<void> | null = null;

function getClientPromise(): Promise<Client> {
  if (!clientPromise) {
    const config = resolveTursoClientConfig();
    clientPromise = Promise.resolve(createClient(config));
  }
  return clientPromise;
}

async function getExecutor(): Promise<Client | Transaction> {
  return txStorage.getStore() ?? (await getClientPromise());
}

function splitSqlStatements(sql: string): string[] {
  const stripped = sql.replace(/--[^\n]*/g, "");
  return stripped
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean);
}

function mapRow<T>(row: Row): T {
  return row as unknown as T;
}

async function executeOne<T>(query: string, params: unknown[]): Promise<T | undefined> {
  const executor = await getExecutor();
  const result = await executor.execute({ sql: query, args: params as never[] });
  const row = result.rows[0];
  return row ? mapRow<T>(row) : undefined;
}

async function executeAll<T>(query: string, params: unknown[]): Promise<T[]> {
  const executor = await getExecutor();
  const result = await executor.execute({ sql: query, args: params as never[] });
  return result.rows.map((row) => mapRow<T>(row));
}

async function executeRun(query: string, params: unknown[]) {
  const executor = await getExecutor();
  const result = await executor.execute({ sql: query, args: params as never[] });
  return {
    lastInsertRowid: result.lastInsertRowid != null ? Number(result.lastInsertRowid) : 0,
    changes: result.rowsAffected,
  };
}

async function applyMigrations(client: Client) {
  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  for (const file of files) {
    const exists = await executeOne<{ 1: number }>(
      "select 1 from _migrations where name = ?",
      [file],
    );
    if (exists) continue;

    const sql = fs.readFileSync(path.join(migrationsDir, file), "utf8");
    const statements = splitSqlStatements(sql);
    const tx = await client.transaction("write");
    try {
      for (const statement of statements) {
        await tx.execute(statement);
      }
      await tx.execute({
        sql: "insert into _migrations(name) values (?)",
        args: [file],
      });
      await tx.commit();
    } catch (error) {
      await tx.rollback();
      throw error;
    }
  }
}

async function seedOpcDemoCourse(opcId: number) {
  const exists = await executeOne("select 1 from courses where owner_id=? and scope='OPC' limit 1", [opcId]);
  if (exists) return;

  await executeRun(
    "insert into knowledge_items(category,title,content,source_kind,scope,review_status,created_by) values (?,?,?,?,?,?,?)",
    [
      "CASE",
      "企业内训破冰案例",
      "通过小组共创降低上手门槛的真实课堂案例。",
      "KNOWLEDGE",
      "OPC",
      "APPROVED",
      opcId,
    ],
  );

  const framework = `# 企业内训课程框架
1) 破冰与目标对齐（10分钟）
2) 工具上手演练（40分钟）
3) 场景案例讨论（30分钟）
4) 复盘与行动计划（10分钟）`;
  const modulesJson = JSON.stringify([
    { id: "1", title: "破冰与目标对齐", duration: "10分钟", content: "" },
    { id: "2", title: "工具上手演练", duration: "40分钟", content: "工具不会用，上手慢" },
    { id: "3", title: "场景案例讨论", duration: "30分钟", content: "" },
    { id: "4", title: "复盘与行动计划", duration: "10分钟", content: "" },
  ]);

  const inserted = await executeRun(
    `insert into courses(owner_id,scope,title,course_type,learner_type,core_problem,market_info,user_insight,product_embedding,trainer_tips,framework,framework_modules,status)
     values (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [
      opcId,
      "OPC",
      "企业内训：工具上手与案例演练",
      "企业内训",
      "企业员工",
      "工具不会用，上手慢",
      "竞品课程偏理论，缺少模板实操。",
      "学员希望带走可复用模板。",
      "结合模板库与实操环节，展示可复用的企业培训方法。",
      "每 20 分钟安排一次互动。",
      framework,
      modulesJson,
      "RELEASED",
    ],
  );
  const courseId = inserted.lastInsertRowid;

  await executeRun(
    "insert into course_outputs(course_id,outline,workbook,deck_package,source_kind,risk_notice) values (?,?,?,?,?,?)",
    [
      courseId,
      `课程《企业内训：工具上手与案例演练》大纲\n${framework}`,
      "练习册\n- 练习1：工具操作步骤拆解\n- 作业：下周实践打卡",
      "课件包\n- 问题页\n- 步骤页\n- 复盘页",
      "AI_GENERATED",
      "",
    ],
  );

  for (const [module, score, content] of [
    ["整体", 4, "课程结构清晰，学员反馈实用。"],
    ["工具上手演练", 3, "演练时间略紧，希望增加案例。"],
    ["场景案例讨论", 4, "案例贴近业务，互动充分。"],
  ] as const) {
    await executeRun(
      "insert into feedbacks(course_id,feedback_type,score,module_name,content,created_by,review_status) values (?,?,?,?,?,?,?)",
      [courseId, "SURVEY", score, module, content, opcId, "APPROVED"],
    );
  }

  const iterationActions = JSON.stringify([
    { module: "工具上手演练", action: "优化练习说明与案例贴近度", priority: "high" },
    { module: "整体", action: "保持模块结构，下期强化作业闭环", priority: "medium" },
  ]);
  await executeRun(
    "insert into quality_reports(course_id,generated_by,report_text,summary_score,iteration_actions) values (?,?,?,?,?)",
    [
      courseId,
      opcId,
      "OPC 企业内训课 · 质量分析报告\n综合表现良好，建议加强工具演练环节互动。",
      3.67,
      iterationActions,
    ],
  );
}

async function seed() {
  const count = await executeOne<{ c: number }>("select count(*) as c from users", []);
  if ((count?.c ?? 0) > 0) return;

  await executeRun(
    "insert into users(name,email,password,role,scope,points) values (?,?,?,?,?,?)",
    ["陈明", "internal@demo.local", "demo1234", "INTERNAL", "INTERNAL", 0],
  );
  await executeRun(
    "insert into users(name,email,password,role,scope,points) values (?,?,?,?,?,?)",
    ["李悦", "opc@demo.local", "demo1234", "OPC", "OPC", 30],
  );
  await executeRun(
    "insert into users(name,email,password,role,scope,points) values (?,?,?,?,?,?)",
    ["王芳", "manager@demo.local", "demo1234", "MANAGER", "INTERNAL", 0],
  );
  await executeRun(
    "insert into users(name,email,password,role,scope,points) values (?,?,?,?,?,?)",
    ["系统管理员", "admin@demo.local", "demo1234", "ADMIN", "INTERNAL", 0],
  );

  const internalId = (
    await executeOne<{ id: number }>("select id from users where email = ?", ["internal@demo.local"])
  )!.id;
  const opcId = (await executeOne<{ id: number }>("select id from users where email = ?", ["opc@demo.local"]))!.id;

  await executeRun(
    "insert into knowledge_items(category,title,content,source_kind,scope,review_status,created_by) values (?,?,?,?,?,?,?)",
    [
      "MODULE",
      "多维表格基础协作",
      "围绕表结构、权限、自动化流程讲解企业协作场景。",
      "KNOWLEDGE",
      "INTERNAL",
      "APPROVED",
      internalId,
    ],
  );
  await executeRun(
    "insert into knowledge_items(category,title,content,source_kind,scope,review_status,created_by) values (?,?,?,?,?,?,?)",
    [
      "CASE",
      "内容团队周报自动化",
      "通过模板与自动化字段实现内容团队周报生成。",
      "KNOWLEDGE",
      "INTERNAL",
      "APPROVED",
      internalId,
    ],
  );
  await executeRun(
    "insert into knowledge_items(category,title,content,source_kind,scope,review_status,created_by) values (?,?,?,?,?,?,?)",
    [
      "TRAINER_TIP",
      "节奏切片法",
      "每 20 分钟一个互动节点，避免纯讲授疲劳。",
      "KNOWLEDGE",
      "OPC",
      "APPROVED",
      opcId,
    ],
  );

  await executeRun("insert into strategy_insights(scope,title,insight) values (?,?,?)", [
    "INTERNAL",
    "高频课型建议",
    "半天公开课在满意度与复用率上表现最佳，建议作为主推课型。",
  ]);

  await seedOpcDemoCourse(opcId);
}

async function seedOpcDemoForExistingDb() {
  const opc = await executeOne<{ id: number }>("select id from users where email=?", ["opc@demo.local"]);
  if (opc) await seedOpcDemoCourse(opc.id);
}

async function ensureSchemaAndMigrations() {
  const client = await getClientPromise();
  await client.execute("pragma foreign_keys = on");
  await client.execute(
    "create table if not exists _migrations (name text primary key, applied_at text not null default (datetime('now')))",
  );
  await applyMigrations(client);
}

/** CLI / db:seed：先迁移，再写入演示数据（用户表为空才写基础种子；OPC 示例课可补全） */
export async function runDbSeed() {
  await ensureSchemaAndMigrations();
  const usersBefore = (await executeOne<{ c: number }>("select count(*) as c from users", []))?.c ?? 0;
  await seed();
  await seedOpcDemoForExistingDb();
  const usersAfter = (await executeOne<{ c: number }>("select count(*) as c from users", []))?.c ?? 0;
  const opcDemo = await executeOne(
    "select 1 from courses c join users u on u.id=c.owner_id where u.email=? and c.scope='OPC' limit 1",
    ["opc@demo.local"],
  );
  return {
    usersBefore,
    usersAfter,
    baseSeedInserted: usersBefore === 0 && usersAfter > 0,
    opcDemoPresent: Boolean(opcDemo),
  };
}

async function ensureDbReady() {
  await ensureSchemaAndMigrations();

  if (process.env.NODE_ENV !== "production") {
    await seed();
    await seedOpcDemoForExistingDb();
  }
}

function ensureReady(): Promise<void> {
  if (!readyPromise) {
    readyPromise = ensureDbReady();
  }
  return readyPromise;
}

export async function sqlOne<T>(query: string, ...params: unknown[]) {
  await ensureReady();
  return executeOne<T>(query, params);
}

export async function sqlAll<T>(query: string, ...params: unknown[]) {
  await ensureReady();
  return executeAll<T>(query, params);
}

export async function sqlRun(query: string, ...params: unknown[]) {
  await ensureReady();
  return executeRun(query, params);
}

export async function withTx<T>(fn: () => Promise<T>): Promise<T> {
  await ensureReady();
  const client = await getClientPromise();
  const tx = await client.transaction("write");
  return txStorage.run(tx, async () => {
    try {
      const result = await fn();
      await tx.commit();
      return result;
    } catch (error) {
      await tx.rollback();
      throw error;
    }
  });
}

export function createToken() {
  return randomUUID().replaceAll("-", "");
}
