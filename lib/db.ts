import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";

// @ts-expect-error node:sqlite is runtime-available on current Node.
import { DatabaseSync } from "node:sqlite";

const dataDir = path.join(process.cwd(), "data");
const dbPath = path.join(dataDir, "app.sqlite");
const migrationsDir = path.join(process.cwd(), "supabase", "migrations");

function ensureDir() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

function getDb() {
  ensureDir();
  const db = new DatabaseSync(dbPath);
  db.exec("pragma foreign_keys = on;");
  db.exec(
    "create table if not exists _migrations (name text primary key, applied_at text not null default (datetime('now')));",
  );
  return db;
}

function applyMigrations(db: InstanceType<typeof DatabaseSync>) {
  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();
  for (const file of files) {
    const exists = db
      .prepare("select 1 from _migrations where name = ?")
      .get(file) as { 1: number } | undefined;
    if (exists) continue;
    const sql = fs.readFileSync(path.join(migrationsDir, file), "utf8");
    db.exec("begin;");
    try {
      db.exec(sql);
      db.prepare("insert into _migrations(name) values (?)").run(file);
      db.exec("commit;");
    } catch (error) {
      db.exec("rollback;");
      throw error;
    }
  }
}

function seed(db: InstanceType<typeof DatabaseSync>) {
  const count = db.prepare("select count(*) as c from users").get() as { c: number };
  if (count.c > 0) return;

  db.prepare(
    "insert into users(name,email,password,role,scope,points) values (?,?,?,?,?,?)",
  ).run("内部员工演示", "internal@demo.local", "demo1234", "INTERNAL", "INTERNAL", 0);
  db.prepare(
    "insert into users(name,email,password,role,scope,points) values (?,?,?,?,?,?)",
  ).run("OPC讲师演示", "opc@demo.local", "demo1234", "OPC", "OPC", 30);
  db.prepare(
    "insert into users(name,email,password,role,scope,points) values (?,?,?,?,?,?)",
  ).run("培训负责人演示", "manager@demo.local", "demo1234", "MANAGER", "INTERNAL", 0);
  db.prepare(
    "insert into users(name,email,password,role,scope,points) values (?,?,?,?,?,?)",
  ).run("平台管理员演示", "admin@demo.local", "demo1234", "ADMIN", "INTERNAL", 0);

  const internalId = (
    db.prepare("select id from users where email = ?").get("internal@demo.local") as { id: number }
  ).id;
  const opcId = (db.prepare("select id from users where email = ?").get("opc@demo.local") as { id: number })
    .id;

  db.prepare(
    "insert into knowledge_items(category,title,content,source_kind,scope,review_status,created_by) values (?,?,?,?,?,?,?)",
  ).run(
    "MODULE",
    "多维表格基础协作",
    "围绕表结构、权限、自动化流程讲解企业协作场景。",
    "KNOWLEDGE",
    "INTERNAL",
    "APPROVED",
    internalId,
  );
  db.prepare(
    "insert into knowledge_items(category,title,content,source_kind,scope,review_status,created_by) values (?,?,?,?,?,?,?)",
  ).run(
    "CASE",
    "内容团队周报自动化",
    "通过模板与自动化字段实现内容团队周报生成。",
    "KNOWLEDGE",
    "INTERNAL",
    "APPROVED",
    internalId,
  );
  db.prepare(
    "insert into knowledge_items(category,title,content,source_kind,scope,review_status,created_by) values (?,?,?,?,?,?,?)",
  ).run(
    "TRAINER_TIP",
    "节奏切片法",
    "每 20 分钟一个互动节点，避免纯讲授疲劳。",
    "KNOWLEDGE",
    "OPC",
    "APPROVED",
    opcId,
  );

  db.prepare("insert into strategy_insights(scope,title,insight) values (?,?,?)").run(
    "INTERNAL",
    "高频课型建议",
    "半天公开课在满意度与复用率上表现最佳，建议作为主推课型。",
  );

  seedOpcDemoCourse(db, opcId);
}

function seedOpcDemoCourse(db: InstanceType<typeof DatabaseSync>, opcId: number) {
  const exists = db.prepare("select 1 from courses where owner_id=? and scope='OPC' limit 1").get(opcId);
  if (exists) return;

  db.prepare(
    "insert into knowledge_items(category,title,content,source_kind,scope,review_status,created_by) values (?,?,?,?,?,?,?)",
  ).run(
    "CASE",
    "企业内训破冰案例",
    "通过小组共创降低上手门槛的真实课堂案例。",
    "KNOWLEDGE",
    "OPC",
    "APPROVED",
    opcId,
  );

  const framework = `# OPC 企业内训框架
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

  db.prepare(
    `insert into courses(owner_id,scope,title,course_type,learner_type,core_problem,market_info,user_insight,product_embedding,trainer_tips,framework,framework_modules,status)
     values (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
  ).run(
    opcId,
    "OPC",
    "OPC企业内训示范课",
    "企业内训",
    "企业员工",
    "工具不会用，上手慢",
    "竞品课程偏理论，缺少模板实操。",
    "学员希望带走可复用模板。",
    "演示课研魔方模板库能力。",
    "每 20 分钟安排一次互动。",
    framework,
    modulesJson,
    "RELEASED",
  );
  const courseId = (db.prepare("select last_insert_rowid() as id").get() as { id: number }).id;

  db.prepare(
    "insert into course_outputs(course_id,outline,workbook,deck_package,source_kind,risk_notice) values (?,?,?,?,?,?)",
  ).run(
    courseId,
    `课程《OPC企业内训示范课》大纲\n${framework}`,
    "练习册\n- 练习1：工具操作步骤拆解\n- 作业：下周实践打卡",
    "课件包\n- 问题页\n- 步骤页\n- 复盘页",
    "AI_GENERATED",
    "",
  );

  for (const [module, score, content] of [
    ["整体", 4, "课程结构清晰，学员反馈实用。"],
    ["工具上手演练", 3, "演练时间略紧，希望增加案例。"],
    ["场景案例讨论", 4, "案例贴近业务，互动充分。"],
  ] as const) {
    db.prepare(
      "insert into feedbacks(course_id,feedback_type,score,module_name,content,created_by,review_status) values (?,?,?,?,?,?,?)",
    ).run(courseId, "SURVEY", score, module, content, opcId, "APPROVED");
  }

  const iterationActions = JSON.stringify([
    { module: "工具上手演练", action: "优化练习说明与案例贴近度", priority: "high" },
    { module: "整体", action: "保持模块结构，下期强化作业闭环", priority: "medium" },
  ]);
  db.prepare(
    "insert into quality_reports(course_id,generated_by,report_text,summary_score,iteration_actions) values (?,?,?,?,?)",
  ).run(
    courseId,
    opcId,
    "OPC 示范课质量分析报告\n综合表现良好，建议加强工具演练环节互动。",
    3.67,
    iterationActions,
  );
}

const singleton = (() => {
  const db = getDb();
  applyMigrations(db);
  seed(db);
  seedOpcDemoForExistingDb(db);
  return db;
})();

function seedOpcDemoForExistingDb(db: InstanceType<typeof DatabaseSync>) {
  const opc = db.prepare("select id from users where email=?").get("opc@demo.local") as { id: number } | undefined;
  if (opc) seedOpcDemoCourse(db, opc.id);
}

export function sqlOne<T>(query: string, ...params: unknown[]) {
  return singleton.prepare(query).get(...params) as T | undefined;
}

export function sqlAll<T>(query: string, ...params: unknown[]) {
  return singleton.prepare(query).all(...params) as T[];
}

export function sqlRun(query: string, ...params: unknown[]) {
  return singleton.prepare(query).run(...params);
}

export function withTx<T>(fn: () => T): T {
  singleton.exec("begin;");
  try {
    const result = fn();
    singleton.exec("commit;");
    return result;
  } catch (error) {
    singleton.exec("rollback;");
    throw error;
  }
}

export function createToken() {
  return randomUUID().replaceAll("-", "");
}
