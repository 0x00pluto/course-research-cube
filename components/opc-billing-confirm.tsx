"use client";

import { useState } from "react";
import { btnPrimary, btnSecondary } from "@/components/app-panel";

interface OpcBillingConfirmProps {
  label: string;
  cost: number;
  points: number;
  action: (formData: FormData) => void | Promise<void>;
  formData: Record<string, string>;
  disabled?: boolean;
}

export function OpcBillingConfirm({ label, cost, points, action, formData, disabled }: OpcBillingConfirmProps) {
  const [open, setOpen] = useState(false);
  const canAfford = points >= cost;

  function submit() {
    const fd = new FormData();
    Object.entries(formData).forEach(([k, v]) => fd.set(k, v));
    fd.set("billingConfirmed", "1");
    action(fd);
    setOpen(false);
  }

  return (
    <>
      <button
        type="button"
        className={btnPrimary}
        disabled={disabled || !canAfford}
        onClick={() => setOpen(true)}
      >
        {label}
      </button>
      {!canAfford ? (
        <p className="mt-1 text-[12px] text-[#cf1322]">余额不足（需要 {cost} 积分，当前 {points}），请先充值。</p>
      ) : null}
      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-5 shadow-lg">
            <h3 className="text-[15px] font-medium text-[#1f2329]">确认扣费</h3>
            <p className="mt-2 text-[13px] text-[#646a73]">
              本次操作将扣除 {cost} 积分（当前余额 {points}）。确认后将立即扣费，中途放弃不退还。
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" className={btnSecondary} onClick={() => setOpen(false)}>
                取消
              </button>
              <button type="button" className={btnPrimary} onClick={submit}>
                我已知晓，确认
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
