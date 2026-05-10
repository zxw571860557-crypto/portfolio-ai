'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/StoreContext';

function StepIndicator({ current }: { current: number }) {
  const steps = ['填写信息', 'AI 生成', '预览作品集'];
  return (
    <div className="flex items-center justify-center mb-10">
      {steps.map((step, i) => (
        <div key={step} className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${i <= current ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/20' : 'bg-gray-200 text-gray-400'}`}>{i + 1}</div>
          <span className={`ml-2 text-sm ${i <= current ? 'text-gray-700 font-medium' : 'text-gray-400'}`}>{step}</span>
          {i < 2 && <div className="w-12 h-px bg-gray-200 mx-3" />}
        </div>
      ))}
    </div>
  );
}

function LoadingView() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-20 h-20 mx-auto mb-8 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 animate-pulse shadow-lg shadow-indigo-500/30" />
        <p className="text-xl text-gray-700 font-medium mb-2">AI 正在为你生成作品集...</p>
        <p className="text-sm text-gray-400 max-w-xs mx-auto leading-relaxed">分析作品 · 提炼亮点 · 优化说明 · 规划排版</p>
        <div className="mt-8 flex justify-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" />
          <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.2s]" />
          <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.4s]" />
        </div>
      </div>
    </div>
  );
}

function ResultCard({ color, title, children }: { color: string; title: string; children: React.ReactNode }) {
  const map: Record<string, string> = { green: 'bg-green-400', amber: 'bg-amber-400', blue: 'bg-blue-400', purple: 'bg-purple-400', pink: 'bg-pink-400', teal: 'bg-teal-400', indigo: 'bg-indigo-400', rose: 'bg-rose-400' };
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-300">
      <div className="flex items-center gap-2 mb-3">
        <span className={`w-2 h-2 rounded-full ${map[color] || 'bg-gray-400'}`} />
        <h3 className="font-semibold text-gray-900">{title}</h3>
      </div>
      {children}
    </div>
  );
}

export default function GeneratePage() {
  const router = useRouter();
  const { state } = useStore();
  const { generatedData } = state;
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!generatedData) { router.push('/form'); return; }
    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timer);
  }, [generatedData, router]);

  if (!generatedData) return null;
  if (isLoading) return <LoadingView />;

  const g = generatedData;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <StepIndicator current={1} />

        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 mb-4">
            <svg className="w-8 h-8 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">作品集已生成</h2>
          <p className="text-gray-500 text-sm">AI 已根据你的作品优化生成了以下内容</p>
        </div>

        <div className="space-y-4 mb-8">
          {/* 作品集标题 */}
          <ResultCard color="pink" title="作品集标题建议">
            <p className="text-gray-800 font-semibold text-lg">{g.portfolioTitle}</p>
          </ResultCard>

          {/* 定位语 */}
          <ResultCard color="rose" title="作品集定位语">
            <p className="text-gray-800 font-medium">{g.positioningStatement}</p>
          </ResultCard>

          {/* 个人介绍 */}
          <ResultCard color="green" title="优化后的个人介绍">
            <p className="text-gray-600 leading-relaxed text-sm">{g.optimizedIntro}</p>
          </ResultCard>

          {/* 求职亮点 */}
          <ResultCard color="amber" title="求职亮点总结">
            <ul className="space-y-2">
              {g.highlights.map((h, i) => (
                <li key={i} className="flex items-start gap-2 text-gray-600 text-sm">
                  <span className="text-indigo-400 mt-1 shrink-0">&#x2022;</span> {h}
                </li>
              ))}
            </ul>
          </ResultCard>

          {/* 技能总结 */}
          <ResultCard color="blue" title="技能能力总结">
            {g.skillSummary.length > 0 ? (
              <div className="space-y-4">
                {g.skillSummary.map((cat) => (
                  <div key={cat.category}>
                    <h4 className="text-xs font-medium text-gray-400 mb-2 uppercase tracking-wide">{cat.category}</h4>
                    <div className="flex flex-wrap gap-2">
                      {cat.items.map((s) => <span key={s} className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-sm font-medium">{s}</span>)}
                    </div>
                  </div>
                ))}
              </div>
            ) : <p className="text-gray-400 text-sm">暂未填写技能信息</p>}
          </ResultCard>

          {/* 每组作品的说明优化 */}
          {g.artworkDescriptions.length > 0 && (
            <ResultCard color="purple" title="作品说明优化">
              <div className="space-y-4">
                {g.artworkDescriptions.map((desc) => (
                  <div key={desc.artworkId} className="bg-gray-50 rounded-xl p-4">
                    <p className="text-sm font-semibold text-gray-800 mb-1">{desc.name || '未命名作品'}</p>
                    <p className="text-gray-600 text-sm leading-relaxed">{desc.optimized}</p>
                  </div>
                ))}
              </div>
            </ResultCard>
          )}

          {/* 作品排序建议 */}
          {g.artworkOrder.length > 1 && (
            <ResultCard color="teal" title="作品排序建议">
              <p className="text-gray-600 text-sm mb-3">建议按以下顺序展示作品，最能体现你的设计深度与广度：</p>
              <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
                {g.artworkOrder.map((id, i) => {
                  const aw = state.formData.artworks.find((a) => a.id === id);
                  return <li key={id}>{aw?.name || '未命名作品'} {i === 0 && <span className="text-indigo-400 text-xs ml-1">← 首推</span>}</li>;
                })}
              </ol>
            </ResultCard>
          )}

          {/* 图片排版建议 */}
          <ResultCard color="indigo" title="图片排版建议">
            <p className="text-gray-600 leading-relaxed text-sm">{g.layoutAdvice}</p>
          </ResultCard>

          {/* AI 能力建议 */}
          <ResultCard color="purple" title="AI 能力表达建议">
            <p className="text-gray-600 leading-relaxed text-sm">{g.aiCapabilityAdvice}</p>
          </ResultCard>

          {/* 页面目录 */}
          {g.pageDirectory.length > 0 && (
            <ResultCard color="green" title="作品集页面目录建议">
              <ul className="space-y-1.5">
                {g.pageDirectory.map((p, i) => <li key={i} className="text-gray-600 text-sm font-mono">{p}</li>)}
              </ul>
            </ResultCard>
          )}
        </div>

        <div className="flex gap-4">
          <button onClick={() => router.push('/preview')} className="flex-1 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-2xl hover:shadow-xl hover:shadow-indigo-500/25 transition-all duration-300 hover:-translate-y-0.5">
            查看作品集预览
          </button>
          <button onClick={() => router.push('/form')} className="px-6 py-4 border border-gray-200 text-gray-600 font-semibold rounded-2xl hover:bg-white hover:border-gray-300 transition-all">
            重新编辑
          </button>
        </div>
      </div>
    </div>
  );
}
