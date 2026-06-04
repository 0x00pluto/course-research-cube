import { resolveTursoClientConfig } from "../lib/db-config";
import { runDbSeed } from "../lib/db";

async function main() {
  const config = resolveTursoClientConfig();
  const target = config.url.startsWith("file:") ? config.url : "Turso (libsql)";

  const result = await runDbSeed();

  if (result.baseSeedInserted) {
    console.log(`已在 ${target} 写入演示账号与基础数据（${result.usersAfter} 个用户）。`);
  } else {
    console.log(`基础演示数据已跳过（当前已有 ${result.usersBefore} 个用户，仅空库会写入）。`);
  }

  if (result.opcDemoPresent) {
    console.log("OPC 示例课程/报告数据已就绪。");
  } else {
    console.log("未检测到 OPC 示例课程（请确认存在 opc@demo.local 用户）。");
  }

  console.log("Seed done.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
