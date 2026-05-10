'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/StoreContext';
import { THEME_MAP, ThemeColors, ThemeKey } from '@/lib/themes';

export default function PreviewPage() {
  const router = useRouter();
  const { state } = useStore();
  const { formData, generatedData } = state;

  useEffect(() => {
    if (!generatedData) router.push('/form');
  }, [generatedData, router]);

  if (!generatedData) return null;

  const g = generatedData;
  const f = formData;
  const t = THEME_MAP[(f.portfolioThemeColor || 'red') as ThemeKey] || THEME_MAP.red;

  const artworks = f.artworks.filter((a) => a.name.trim() || a.mainImage || a.auxImages.length > 0);
  const ordered = g.artworkOrder.map((id) => artworks.find((a) => a.id === id)).filter(Boolean) as typeof artworks;
  const allOrdered = [...ordered, ...artworks.filter((a) => !g.artworkOrder.includes(a.id))];

  /* ── Build pages ── */
  type PageDef = { key: string; label: string };
  const pages = useMemo<PageDef[]>(() => {
    const list: PageDef[] = [{ key: 'cover', label: 'Cover' }];
    list.push({ key: 'intro', label: 'Intro' });
    if (allOrdered.length > 0) list.push({ key: 'contents', label: 'Contents' });
    allOrdered.forEach((_, i) => list.push({ key: `work-${i}`, label: `Work ${String(i + 1).padStart(2, '0')}` }));
    list.push({ key: 'thanks', label: 'Thanks' });
    return list;
  }, [allOrdered]);

  const [current, setCurrent] = useState(0);
  const total = pages.length;

  const goNext = useCallback(() => setCurrent((p) => Math.min(p + 1, total - 1)), [total]);
  const goPrev = useCallback(() => setCurrent((p) => Math.max(p - 1, 0)), []);

  const workStartIndex = useMemo(() => {
    const idx = pages.findIndex((p) => p.key.startsWith('work-'));
    return idx >= 0 ? idx : total;
  }, [pages, total]);

  /* Keyboard */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); goNext(); }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); goPrev(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [goNext, goPrev]);

  const page = pages[current];

  function renderPage() {
    switch (page.key) {
      case 'cover':
        return (
          <CoverPage
            formData={f}
            theme={t}
            artworks={allOrdered}
            onGoToWork={(artworkIdx) => {
              const target = workStartIndex + artworkIdx;
              if (target < total) setCurrent(target);
            }}
          />
        );
      case 'intro':
        return <IntroPage formData={f} generatedData={g} theme={t} />;
      case 'contents':
        return (
          <ContentsPage
            artworks={allOrdered}
            theme={t}
            onGoToWork={(artworkIdx) => {
              const target = workStartIndex + artworkIdx;
              if (target < total) setCurrent(target);
            }}
          />
        );
      case 'thanks':
        return <ThanksPage name={f.name} coverImage={f.coverImage} theme={t} />;
      default: {
        const idx = parseInt(page.key.replace('work-', ''), 10);
        return <WorkPage artwork={allOrdered[idx]} index={idx} theme={t} />;
      }
    }
  }

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center select-none" style={{ backgroundColor: '#d5d5d5' }}>
      {/* 16:9 card */}
      <div
        className="relative shadow-2xl overflow-hidden"
        style={{
          width: 'min(calc(100vw - 3rem), calc((100vh - 8rem) * 16/9))',
          height: 'min(calc(100vh - 8rem), calc((100vw - 3rem) * 9/16))',
          aspectRatio: '16/9',
          backgroundColor: t.background,
        }}
      >
        {renderPage()}

        {current > 0 && (
          <div className="absolute top-0 left-0 w-[11%] h-full cursor-pointer z-20" onClick={goPrev} title="上一页" />
        )}
        {current < total - 1 && (
          <div className="absolute top-0 right-0 w-[11%] h-full cursor-pointer z-20" onClick={goNext} title="下一页" />
        )}
      </div>

      <div className="flex items-center gap-5 mt-4">
        <button onClick={goPrev} disabled={current === 0}
          className="w-9 h-9 rounded-full flex items-center justify-center transition-all disabled:opacity-15 disabled:cursor-default hover:bg-white/70"
          style={{ color: t.primary }}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="flex items-center gap-1.5">
          {pages.map((p, i) => (
            <button key={p.key} onClick={() => setCurrent(i)}
              className="transition-all rounded-full"
              style={{ width: i === current ? 22 : 7, height: 7, backgroundColor: i === current ? t.primary : t.divider }}
              title={p.label} />
          ))}
        </div>

        <button onClick={goNext} disabled={current === total - 1}
          className="w-9 h-9 rounded-full flex items-center justify-center transition-all disabled:opacity-15 disabled:cursor-default hover:bg-white/70"
          style={{ color: t.primary }}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <p className="text-xs mt-2 tracking-widest uppercase" style={{ color: '#999' }}>
        {page.label}  ·  {current + 1} / {total}
      </p>

      <button onClick={() => router.push('/generate')}
        className="absolute top-4 left-4 px-3 py-1.5 bg-white/70 backdrop-blur rounded-lg text-xs font-medium hover:bg-white transition-all shadow-sm z-30"
        style={{ color: t.textMuted }}>
        ← 返回
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   COVER — left essentials + right artwork collage
   ═══════════════════════════════════════════════ */

function CoverPage({
  formData: f,
  theme: t,
  artworks,
  onGoToWork,
}: {
  formData: ReturnType<typeof useStore>['state']['formData'];
  theme: ThemeColors;
  artworks: ReturnType<typeof useStore>['state']['formData']['artworks'];
  onGoToWork: (idx: number) => void;
}) {
  /* Gather collage images from artworks (main image preferred, then first aux) */
  const collageImages = useMemo(() => {
    return artworks
      .map((a, i) => {
        const img = a.mainImage || a.auxImages[0] || null;
        return img ? { ...img, artworkIdx: i, name: a.name } : null;
      })
      .filter(Boolean)
      .slice(0, 5) as ({ id: string; dataUrl: string; artworkIdx: number; name: string })[];
  }, [artworks]);

  const n = collageImages.length;

  return (
    <div className="flex h-full">
      {/* Left: color block 42% — minimal, bold */}
      <div className="w-[42%] h-full flex flex-col justify-between p-8 lg:p-12" style={{ backgroundColor: t.primary }}>
        <div className="flex-1 flex flex-col justify-center">
          <h1 className="text-4xl lg:text-5xl xl:text-6xl font-black tracking-tighter leading-none mb-5" style={{ color: t.onPrimary }}>
            PORTFOLIO
          </h1>
          <div className="w-8 h-1 mb-6 opacity-50" style={{ backgroundColor: t.onPrimary }} />
          <h2 className="text-xl lg:text-2xl xl:text-3xl font-semibold tracking-tight mb-2" style={{ color: t.onPrimary }}>
            {f.name || '你的姓名'}
          </h2>
          <p className="text-sm lg:text-base tracking-wider opacity-70" style={{ color: t.onPrimary }}>
            {[f.major, f.jobDirection, f.targetPosition].filter(Boolean).slice(0, 2).join(' · ') || '创意设计'}
          </p>
        </div>
        <p className="text-xs tracking-widest uppercase opacity-35" style={{ color: t.onPrimary }}>
          {f.school ? `${f.school}  ·  2026` : '2026'}
        </p>
      </div>

      {/* Right: artwork collage 58% */}
      <div className="w-[58%] h-full p-5 lg:p-7 flex items-center justify-center" style={{ backgroundColor: t.bgAlt }}>
        {n === 0 ? (
          /* fallback: geometric placeholder */
          <div className="relative w-3/4 aspect-[4/5] max-w-sm">
            <div className="absolute top-0 left-0 w-3/5 h-3/5 border-4 opacity-12" style={{ borderColor: t.primary }} />
            <div className="absolute bottom-0 right-0 w-3/5 h-2/5 opacity-6" style={{ backgroundColor: t.primary }} />
            <p className="absolute bottom-5 left-5 text-xs tracking-widest uppercase opacity-20" style={{ color: t.primary }}>COVER</p>
          </div>
        ) : n === 1 ? (
          <div className="w-full h-full cursor-pointer" onClick={() => onGoToWork(collageImages[0].artworkIdx)}>
            <img src={collageImages[0].dataUrl} alt="" className="w-full h-full object-contain" />
          </div>
        ) : (
          <CollageGrid images={collageImages} onGoToWork={onGoToWork} theme={t} />
        )}
      </div>
    </div>
  );
}

/* ── Collage grid layouts ── */
function CollageGrid({
  images,
  onGoToWork,
  theme: t,
}: {
  images: { id: string; dataUrl: string; artworkIdx: number; name: string }[];
  onGoToWork: (idx: number) => void;
  theme: ThemeColors;
}) {
  const n = images.length;

  /* 2 images: left tall, right short */
  if (n === 2) {
    return (
      <div className="grid grid-cols-2 gap-3 h-full w-full">
        <div className="cursor-pointer hover:opacity-90 transition-opacity flex items-center justify-center bg-white/20" onClick={() => onGoToWork(images[0].artworkIdx)}>
          <img src={images[0].dataUrl} alt={images[0].name} className="max-w-full max-h-full object-contain" />
        </div>
        <div className="cursor-pointer hover:opacity-90 transition-opacity flex items-center justify-center bg-white/20" onClick={() => onGoToWork(images[1].artworkIdx)}>
          <img src={images[1].dataUrl} alt={images[1].name} className="max-w-full max-h-full object-contain" />
        </div>
      </div>
    );
  }

  /* 3 images: 1 large left + 2 stacked right */
  if (n === 3) {
    return (
      <div className="grid grid-cols-[5fr_3fr] gap-3 h-full w-full">
        <div className="cursor-pointer hover:opacity-90 transition-opacity flex items-center justify-center bg-white/20" onClick={() => onGoToWork(images[0].artworkIdx)}>
          <img src={images[0].dataUrl} alt={images[0].name} className="max-w-full max-h-full object-contain" />
        </div>
        <div className="grid grid-rows-2 gap-3">
          <div className="cursor-pointer hover:opacity-90 transition-opacity flex items-center justify-center bg-white/20" onClick={() => onGoToWork(images[1].artworkIdx)}>
            <img src={images[1].dataUrl} alt={images[1].name} className="max-w-full max-h-full object-contain" />
          </div>
          <div className="cursor-pointer hover:opacity-90 transition-opacity flex items-center justify-center bg-white/20" onClick={() => onGoToWork(images[2].artworkIdx)}>
            <img src={images[2].dataUrl} alt={images[2].name} className="max-w-full max-h-full object-contain" />
          </div>
        </div>
      </div>
    );
  }

  /* 4 images: 2x2 asymmetric — first image spans taller */
  if (n === 4) {
    return (
      <div className="grid grid-cols-[5fr_3fr] gap-3 h-full w-full">
        <div className="grid grid-rows-2 gap-3">
          <div className="cursor-pointer hover:opacity-90 transition-opacity flex items-center justify-center bg-white/20" onClick={() => onGoToWork(images[0].artworkIdx)}>
            <img src={images[0].dataUrl} alt={images[0].name} className="max-w-full max-h-full object-contain" />
          </div>
          <div className="cursor-pointer hover:opacity-90 transition-opacity flex items-center justify-center bg-white/20" onClick={() => onGoToWork(images[1].artworkIdx)}>
            <img src={images[1].dataUrl} alt={images[1].name} className="max-w-full max-h-full object-contain" />
          </div>
        </div>
        <div className="grid grid-rows-2 gap-3">
          <div className="cursor-pointer hover:opacity-90 transition-opacity flex items-center justify-center bg-white/20" onClick={() => onGoToWork(images[2].artworkIdx)}>
            <img src={images[2].dataUrl} alt={images[2].name} className="max-w-full max-h-full object-contain" />
          </div>
          <div className="cursor-pointer hover:opacity-90 transition-opacity flex items-center justify-center bg-white/20" onClick={() => onGoToWork(images[3].artworkIdx)}>
            <img src={images[3].dataUrl} alt={images[3].name} className="max-w-full max-h-full object-contain" />
          </div>
        </div>
      </div>
    );
  }

  /* 5 images: 3 left (2+1) + 2 right */
  return (
    <div className="grid grid-cols-[1fr_1fr] gap-3 h-full w-full">
      <div className="grid grid-rows-[3fr_2fr] gap-3">
        <div className="cursor-pointer hover:opacity-90 transition-opacity flex items-center justify-center bg-white/20" onClick={() => onGoToWork(images[0].artworkIdx)}>
          <img src={images[0].dataUrl} alt={images[0].name} className="max-w-full max-h-full object-contain" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="cursor-pointer hover:opacity-90 transition-opacity flex items-center justify-center bg-white/20" onClick={() => onGoToWork(images[1].artworkIdx)}>
            <img src={images[1].dataUrl} alt={images[1].name} className="max-w-full max-h-full object-contain" />
          </div>
          <div className="cursor-pointer hover:opacity-90 transition-opacity flex items-center justify-center bg-white/20" onClick={() => onGoToWork(images[2].artworkIdx)}>
            <img src={images[2].dataUrl} alt={images[2].name} className="max-w-full max-h-full object-contain" />
          </div>
        </div>
      </div>
      <div className="grid grid-rows-2 gap-3">
        <div className="cursor-pointer hover:opacity-90 transition-opacity flex items-center justify-center bg-white/20" onClick={() => onGoToWork(images[3].artworkIdx)}>
          <img src={images[3].dataUrl} alt={images[3].name} className="max-w-full max-h-full object-contain" />
        </div>
        <div className="cursor-pointer hover:opacity-90 transition-opacity flex items-center justify-center bg-white/20" onClick={() => onGoToWork(images[4].artworkIdx)}>
          <img src={images[4].dataUrl} alt={images[4].name} className="max-w-full max-h-full object-contain" />
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   INTRO — 3-column with visual hierarchy
   ═══════════════════════════════════════════════ */

function IntroPage({
  formData: f,
  generatedData: g,
  theme: t,
}: {
  formData: ReturnType<typeof useStore>['state']['formData'];
  generatedData: NonNullable<ReturnType<typeof useStore>['state']['generatedData']>;
  theme: ThemeColors;
}) {
  /* parsed data */
  const raw = f.internship?.trim();
  const workEntries = raw
    ? raw.split(/[\n\r]+/).filter(Boolean).map((l) => l.replace(/^[•·\-—\s\d.、]+/, '').trim()).filter(Boolean).slice(0, 3)
    : [];

  const honors: string[] = g?.highlights?.length
    ? g.highlights.slice(0, 3)
    : f.desiredAbilities
      ? f.desiredAbilities.split(/[,，、；;\s]+/).filter(Boolean).map((s) => s.trim()).slice(0, 3)
      : [];

  const skillGroups = (() => {
    if (g?.skillSummary?.length) return g.skillSummary;
    const groups: { category: string; items: string[] }[] = [];
    const all = [...f.skills.split(/[,，、；;\s]+/), ...f.toolsUsed.split(/[,，、；;\s]+/)].map((s) => s.trim()).filter(Boolean);
    if (all.length > 0) groups.push({ category: '技能工具', items: all.slice(0, 6) });
    if (f.aiToolUsage?.trim()) groups.push({ category: 'AI 工具', items: [f.aiToolUsage.trim().replace(/[。！？，,]$/, '')] });
    return groups;
  })();

  return (
    <div className="h-full flex p-6 lg:p-10 gap-6 lg:gap-8">
      {/* Col 1: INTRO title + photo */}
      <div className="w-[25%] flex flex-col justify-between">
        <h2 className="text-3xl lg:text-4xl xl:text-5xl font-black tracking-tighter leading-none" style={{ color: t.primary }}>
          INTRO
        </h2>
        <div className="flex-1 flex items-center mx-2 my-4 overflow-hidden" style={{ backgroundColor: t.bgAlt }}>
          {f.profilePhoto ? (
            <img src={f.profilePhoto.dataUrl} alt="" className="w-full h-full object-contain" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-5xl font-light opacity-15" style={{ color: t.primary }}>{(f.name || '?')[0]}</span>
            </div>
          )}
        </div>
      </div>

      {/* Col 2: Self-intro — larger main module */}
      <div className="w-[45%] flex flex-col justify-center p-5 lg:p-7" style={{ backgroundColor: t.surface }}>
        <p className="text-[0.6rem] lg:text-xs uppercase tracking-[0.25em] font-semibold mb-5" style={{ color: t.primary }}>
          自我介绍
        </p>
        <p className="text-base lg:text-lg xl:text-xl leading-relaxed font-light" style={{ color: t.text }}>
          {f.personalIntro?.trim()
            ? f.personalIntro.trim().replace(/[。！？，,]$/, '')
            : `我是${f.name || '在读学生'}，${f.school ? `就读于${f.school}${f.major ? ` ${f.major}专业` : ''}` : f.major || ''}
专注${f.jobDirection || '创意设计'}方向
对视觉表达与用户体验保持敏锐感知
致力于创作有温度、有影响力的作品`}
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          {[f.jobDirection, f.targetPosition, f.major].filter(Boolean).slice(0, 3).map((kw, i) => (
            <span key={i} className="px-3 py-1 text-[0.6rem] lg:text-xs font-medium" style={{ backgroundColor: t.tagBg, color: t.primary }}>
              {kw}
            </span>
          ))}
        </div>
      </div>

      {/* Col 3: Work / Honors / Skills stacked */}
      <div className="w-[30%] flex flex-col gap-3 lg:gap-3.5">
        {/* Work experience */}
        <div className="flex-1 p-4 lg:p-5 flex flex-col overflow-hidden" style={{ backgroundColor: t.surface }}>
          <p className="text-[0.55rem] lg:text-[0.6rem] uppercase tracking-[0.2em] font-semibold mb-2.5" style={{ color: t.primary }}>
            工作经验
          </p>
          {workEntries.length > 0 ? (
            <div className="space-y-2 flex-1 overflow-hidden">
              {workEntries.map((entry, i) => (
                <p key={i} className="text-[0.6rem] lg:text-xs leading-relaxed line-clamp-2 flex items-start gap-1.5" style={{ color: t.textMuted }}>
                  <span className="mt-0.5 w-1 h-1 rounded-full shrink-0" style={{ backgroundColor: t.primary }} />
                  {entry}
                </p>
              ))}
            </div>
          ) : (
            <p className="text-[0.6rem] lg:text-xs flex-1 opacity-30" style={{ color: t.textMuted }}>暂无记录</p>
          )}
        </div>

        {/* Honors */}
        <div className="flex-1 p-4 lg:p-5 flex flex-col overflow-hidden" style={{ backgroundColor: t.surface }}>
          <p className="text-[0.55rem] lg:text-[0.6rem] uppercase tracking-[0.2em] font-semibold mb-2.5" style={{ color: t.primary }}>
            个人荣誉
          </p>
          {honors.length > 0 ? (
            <div className="space-y-2 flex-1 overflow-hidden">
              {honors.map((h, i) => (
                <p key={i} className="text-[0.6rem] lg:text-xs leading-relaxed line-clamp-2 flex items-start gap-1.5" style={{ color: t.textMuted }}>
                  <span className="mt-0.5 w-1 h-1 rounded-full shrink-0" style={{ backgroundColor: t.primary }} />
                  {h}
                </p>
              ))}
            </div>
          ) : (
            <p className="text-[0.6rem] lg:text-xs flex-1 opacity-30" style={{ color: t.textMuted }}>暂未填写</p>
          )}
        </div>

        {/* Skills */}
        <div className="p-4 lg:p-5 flex flex-col overflow-hidden" style={{ backgroundColor: t.primary, color: t.onPrimary }}>
          <p className="text-[0.55rem] lg:text-[0.6rem] uppercase tracking-[0.2em] font-semibold mb-2.5 opacity-70" style={{ color: t.onPrimary }}>
            技能掌握
          </p>
          {skillGroups.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {skillGroups.flatMap((g) => g.items).slice(0, 8).map((item) => (
                <span key={item} className="px-2 py-0.5 text-[0.55rem] lg:text-[0.6rem] font-medium" style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: t.onPrimary }}>
                  {item}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-[0.6rem] lg:text-xs opacity-40">暂未填写</p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   CONTENTS — clickable directory
   ═══════════════════════════════════════════════ */

function ContentsPage({
  artworks,
  theme: t,
  onGoToWork,
}: {
  artworks: ReturnType<typeof useStore>['state']['formData']['artworks'];
  theme: ThemeColors;
  onGoToWork: (idx: number) => void;
}) {
  function thumbFor(a: (typeof artworks)[number]): string | null {
    if (a.thumbnail) return a.thumbnail.dataUrl;
    if (a.mainImage) return a.mainImage.dataUrl;
    if (a.auxImages.length > 0) return a.auxImages[0].dataUrl;
    return null;
  }

  return (
    <div className="h-full flex p-8 lg:p-12 gap-8 lg:gap-12">
      <div className="w-[35%] flex items-center">
        <h2 className="text-5xl lg:text-6xl xl:text-7xl font-black tracking-tighter leading-none" style={{ color: t.primary }}>
          CONTENTS
        </h2>
      </div>

      <div className="flex-1 flex flex-col justify-center gap-0 overflow-hidden">
        {artworks.map((artwork, idx) => {
          const thumb = thumbFor(artwork);
          return (
            <div
              key={artwork.id}
              className="flex items-center gap-3 lg:gap-4 py-2.5 lg:py-3 group cursor-pointer hover:opacity-80 transition-opacity"
              style={{ borderBottom: `1px solid ${t.divider}` }}
              onClick={() => onGoToWork(idx)}
            >
              <div className="w-10 h-10 lg:w-12 lg:h-12 flex items-center justify-center shrink-0 text-base lg:text-lg font-black"
                style={{ backgroundColor: t.primary, color: t.onPrimary }}>
                {String(idx + 1).padStart(2, '0')}
              </div>
              <div className="w-16 h-12 lg:w-20 lg:h-14 shrink-0 flex items-center justify-center" style={{ backgroundColor: t.bgAlt }}>
                {thumb ? (
                  <img src={thumb} alt={artwork.name} className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-500" />
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm lg:text-base font-semibold truncate" style={{ color: t.text }}>{artwork.name || '未命名作品'}</p>
                <p className="text-[0.6rem] lg:text-xs mt-0.5" style={{ color: t.textMuted }}>{artwork.type || '作品'}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   WORK — magazine-style left info + image grid right
   ═══════════════════════════════════════════════ */

function WorkPage({
  artwork,
  index,
  theme: t,
}: {
  artwork: ReturnType<typeof useStore>['state']['formData']['artworks'][number];
  index: number;
  theme: ThemeColors;
}) {
  function allImagesFor(a: typeof artwork) {
    const imgs: { id: string; dataUrl: string }[] = [];
    if (a.mainImage) imgs.push(a.mainImage);
    imgs.push(...a.auxImages);
    return imgs;
  }

  const imgs = allImagesFor(artwork);
  const tools = artwork.tools ? artwork.tools.split(/[,，、；;\s]+/).filter(Boolean) : [];

  return (
    <div className="flex h-full">
      {/* Left: info bar 35% — magazine layout */}
      <div className="w-[35%] h-full flex flex-col justify-between p-7 lg:p-10" style={{ backgroundColor: t.surface }}>
        <div>
          {/* Big number */}
          <div className="text-7xl lg:text-8xl xl:text-9xl font-black leading-none mb-1 opacity-[0.18] tracking-tighter" style={{ color: t.primary }}>
            {String(index + 1).padStart(2, '0')}
          </div>

          {/* Title section */}
          <div className="w-10 h-1 mb-5 mt-2" style={{ backgroundColor: t.primary }} />
          <h3 className="text-xl lg:text-2xl xl:text-3xl font-bold tracking-tight leading-tight mb-4" style={{ color: t.text }}>
            {artwork.name || '未命名作品'}
          </h3>

          {/* Category tag */}
          <div className="flex flex-wrap gap-2 mb-6">
            {artwork.type && (
              <span className="px-3 py-1.5 text-xs lg:text-sm font-semibold tracking-wide" style={{ backgroundColor: t.primary, color: t.onPrimary }}>
                {artwork.type}
              </span>
            )}
          </div>

          {/* Description */}
          {artwork.description && (
            <p className="text-sm lg:text-base leading-relaxed mb-6" style={{ color: t.textMuted }}>
              {artwork.description.length > 180
                ? artwork.description.slice(0, 177) + '...'
                : artwork.description}
            </p>
          )}

          {/* Highlights */}
          {artwork.highlights && (
            <div>
              <p className="text-xs lg:text-sm uppercase tracking-[0.25em] font-semibold mb-3" style={{ color: t.primary }}>
                Highlights
              </p>
              <p className="text-sm lg:text-base leading-relaxed" style={{ color: t.text }}>
                {artwork.highlights}
              </p>
            </div>
          )}
        </div>

        {/* Tools at bottom */}
        <div className="flex flex-wrap gap-1.5 mt-6">
          {tools.slice(0, 5).map((tool) => (
            <span key={tool} className="px-2.5 py-1 text-[0.6rem] lg:text-xs font-medium" style={{ backgroundColor: t.tagBg, color: t.primary }}>
              {tool}
            </span>
          ))}
        </div>
      </div>

      {/* Right: images 65% */}
      <div className="w-[65%] h-full p-5 lg:p-8 overflow-hidden">
        {imgs.length > 0 ? (
          <WorkImageGrid images={imgs} />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: t.bgAlt }}>
            <p className="text-sm tracking-widest uppercase" style={{ color: t.textMuted }}>No Images</p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   THANKS — clean closing page
   ═══════════════════════════════════════════════ */

function ThanksPage({
  name,
  coverImage,
  theme: t,
}: {
  name: string;
  coverImage: ReturnType<typeof useStore>['state']['formData']['coverImage'];
  theme: ThemeColors;
}) {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center px-16">
        <h2 className="text-7xl lg:text-8xl xl:text-[10rem] font-black tracking-tighter leading-none mb-8" style={{ color: t.numberColor }}>
          THANKS
        </h2>
        <div className="w-16 h-0.5 mx-auto mb-8" style={{ backgroundColor: t.primary }} />
        <p className="text-xl lg:text-2xl font-light tracking-wider" style={{ color: t.text }}>
          {name || '谢谢'} 的作品集
        </p>
        <p className="text-xs mt-6 tracking-widest uppercase" style={{ color: t.textMuted }}>
          感谢观看
        </p>
        {coverImage && (
          <div className="mt-10 w-48 mx-auto opacity-20">
            <img src={coverImage.dataUrl} alt="" className="w-full object-contain" />
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   IMAGE GRID — all images object-contain, no cropping
   ═══════════════════════════════════════════════ */

function WorkImageGrid({ images }: { images: { id: string; dataUrl: string }[] }) {
  const n = images.length;

  if (n === 1) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-white/20">
        <img src={images[0].dataUrl} alt="" className="max-w-full max-h-full object-contain" />
      </div>
    );
  }

  if (n === 2) {
    return (
      <div className="grid grid-rows-2 gap-2 h-full">
        <div className="flex items-center justify-center bg-white/20">
          <img src={images[0].dataUrl} alt="" className="max-w-full max-h-full object-contain" />
        </div>
        <div className="flex items-center justify-center bg-white/20">
          <img src={images[1].dataUrl} alt="" className="max-w-full max-h-full object-contain" />
        </div>
      </div>
    );
  }

  if (n === 3) {
    return (
      <div className="grid grid-rows-[3fr_2fr] gap-2 h-full">
        <div className="flex items-center justify-center bg-white/20">
          <img src={images[0].dataUrl} alt="" className="max-w-full max-h-full object-contain" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          {images.slice(1).map((img) => (
            <div key={img.id} className="flex items-center justify-center bg-white/20">
              <img src={img.dataUrl} alt="" className="max-w-full max-h-full object-contain" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (n === 4) {
    return (
      <div className="grid grid-rows-[3fr_2fr] gap-2 h-full">
        <div className="flex items-center justify-center bg-white/20">
          <img src={images[0].dataUrl} alt="" className="max-w-full max-h-full object-contain" />
        </div>
        <div className="grid grid-cols-3 gap-2">
          {images.slice(1).map((img) => (
            <div key={img.id} className="flex items-center justify-center bg-white/20">
              <img src={img.dataUrl} alt="" className="max-w-full max-h-full object-contain" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* 5+ */
  return (
    <div className="grid grid-rows-[5fr_3fr] gap-2 h-full">
      <div className="flex items-center justify-center bg-white/20">
        <img src={images[0].dataUrl} alt="" className="max-w-full max-h-full object-contain" />
      </div>
      <div className="grid grid-cols-3 gap-2">
        {images.slice(1).map((img) => (
          <div key={img.id} className="flex items-center justify-center bg-white/20">
            <img src={img.dataUrl} alt="" className="max-w-full max-h-full object-contain" />
          </div>
        ))}
      </div>
    </div>
  );
}
