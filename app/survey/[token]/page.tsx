import { getSurveyByToken, getSurveyModuleOptions } from "@/lib/services";
import { SurveyForm } from "@/components/survey-form";

interface Props {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ thanks?: string; error?: string }>;
}

const pageShell = "mx-auto min-h-screen max-w-lg bg-white px-4 py-10";
const cardCls = "rounded-lg border border-[#dee0e3] bg-white p-6";

export default async function SurveyPage(props: Props) {
  const { token } = await props.params;
  const query = await props.searchParams;
  const survey = getSurveyByToken(token);

  if (query.thanks === "1") {
    return (
      <main className={pageShell}>
        <section className={`${cardCls} text-center`}>
          <h1 className="text-lg font-medium text-[#1f2329]">感谢反馈</h1>
          <p className="mt-2 text-[13px] text-[#646a73]">您的问卷已提交，将进入审核流程。</p>
        </section>
      </main>
    );
  }

  if (!survey) {
    return (
      <main className={pageShell}>
        <section className={`${cardCls} text-center`}>
          <h1 className="text-lg font-medium text-[#1f2329]">问卷已关闭或不存在</h1>
          <p className="mt-2 text-[13px] text-[#8f959e]">请联系授课老师获取有效链接。</p>
        </section>
      </main>
    );
  }

  const moduleOptions = getSurveyModuleOptions(token);

  return (
    <main className={pageShell}>
      <section className={cardCls}>
        <p className="text-[12px] text-[#8f959e]">课研魔方 · 课后问卷</p>
        <h1 className="mt-1 text-[18px] font-semibold text-[#1f2329]">{survey.title}</h1>
        {query.error ? (
          <p className="mt-2 text-[13px] text-[#cf1322]">{query.error}</p>
        ) : (
          <p className="mt-2 text-[13px] text-[#646a73]">请如实填写，提交后将进入审核流程。</p>
        )}

        <SurveyForm token={token} moduleOptions={moduleOptions} />
      </section>
    </main>
  );
}
