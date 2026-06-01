"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { submitSurveyAction } from "@/app/actions";
import { btnPrimary, inputCls } from "@/components/app-panel";
import { cn } from "@/lib/utils";

export function SurveyForm({
  token,
  moduleOptions,
}: {
  token: string;
  moduleOptions: string[];
}) {
  const [score, setScore] = useState(5);
  const [hoverScore, setHoverScore] = useState(0);

  const displayScore = hoverScore || score;

  return (
    <form action={submitSurveyAction} className="mt-6 grid gap-4">
      <input type="hidden" name="token" value={token} />
      <input type="hidden" name="score" value={score} />

      <label className="grid gap-1.5">
        <span className="text-[13px] text-[#646a73]">您的称呼（可选）</span>
        <input name="respondentLabel" className={inputCls} placeholder="如：张同学" />
      </label>

      <label className="grid gap-1.5">
        <span className="text-[13px] text-[#646a73]">评价哪个模块</span>
        <select name="moduleName" className={inputCls} defaultValue={moduleOptions[0]} required>
          {moduleOptions.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </label>

      <div className="grid gap-1.5">
        <span className="text-[13px] text-[#646a73]">满意度评分</span>
        <div className="flex items-center gap-1" role="radiogroup" aria-label="满意度评分">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              className="rounded p-0.5 transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3370ff]"
              aria-label={`${n} 星`}
              onMouseEnter={() => setHoverScore(n)}
              onMouseLeave={() => setHoverScore(0)}
              onClick={() => setScore(n)}
            >
              <Star
                className={cn(
                  "h-8 w-8",
                  n <= displayScore ? "fill-[#fadb14] text-[#fadb14]" : "fill-none text-[#dee0e3]",
                )}
                strokeWidth={1.5}
              />
            </button>
          ))}
          <span className="ml-2 text-[14px] text-[#646a73]">{displayScore} 分</span>
        </div>
      </div>

      <label className="grid gap-1.5">
        <span className="text-[13px] text-[#646a73]">反馈与建议</span>
        <textarea name="content" className={inputCls} rows={4} placeholder="请描述您的学习体验与改进建议" required />
      </label>

      <button type="submit" className={btnPrimary}>
        提交问卷
      </button>
    </form>
  );
}
