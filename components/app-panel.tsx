import type { ReactNode } from "react";

export const inputCls =
  "w-full rounded-md border border-[#dee0e3] bg-white px-3 py-2 text-[13px] outline-none focus:border-[#3370ff]";
export const btnPrimary = "rounded-md bg-[#3370ff] px-4 py-2 text-[13px] text-white hover:bg-[#2860e1]";
export const btnSecondary =
  "rounded-md border border-[#dee0e3] bg-white px-4 py-2 text-[13px] text-[#646a73] hover:bg-[#f5f6f7]";
export const cardCls = "rounded-lg border border-[#dee0e3] bg-white p-5 shadow-[0_1px_2px_rgba(31,35,41,0.04)]";

export function AppPanel({
  title,
  description,
  children,
}: {
  title?: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className={cardCls}>
      {title ? <h2 className="text-[16px] font-medium text-[#1f2329]">{title}</h2> : null}
      {description ? (
        <p className={title ? "mt-1 text-[13px] text-[#8f959e]" : "text-[13px] text-[#8f959e]"}>{description}</p>
      ) : null}
      <div className={title || description ? "mt-4" : ""}>{children}</div>
    </section>
  );
}

export function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-md border border-[#eef0f3] bg-[#fafbfc] p-3">
      <div className="text-[12px] text-[#8f959e]">{label}</div>
      <div className="mt-1 text-[20px] font-semibold text-[#1f2329]">{value}</div>
    </div>
  );
}
