import Link from 'next/link';
import FeatureCard from '@/components/FeatureCard';

/* ── Icons ── */
function SparkleIcon() {
  return (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
    </svg>
  );
}
function DocIcon() {
  return (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  );
}
function WebIcon() {
  return (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
    </svg>
  );
}

function AudienceCard({ emoji, title, desc }: { emoji: string; title: string; desc: string }) {
  return (
    <div className="group p-5 bg-white/70 backdrop-blur rounded-2xl border border-gray-100 hover:border-indigo-100 hover:shadow-sm transition-all duration-300 text-center">
      <div className="text-3xl mb-3">{emoji}</div>
      <h4 className="font-semibold text-gray-900 mb-1 text-sm">{title}</h4>
      <p className="text-gray-400 text-xs leading-relaxed">{desc}</p>
    </div>
  );
}

function WorkflowStep({ num, title, desc }: { num: number; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-4">
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-md shadow-indigo-500/20">
        {num}
      </div>
      <div>
        <h4 className="font-semibold text-gray-900 text-sm mb-0.5">{title}</h4>
        <p className="text-gray-400 text-xs leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-purple-50" />
        <div className="absolute top-10 -left-32 w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob" />
        <div className="absolute top-32 -right-32 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000" />
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[600px] h-64 bg-gradient-to-r from-indigo-200/30 to-purple-200/30 rounded-full filter blur-3xl opacity-30" />

        <div className="relative max-w-6xl mx-auto px-4 pt-24 pb-16 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 border border-indigo-100 rounded-full text-xs text-indigo-600 font-medium mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
            面向大学生的 AI 作品集生成平台
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-5 tracking-tight leading-tight">
            <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-400 bg-clip-text text-transparent">
              Portfolio AI
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 mb-3 font-medium">
            不只帮你写介绍，而是帮你把零散经历整理成一份可展示的求职作品集
          </p>
          <p className="text-gray-500 max-w-lg mx-auto mb-10 leading-relaxed text-sm">
            专为设计类、艺术类、传媒类大学生打造。输入你的经历，AI 帮你提炼亮点、组织表达、生成可直接展示的作品集网页。
          </p>

          <Link
            href="/form"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-2xl hover:shadow-xl hover:shadow-indigo-500/30 transition-all duration-300 hover:-translate-y-0.5"
          >
            开始生成作品集
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>
      </section>

      {/* ── Feature Cards ── */}
      <section className="max-w-6xl mx-auto px-4 pb-16">
        <div className="grid md:grid-cols-3 gap-5 max-w-4xl mx-auto">
          <FeatureCard
            icon={<SparkleIcon />}
            title="AI 优化个人介绍"
            description="输入基本信息和经历，AI 自动优化语言表达，让你的自我介绍更专业、更有记忆点。"
          />
          <FeatureCard
            icon={<DocIcon />}
            title="智能生成项目说明"
            description="基于你填写的项目经历，生成结构清晰、亮点突出的项目描述，突出你的贡献与能力。"
          />
          <FeatureCard
            icon={<WebIcon />}
            title="一键生成作品集网页"
            description="所有内容自动排版为精美的作品集网页，可直接分享链接或导出 PDF 用于求职投递。"
          />
        </div>
      </section>

      {/* ── 适合人群 ── */}
      <section className="bg-gradient-to-b from-white to-gray-50 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">适合这样的你</h2>
            <p className="text-gray-400 text-sm">无论你是哪个阶段，Portfolio AI 都能帮你迈出作品集的第一步</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <AudienceCard emoji="🎓" title="毕业求职学生" desc="即将面临秋招/春招，需要一份专业作品集来展示自己" />
            <AudienceCard emoji="🎨" title="设计类/艺术类学生" desc="有自己的作品，但不知如何包装成打动人心的求职作品集" />
            <AudienceCard emoji="🌱" title="作品集基础薄弱" desc="没有太多经验，不知道从哪里开始，需要结构化的引导和模板" />
            <AudienceCard emoji="🤖" title="想用AI提升求职材料" desc="已有基础内容，想借助 AI 让表达更专业、更有竞争力" />
          </div>
        </div>
      </section>

      {/* ── 生成流程 ── */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">4 步生成你的作品集</h2>
            <p className="text-gray-400 text-sm">从填写信息到生成网页，只需几分钟</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <WorkflowStep num={1} title="填写信息" desc="输入你的基本资料、技能、项目经历和求职意向" />
            <WorkflowStep num={2} title="AI 提炼亮点" desc="AI 分析你的经历，自动提炼求职亮点与核心能力标签" />
            <WorkflowStep num={3} title="生成作品集结构" desc="AI 为你规划作品集页面结构，优化组织与表达逻辑" />
            <WorkflowStep num={4} title="预览作品集页面" desc="一键生成完整的作品集网页，可直接分享或导出为 PDF" />
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-12">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-10 md:p-14 shadow-xl shadow-indigo-500/20">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">准备好生成你的作品集了吗？</h2>
            <p className="text-white/70 mb-8 text-sm">免费使用，无需注册，几分钟完成</p>
            <Link
              href="/form"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-indigo-600 font-semibold rounded-2xl hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
            >
              开始生成作品集
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-gray-100 py-8 text-center text-sm text-gray-400">
        <p>
          <span className="font-semibold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">Portfolio AI</span>
          {' '}Beta v1.1 · 已支持云端图片存储
        </p>
      </footer>
    </div>
  );
}
