"use client";

import { useState } from "react";
import { OpcBillingConfirm } from "@/components/opc-billing-confirm";
import { btnPrimary, inputCls } from "@/components/app-panel";

interface ReportGenerateFormProps {
  courses: Array<{ id: number; title: string }>;
  isOpc: boolean;
  opcPoints: number;
  reportGenerateCost?: number;
  minFeedbackForTrend?: number;
  action: (formData: FormData) => void | Promise<void>;
}

export function ReportGenerateForm({
  courses,
  isOpc,
  opcPoints,
  reportGenerateCost = 3,
  minFeedbackForTrend = 3,
  action,
}: ReportGenerateFormProps) {
  const [courseId, setCourseId] = useState(courses[0]?.id ? String(courses[0].id) : "");

  if (courses.length === 0) {
    return <p className="text-[13px] text-[#8f959e]">请先创建课程。</p>;
  }

  return (
    <div className="space-y-2">
      <p className="text-[12px] text-[#8f959e]">
        生成报告需至少 {minFeedbackForTrend} 条已审核反馈。
        {isOpc ? ` OPC 按次扣费 ${reportGenerateCost} 积分。` : ""}
      </p>
      <div className="flex flex-wrap items-end gap-2">
      <select
        className={`${inputCls} min-w-[200px] flex-1`}
        value={courseId}
        onChange={(e) => setCourseId(e.target.value)}
      >
        {courses.map((course) => (
          <option key={course.id} value={course.id}>
            {course.id} - {course.title}
          </option>
        ))}
      </select>
      {isOpc ? (
        <OpcBillingConfirm
          label={`生成分析报告（扣 ${reportGenerateCost} 积分）`}
          cost={reportGenerateCost}
          points={opcPoints}
          action={action}
          formData={{ courseId }}
        />
      ) : (
        <form action={action}>
          <input type="hidden" name="courseId" value={courseId} />
          <button type="submit" className={btnPrimary}>
            生成分析报告
          </button>
        </form>
      )}
      </div>
    </div>
  );
}
