import { addKnowledgeAction, promoteSuggestionAction } from "@/app/actions";
import { requireUser } from "@/lib/auth";
import { listKnowledgeSuggestions } from "@/lib/services";
import { AppPanel, btnSecondary, inputCls } from "@/components/app-panel";

export default async function KnowledgeNewPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string }>;
}) {
  const params = await searchParams;
  const user = await requireUser();
  const canReview = user.role === "MANAGER" || user.role === "ADMIN";
  const suggestions = canReview
    ? (await listKnowledgeSuggestions(user)).filter((s) => (s as { status: string }).status === "PENDING")
    : [];

  return (
    <div className="space-y-3">
      {params.ok ? (
        <p className="rounded-md border border-[#b7eb8f] bg-[#f6ffed] px-4 py-3 text-[13px] text-[#389e0d]">
          知识条目已提交，待审核通过后将进入正式库。
        </p>
      ) : null}

      {suggestions.length > 0 ? (
        <AppPanel title="来自反馈的知识建议" description="审核通过的反馈可一键沉淀为知识条目。">
          <div className="space-y-2">
            {suggestions.map((s) => {
              const row = s as { id: number; title: string; content: string };
              return (
                <div key={row.id} className="flex justify-between rounded-md border border-[#eef0f3] p-3 text-[12px]">
                  <div>
                    <p className="font-medium text-[#1f2329]">{row.title}</p>
                    <p className="text-[#646a73]">{row.content}</p>
                  </div>
                  <form action={promoteSuggestionAction}>
                    <input type="hidden" name="id" value={row.id} />
                    <button type="submit" className="text-[#3370ff]">
                      入库
                    </button>
                  </form>
                </div>
              );
            })}
          </div>
        </AppPanel>
      ) : null}

      <AppPanel description="设计中发现缺项时可回填，待审核后进入正式库。">
        <form action={addKnowledgeAction} className="grid max-w-2xl gap-2">
          <select name="category" className={inputCls}>
            <option value="MODULE">功能模块</option>
            <option value="CASE">案例素材</option>
            <option value="TRAINER_TIP">讲师技巧</option>
          </select>
          <select name="scope" className={inputCls} defaultValue={user.scope}>
            <option value="INTERNAL">内部</option>
            <option value="OPC">OPC</option>
          </select>
          <input name="title" required placeholder="知识标题" className={inputCls} />
          <textarea name="content" required placeholder="知识内容" className={inputCls} rows={6} />
          <button className={`${btnSecondary} w-fit`} type="submit">
            提交知识条目
          </button>
        </form>
      </AppPanel>
    </div>
  );
}
