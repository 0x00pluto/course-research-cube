"use client";

import { useState } from "react";
import type { FrameworkModule } from "@/lib/framework";
import { btnPrimary, btnSecondary, inputCls } from "@/components/app-panel";

interface CourseFrameworkEditorProps {
  courseId: number;
  initialModules: FrameworkModule[];
  action: (formData: FormData) => void | Promise<void>;
}

export function CourseFrameworkEditor({ courseId, initialModules, action }: CourseFrameworkEditorProps) {
  const [modules, setModules] = useState<FrameworkModule[]>(initialModules);

  function updateModule(index: number, patch: Partial<FrameworkModule>) {
    setModules((prev) => prev.map((m, i) => (i === index ? { ...m, ...patch } : m)));
  }

  function addModule() {
    setModules((prev) => [
      ...prev,
      { id: `m-${Date.now()}`, title: "新模块", duration: "15分钟", content: "" },
    ]);
  }

  function removeModule(index: number) {
    setModules((prev) => prev.filter((_, i) => i !== index));
  }

  function moveModule(index: number, dir: -1 | 1) {
    const next = index + dir;
    if (next < 0 || next >= modules.length) return;
    setModules((prev) => {
      const copy = [...prev];
      [copy[index], copy[next]] = [copy[next], copy[index]];
      return copy;
    });
  }

  function handleSave() {
    const fd = new FormData();
    fd.set("courseId", String(courseId));
    fd.set("modulesJson", JSON.stringify(modules));
    action(fd);
  }

  return (
    <div className="mt-3 space-y-3 rounded-md border border-[#eef0f3] p-3">
      <p className="text-[13px] font-medium text-[#1f2329]">框架编辑（增删模块、调整顺序与内容）</p>
      {modules.map((mod, index) => (
        <div key={mod.id} className="rounded-md border border-[#dee0e3] bg-[#fafbfc] p-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[12px] text-[#8f959e]">#{index + 1}</span>
            <input
              className={`${inputCls} min-w-[120px] flex-1`}
              value={mod.title}
              onChange={(e) => updateModule(index, { title: e.target.value })}
              placeholder="模块标题"
            />
            <input
              className={`${inputCls} w-24`}
              value={mod.duration}
              onChange={(e) => updateModule(index, { duration: e.target.value })}
              placeholder="时长"
            />
            <button type="button" className="text-[12px] text-[#646a73]" onClick={() => moveModule(index, -1)}>
              上移
            </button>
            <button type="button" className="text-[12px] text-[#646a73]" onClick={() => moveModule(index, 1)}>
              下移
            </button>
            <button type="button" className="text-[12px] text-[#f53f3f]" onClick={() => removeModule(index)}>
              删除
            </button>
          </div>
          <textarea
            className={`${inputCls} mt-2`}
            rows={2}
            value={mod.content}
            onChange={(e) => updateModule(index, { content: e.target.value })}
            placeholder="模块要点"
          />
        </div>
      ))}
      <div className="flex gap-2">
        <button type="button" className={btnSecondary} onClick={addModule}>
          添加模块
        </button>
        <button type="button" className={btnPrimary} onClick={handleSave}>
          保存框架并重新生成输出物
        </button>
      </div>
    </div>
  );
}
