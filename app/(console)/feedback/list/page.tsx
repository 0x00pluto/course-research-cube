import {
  dismissSuggestionAction,
  promoteSuggestionAction,
  reviewFeedbackAction,
} from "@/app/actions";
import { requireUser } from "@/lib/auth";
import { loadFeedbackWorkspace } from "@/lib/feedback-workspace";
import { AppPanel, StatCard } from "@/components/app-panel";

export default async function FeedbackListPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string }>;
}) {
  const params = await searchParams;
  const user = await requireUser();
  const { data, canReview, pending, pendingSuggestions } = await loadFeedbackWorkspace(user);

  return (
    <div className="space-y-3">
      {params.ok ? (
        <p className="rounded-md border border-[#b7eb8f] bg-[#f6ffed] px-4 py-3 text-[13px] text-[#389e0d]">操作已保存。</p>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <StatCard label="反馈总数" value={data.feedbacks.length} />
        <StatCard label="待审核" value={pending.length} />
      </div>

      {canReview && pendingSuggestions.length > 0 ? (
        <AppPanel title="待入库的知识建议" description="审核通过的反馈可一键沉淀为知识库条目。">
          <div className="space-y-2">
            {pendingSuggestions.map((s) => {
              const row = s as { id: number; title: string; content: string; category: string };
              return (
                <div key={row.id} className="rounded-md border border-[#fff7e6] bg-[#fffbe6] p-3 text-[13px]">
                  <p className="font-medium text-[#ad6800]">
                    [{row.category}] {row.title}
                  </p>
                  <p className="mt-1 text-[#646a73]">{row.content}</p>
                  <div className="mt-2 flex gap-3">
                    <form action={promoteSuggestionAction}>
                      <input type="hidden" name="id" value={row.id} />
                      <button type="submit" className="text-[#3370ff]">
                        入库
                      </button>
                    </form>
                    <form action={dismissSuggestionAction}>
                      <input type="hidden" name="id" value={row.id} />
                      <button type="submit" className="text-[#646a73]">
                        忽略
                      </button>
                    </form>
                  </div>
                </div>
              );
            })}
          </div>
        </AppPanel>
      ) : null}

      <AppPanel description="查看全部反馈记录；负责人可审核并生成知识库建议。">
        <div className="space-y-2">
          {data.feedbacks.length === 0 ? (
            <p className="text-[13px] text-[#8f959e]">暂无反馈，可通过问卷或「录入反馈」添加。</p>
          ) : (
            data.feedbacks.map((f) => {
              const row = f as {
                id: number;
                course_id: number;
                feedback_type: string;
                score: number;
                module_name: string;
                content: string;
                review_status: string;
              };
              const statusLabel =
                row.review_status === "APPROVED" ? "已通过" : row.review_status === "REJECTED" ? "已驳回" : "待审核";
              const typeLabel = row.feedback_type === "ORAL" ? "口头" : "问卷";
              return (
                <div key={row.id} className="rounded-md border border-[#eef0f3] p-3 text-[13px]">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-medium text-[#1f2329]">
                      课程 #{row.course_id} · {row.module_name}
                    </span>
                    <span className="text-[#646a73]">
                      {typeLabel} · {row.score} 分 · {statusLabel}
                    </span>
                  </div>
                  <p className="mt-1 text-[#646a73]">{row.content}</p>
                  {canReview && row.review_status === "PENDING" ? (
                    <div className="mt-2 flex gap-3">
                      <form action={reviewFeedbackAction}>
                        <input type="hidden" name="id" value={String(row.id)} />
                        <input type="hidden" name="status" value="APPROVED" />
                        <button className="text-[#3370ff]" type="submit">
                          通过并生成知识建议
                        </button>
                      </form>
                      <form action={reviewFeedbackAction}>
                        <input type="hidden" name="id" value={String(row.id)} />
                        <input type="hidden" name="status" value="REJECTED" />
                        <button type="submit" className="text-[#646a73]">
                          驳回
                        </button>
                      </form>
                    </div>
                  ) : null}
                </div>
              );
            })
          )}
        </div>
      </AppPanel>
    </div>
  );
}
