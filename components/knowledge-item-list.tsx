import { reviewKnowledgeAction } from "@/app/actions";
import type { KnowledgeItemRow } from "@/lib/types";

export function KnowledgeItemList({
  items,
  canReview,
  emptyText = "无匹配条目。",
}: {
  items: KnowledgeItemRow[];
  canReview: boolean;
  emptyText?: string;
}) {
  if (items.length === 0) {
    return <p className="text-[13px] text-[#8f959e]">{emptyText}</p>;
  }

  return (
    <div className="space-y-2">
      {items.map((row) => {
        const isNewer = row.updated_at > row.created_at;
        return (
          <div key={row.id} className="rounded-md border border-[#eef0f3] p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-[13px] font-medium text-[#1f2329]">{row.title}</div>
              <div className="flex gap-2 text-[11px]">
                <span className="rounded bg-[#f5f6f7] px-1.5 py-0.5 text-[#646a73]">{row.category}</span>
                <span className="rounded bg-[#edf3ff] px-1.5 py-0.5 text-[#3370ff]">{row.source_kind}</span>
                {row.review_status === "PENDING" ? (
                  <span className="rounded bg-[#fff7e6] px-1.5 py-0.5 text-[#ad6800]">待审核</span>
                ) : null}
                {isNewer ? (
                  <span className="rounded bg-[#e8ffea] px-1.5 py-0.5 text-[#00b42a]">较新版本</span>
                ) : null}
              </div>
            </div>
            <p className="mt-2 text-[12px] text-[#646a73]">{row.content}</p>
            <p className="mt-1 text-[11px] text-[#8f959e]">
              创建 {row.created_at} · 更新 {row.updated_at}
            </p>
            {canReview && row.review_status === "PENDING" ? (
              <div className="mt-2 flex gap-3">
                <form action={reviewKnowledgeAction}>
                  <input type="hidden" name="id" value={String(row.id)} />
                  <input type="hidden" name="status" value="APPROVED" />
                  <button className="text-[13px] text-[#3370ff]" type="submit">
                    通过
                  </button>
                </form>
                <form action={reviewKnowledgeAction}>
                  <input type="hidden" name="id" value={String(row.id)} />
                  <input type="hidden" name="status" value="REJECTED" />
                  <button className="text-[13px] text-[#646a73]" type="submit">
                    驳回
                  </button>
                </form>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
