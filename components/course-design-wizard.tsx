"use client";

import { useEffect, useMemo, useState } from "react";
import type { FrameworkModule } from "@/lib/framework";
import {
  COURSE_TYPE_TEMPLATES,
  LEARNER_TEMPLATES,
  PROBLEM_PRESETS,
  getCourseTypeTemplate,
  getLearnerTemplate,
  getProblemPreset,
} from "@/lib/design-templates";
import { DESIGN_STEPS, DESIGN_TARGET_MINUTES, calcDesignProgress } from "@/lib/framework";
import type { KnowledgeRecommendation } from "@/lib/knowledge-recommend";
import { btnPrimary, btnSecondary, inputCls } from "@/components/app-panel";

interface CourseDesignWizardProps {
  action: (formData: FormData) => void | Promise<void>;
  isOpc: boolean;
  opcPoints: number;
  scope: "INTERNAL" | "OPC";
  courseDesignCost?: number;
  errorMessage?: string;
}

export function CourseDesignWizard({
  action,
  isOpc,
  opcPoints,
  scope,
  courseDesignCost = 5,
  errorMessage,
}: CourseDesignWizardProps) {
  const [step, setStep] = useState(0);
  const [recommendations, setRecommendations] = useState<KnowledgeRecommendation[]>([]);
  const [recLoading, setRecLoading] = useState(false);
  const [startedAt] = useState(() => Date.now());
  const [elapsedMin, setElapsedMin] = useState(0);
  const [showConfirm, setShowConfirm] = useState(false);
  const [problemPreset, setProblemPreset] = useState(PROBLEM_PRESETS[0].value);
  const [form, setForm] = useState({
    courseType: COURSE_TYPE_TEMPLATES[0].value,
    learnerType: LEARNER_TEMPLATES[0].value,
    title: "",
    coreProblem: PROBLEM_PRESETS[0].label,
    marketInfo: "",
    userInsight: "",
    productEmbedding: "",
    trainerTips: "",
  });

  const typeTpl = getCourseTypeTemplate(form.courseType);
  const learnerTpl = getLearnerTemplate(form.learnerType);
  const problemTpl = getProblemPreset(problemPreset);

  const previewModules = useMemo((): FrameworkModule[] => {
    const fromLearner = learnerTpl.focusModules.map((title, i) => ({
      id: `learner-${i}`,
      title,
      duration: "15分钟",
      content: "",
    }));
    const fromProblem = (problemTpl?.priorityModules ?? []).map((title, i) => ({
      id: `problem-${i}`,
      title,
      duration: "20分钟",
      content: form.coreProblem,
    }));
    const merged = [...fromLearner];
    for (const m of fromProblem) {
      if (!merged.some((x) => x.title === m.title)) merged.push(m);
    }
    return merged.slice(0, 6);
  }, [learnerTpl, problemTpl, form.coreProblem]);

  useEffect(() => {
    if (step !== 3) return;
    let cancelled = false;
    setRecLoading(true);
    fetch("/api/knowledge/recommend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scope, modules: previewModules }),
    })
      .then((res) => res.json())
      .then((data: { recommendations?: KnowledgeRecommendation[] }) => {
        if (!cancelled) setRecommendations(data.recommendations ?? []);
      })
      .catch(() => {
        if (!cancelled) setRecommendations([]);
      })
      .finally(() => {
        if (!cancelled) setRecLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [step, scope, previewModules]);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedMin(Math.floor((Date.now() - startedAt) / 60000));
    }, 10000);
    return () => clearInterval(timer);
  }, [startedAt]);

  const progress = calcDesignProgress(step);
  const remainingMin = Math.max(0, DESIGN_TARGET_MINUTES - elapsedMin);
  const canAfford = !isOpc || opcPoints >= courseDesignCost;

  const stepValid = useMemo(() => {
    if (step === 0) return !!form.courseType;
    if (step === 1) return !!form.learnerType;
    if (step === 2) return form.title.trim().length > 0 && form.coreProblem.trim().length > 0;
    if (step === 3) {
      return (
        form.marketInfo.trim().length > 0 &&
        form.userInsight.trim().length > 0 &&
        form.productEmbedding.trim().length > 0 &&
        form.trainerTips.trim().length > 0
      );
    }
    return true;
  }, [step, form]);

  function updateField(key: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function onCourseTypeChange(value: string) {
    const tpl = getCourseTypeTemplate(value);
    setForm((prev) => ({
      ...prev,
      courseType: value,
      title: prev.title || `${tpl.defaultTitle}${prev.coreProblem.slice(0, 12)}`,
    }));
  }

  function onProblemPresetChange(value: string) {
    setProblemPreset(value);
    const preset = PROBLEM_PRESETS.find((p) => p.value === value);
    if (preset) updateField("coreProblem", preset.label);
  }

  function handleSubmit() {
    if (isOpc && !canAfford) return;
    if (isOpc && !showConfirm) {
      setShowConfirm(true);
      return;
    }
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.set(k, v));
    fd.set("scope", scope);
    if (isOpc) fd.set("billingConfirmed", "1");
    action(fd);
  }

  return (
    <div>
      {errorMessage ? (
        <p className="mb-3 rounded-md border border-[#ffccc7] bg-[#fff2f0] px-3 py-2 text-[12px] text-[#cf1322]">
          {errorMessage}
        </p>
      ) : null}

      <div className="mb-4 rounded-md border border-[#eef0f3] bg-[#fafbfc] p-4">
        <div className="flex flex-wrap items-center justify-between gap-2 text-[12px] text-[#646a73]">
          <span>
            设计进度 {progress.percent}% · 已用 {elapsedMin} 分钟 · 目标 {DESIGN_TARGET_MINUTES} 分钟内完成
          </span>
          <span className={remainingMin <= 5 ? "text-[#ff7d00]" : ""}>预计剩余 {remainingMin} 分钟</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#eef0f3]">
          <div className="h-full rounded-full bg-[#3370ff] transition-all" style={{ width: `${progress.percent}%` }} />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {DESIGN_STEPS.map((s, i) => (
            <span
              key={s.key}
              className={`rounded px-2 py-0.5 text-[11px] ${
                i === step ? "bg-[#3370ff] text-white" : i < step ? "bg-[#e8ffea] text-[#00b42a]" : "bg-[#f5f6f7] text-[#8f959e]"
              }`}
            >
              {s.label}
            </span>
          ))}
        </div>
        {progress.remaining.length > 0 ? (
          <p className="mt-2 text-[11px] text-[#8f959e]">剩余关键步骤：{progress.remaining.join(" → ")}</p>
        ) : (
          <p className="mt-2 text-[11px] text-[#00b42a]">所有步骤已就绪，可提交生成</p>
        )}
      </div>

      <div className="grid gap-3">
        {step === 0 ? (
          <>
            <p className="text-[13px] text-[#646a73]">{DESIGN_STEPS[0].hint}</p>
            <select className={inputCls} value={form.courseType} onChange={(e) => onCourseTypeChange(e.target.value)}>
              {COURSE_TYPE_TEMPLATES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}（{t.duration}）
                </option>
              ))}
            </select>
            <div className="rounded-md border border-[#edf3ff] bg-[#f5f9ff] p-3 text-[12px] text-[#646a73]">
              <p className="font-medium text-[#3370ff]">课型模板 · {typeTpl.label}</p>
              <p className="mt-1">建议结构：{typeTpl.structure.join(" → ")}</p>
              <ul className="mt-1 list-inside list-disc">
                {typeTpl.hints.map((h) => (
                  <li key={h}>{h}</li>
                ))}
              </ul>
            </div>
          </>
        ) : null}

        {step === 1 ? (
          <>
            <p className="text-[13px] text-[#646a73]">{DESIGN_STEPS[1].hint}</p>
            <select className={inputCls} value={form.learnerType} onChange={(e) => updateField("learnerType", e.target.value)}>
              {LEARNER_TEMPLATES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
            <div className="rounded-md border border-[#edf3ff] bg-[#f5f9ff] p-3 text-[12px] text-[#646a73]">
              <p className="font-medium text-[#3370ff]">学员设计提示</p>
              <ul className="mt-1 list-inside list-disc">
                {learnerTpl.hints.map((h) => (
                  <li key={h}>{h}</li>
                ))}
              </ul>
              <p className="mt-2">优先模块：{learnerTpl.focusModules.join("、")}</p>
            </div>
          </>
        ) : null}

        {step === 2 ? (
          <>
            <p className="text-[13px] text-[#646a73]">{DESIGN_STEPS[2].hint}</p>
            <select className={inputCls} value={problemPreset} onChange={(e) => onProblemPresetChange(e.target.value)}>
              {PROBLEM_PRESETS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
            {problemTpl ? (
              <p className="text-[12px] text-[#8f959e]">推荐模块优先级：{problemTpl.priorityModules.join(" → ")}</p>
            ) : null}
            <input
              className={inputCls}
              placeholder="课程标题"
              value={form.title}
              onChange={(e) => updateField("title", e.target.value)}
            />
            <textarea
              className={inputCls}
              rows={2}
              placeholder="用户问题（可微调）"
              value={form.coreProblem}
              onChange={(e) => updateField("coreProblem", e.target.value)}
            />
          </>
        ) : null}

        {step === 3 ? (
          <>
            <p className="text-[13px] text-[#646a73]">{DESIGN_STEPS[3].hint}</p>
            <textarea
              className={inputCls}
              rows={2}
              placeholder="市场竞品信息"
              value={form.marketInfo}
              onChange={(e) => updateField("marketInfo", e.target.value)}
            />
            <textarea
              className={inputCls}
              rows={2}
              placeholder="用户洞察"
              value={form.userInsight}
              onChange={(e) => updateField("userInsight", e.target.value)}
            />
            <textarea
              className={inputCls}
              rows={2}
              placeholder="产品植入"
              value={form.productEmbedding}
              onChange={(e) => updateField("productEmbedding", e.target.value)}
            />
            <textarea
              className={inputCls}
              rows={2}
              placeholder="授课技巧"
              value={form.trainerTips}
              onChange={(e) => updateField("trainerTips", e.target.value)}
            />
            {recLoading ? (
              <p className="text-[12px] text-[#8f959e]">正在按当前学员与问题匹配知识库…</p>
            ) : null}
            {recommendations.length > 0 ? (
              <div className="rounded-md border border-[#e8f3ff] bg-[#fafbfc] p-3">
                <p className="text-[12px] font-medium text-[#3370ff]">
                  知识库推荐（按「{form.learnerType}」与核心问题匹配）
                </p>
                <div className="mt-2 max-h-48 space-y-2 overflow-y-auto">
                  {recommendations.map((rec) => (
                    <div key={rec.moduleTitle} className="text-[11px] text-[#646a73]">
                      <span className="font-medium text-[#1f2329]">{rec.moduleTitle}</span>
                      {rec.cases.length > 0 ? (
                        <p className="mt-0.5">案例：{rec.cases.map((c) => c.title).join("；")}</p>
                      ) : null}
                      {rec.tips.length > 0 ? (
                        <p>技巧：{rec.tips.map((t) => t.title).join("；")}</p>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </>
        ) : null}

        {step === 4 ? (
          <div className="rounded-md border border-[#eef0f3] bg-[#fafbfc] p-4 text-[13px] text-[#646a73]">
            <p className="font-medium text-[#1f2329]">确认设计信息</p>
            <ul className="mt-2 space-y-1">
              <li>课型：{form.courseType}</li>
              <li>学员：{form.learnerType}</li>
              <li>标题：{form.title}</li>
              <li>问题：{form.coreProblem}</li>
            </ul>
            {isOpc ? (
              <p className="mt-3 rounded-md border border-[#ffe7ba] bg-[#fffbe6] px-3 py-2 text-[12px] text-[#ad6800]">
                提交后将立即扣除 {courseDesignCost} 积分（当前余额 {opcPoints}），中途放弃不退还。
              </p>
            ) : null}
          </div>
        ) : null}
      </div>

      {showConfirm && isOpc ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-5 shadow-lg">
            <h3 className="text-[15px] font-medium text-[#1f2329]">确认计费规则</h3>
            <p className="mt-2 text-[13px] text-[#646a73]">
              点击确认后将扣除 {courseDesignCost} 积分并开始设计。中途放弃不退还本次扣费。
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" className={btnSecondary} onClick={() => setShowConfirm(false)}>
                取消
              </button>
              <button type="button" className={btnPrimary} disabled={!canAfford} onClick={handleSubmit}>
                我已知晓，开始设计
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="mt-4 flex justify-between">
        <button type="button" className={btnSecondary} disabled={step === 0} onClick={() => setStep((s) => Math.max(0, s - 1))}>
          上一步
        </button>
        {step < DESIGN_STEPS.length - 1 ? (
          <button type="button" className={btnPrimary} disabled={!stepValid} onClick={() => setStep((s) => Math.min(DESIGN_STEPS.length - 1, s + 1))}>
            下一步
          </button>
        ) : (
          <button type="button" className={btnPrimary} disabled={!canAfford} onClick={handleSubmit}>
            {isOpc ? `确认并开始设计（扣 ${courseDesignCost} 积分）` : "开始设计并生成输出"}
          </button>
        )}
      </div>
    </div>
  );
}
