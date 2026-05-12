'use client';

import { useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useStore, FormData, Artwork, ArtworkImage, newArtwork } from '@/lib/StoreContext';
import { generatePortfolio } from '@/lib/mockAI';
import { THEME_OPTIONS, ThemeKey, THEME_MAP } from '@/lib/themes';
import { uploadToCloudinary, UploadError } from '@/lib/cloudinary';

/* ── Constants ── */
const ARTWORK_TYPES = ['空间设计', '视觉设计', '文创设计', '产品设计', 'AI 项目', '其他'];
const STYLE_OPTIONS = [
  { value: 'simple', label: '简洁求职风', desc: '干净利落、重点突出，适合简历投递' },
  { value: 'designer', label: '设计师作品集风', desc: '大胆撞色、视觉优先，适合展示设计能力' },
  { value: 'art', label: '艺术展览风', desc: '暗色背景、大图展示，像在画廊看展' },
  { value: 'tech', label: 'AI 科技风', desc: '渐变光效、科技质感，适合数字创作者' },
];
const DEGREE_OPTIONS = ['专科', '本科', '硕士', '博士'];
const EXPERIENCE_OPTIONS = ['在读学生', '应届毕业生', '1年以下', '1-3年', '3-5年', '5年以上'];
const LAYOUT_OPTIONS = [
  { value: 'auto', label: '自动排版', desc: 'AI 自动优化图片布局与版式节奏' },
  { value: 'custom', label: '自定义排版', desc: '选择偏好后，AI 参考你的倾向进行排版' },
];

/* ═══════════════════════════════════════════════
   Step Indicator
   ═══════════════════════════════════════════════ */
function StepIndicator({ current, onStepClick }: { current: number; onStepClick?: (s: number) => void }) {
  const steps = [
    { num: '01', label: '填写信息' },
    { num: '02', label: '上传作品' },
    { num: '03', label: '风格选择并生成' },
  ];
  return (
    <div className="flex items-center justify-center gap-0 mb-10">
      {steps.map((step, i) => {
        const isActive = i === current;
        const isDone = i < current;
        return (
          <div key={step.num} className="flex items-center">
            <button
              type="button"
              onClick={() => onStepClick?.(i)}
              className="flex items-center gap-2.5 group"
            >
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                  isActive
                    ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/25'
                    : isDone
                    ? 'bg-indigo-100 text-indigo-500'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                {isDone ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  step.num
                )}
              </div>
              <span
                className={`text-sm font-medium hidden sm:inline transition-colors ${
                  isActive ? 'text-gray-800' : isDone ? 'text-indigo-500' : 'text-gray-400'
                }`}
              >
                {step.label}
              </span>
            </button>
            {i < 2 && (
              <div className={`w-10 sm:w-16 h-px mx-2 sm:mx-3 transition-colors ${i < current ? 'bg-indigo-300' : 'bg-gray-200'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   Shared Form Fields
   ═══════════════════════════════════════════════ */
function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
      <span className="w-1 h-4 rounded-full bg-gradient-to-b from-indigo-500 to-purple-600" />
      {children}
    </h3>
  );
}

function InputField({ label, value, onChange, placeholder, required }: {
  label: string; value: string; onChange: (v: string) => void; placeholder: string; required?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}{required && <span className="text-indigo-500 ml-0.5">*</span>}
      </label>
      <input
        type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all bg-white text-sm"
      />
    </div>
  );
}

function SelectField({ label, value, onChange, options, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; options: string[]; placeholder: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <select
        value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all bg-white text-sm"
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
}

function TextareaField({ label, value, onChange, placeholder, rows }: {
  label: string; value: string; onChange: (v: string) => void; placeholder: string; rows: number;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <textarea
        value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={rows}
        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all resize-none bg-white text-sm"
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════
   Image Upload Field
   ═══════════════════════════════════════════════ */
function ImageUploadField({ label, desc, image, uploading, error, onUpload, onRemove }: {
  label: string; desc: string;
  image: ArtworkImage | null;
  uploading: boolean;
  error: string | null;
  onUpload: (file: File | null) => void;
  onRemove: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <p className="text-xs text-gray-400 mb-2">{desc}</p>
      {image ? (
        <div className="relative group w-full h-40 rounded-xl overflow-hidden border border-gray-200">
          <img src={image.dataUrl} alt="" className="w-full h-full object-cover" />
          <button type="button" onClick={onRemove}
            className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/50 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">&times;</button>
        </div>
      ) : (
        <input ref={fileRef} type="file" accept="image/*" className="hidden"
          onChange={(e) => { onUpload(e.target.files?.[0] || null); e.target.value = ''; }} />
      )}
      {!image && (
        <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
          className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 hover:border-indigo-300 hover:text-indigo-400 transition-all text-sm disabled:opacity-50">
          {uploading ? (
            <span className="inline-flex items-center gap-1.5">
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              上传中...
            </span>
          ) : '+ 上传图片'}
        </button>
      )}
      {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   Artwork Card (for Step 2)
   ═══════════════════════════════════════════════ */
function ArtworkCard({ artwork, index, total, onChange, onRemove, onMainImageUpload, onAuxImagesUpload, onRemoveAuxImage, onThumbnailUpload, onRemoveMainImage, onRemoveThumbnail, uploading, uploadErrors }: {
  artwork: Artwork; index: number; total: number;
  onChange: (p: Partial<Artwork>) => void;
  onRemove: () => void;
  onMainImageUpload: (file: File | null) => void;
  onAuxImagesUpload: (files: FileList | null) => void;
  onRemoveAuxImage: (imageId: string) => void;
  onThumbnailUpload: (file: File | null) => void;
  onRemoveMainImage: () => void;
  onRemoveThumbnail: () => void;
  uploading: Record<string, boolean>;
  uploadErrors: Record<string, string>;
}) {
  const mainFileRef = useRef<HTMLInputElement>(null);
  const auxFileRef = useRef<HTMLInputElement>(null);
  const thumbFileRef = useRef<HTMLInputElement>(null);

  return (
    <div className="border border-gray-100 rounded-2xl p-5 bg-gray-50/50">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-semibold text-gray-700">作品 {index + 1}</span>
        {total > 1 && (
          <button type="button" onClick={onRemove} className="text-xs text-red-400 hover:text-red-500 transition-colors">删除此作品</button>
        )}
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">作品名称</label>
            <input type="text" value={artwork.name} onChange={(e) => onChange({ name: e.target.value })} placeholder="如：春日限时·品牌视觉设计" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all bg-white text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">作品类型</label>
            <select value={artwork.type} onChange={(e) => onChange({ type: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all bg-white text-sm">
              <option value="">选择类型...</option>
              {ARTWORK_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>

        <TextareaField label="作品简介" value={artwork.description} onChange={(v) => onChange({ description: v })} placeholder="简要介绍这件作品的创作背景或设计思路..." rows={2} />
        <InputField label="使用工具" value={artwork.tools} onChange={(v) => onChange({ tools: v })} placeholder="如：Figma, Photoshop, Procreate" />
        <TextareaField label="作品亮点" value={artwork.highlights} onChange={(v) => onChange({ highlights: v })} placeholder="这件作品最值得展示的亮点，如：创新的配色方案、独特的排版风格..." rows={2} />

        {/* Images */}
        <div className="border-t border-gray-200 pt-4 space-y-4">
          <SectionTitle>作品图片</SectionTitle>

          {/* Main image */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">作品主图 <span className="text-indigo-400">（封面大图）</span></label>
            <p className="text-xs text-gray-400 mb-2">建议作为作品详情页大图展示</p>
            {artwork.mainImage ? (
              <div className="relative group w-full h-32 rounded-xl overflow-hidden border border-gray-200">
                <img src={artwork.mainImage.dataUrl} alt="" className="w-full h-full object-cover" />
                <button type="button" onClick={onRemoveMainImage}
                  className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/50 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">&times;</button>
              </div>
            ) : (
              <>
                <input ref={mainFileRef} type="file" accept="image/*" className="hidden"
                  onChange={(e) => { onMainImageUpload(e.target.files?.[0] || null); e.target.value = ''; }} />
                <button type="button" onClick={() => mainFileRef.current?.click()}
                  disabled={uploading[`a-${artwork.id}-main`]}
                  className="w-full py-2.5 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 hover:border-indigo-300 hover:text-indigo-400 transition-all text-sm disabled:opacity-50">
                  {uploading[`a-${artwork.id}-main`] ? (
                    <span className="inline-flex items-center gap-1.5">
                      <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      上传中...
                    </span>
                  ) : '+ 上传作品主图'}
                </button>
              </>
            )}
            {uploadErrors[`a-${artwork.id}-main`] && (
              <p className="mt-1.5 text-xs text-red-500">{uploadErrors[`a-${artwork.id}-main`]}</p>
            )}
          </div>

          {/* Auxiliary images */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">作品辅图 <span className="text-gray-400">（最多 3 张）</span></label>
            <p className="text-xs text-gray-400 mb-2">用于作品详情页补充展示</p>
            {artwork.auxImages.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {artwork.auxImages.map((img) => (
                  <div key={img.id} className="relative group w-20 h-20 rounded-lg overflow-hidden border border-gray-200">
                    <img src={img.dataUrl} alt="" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => onRemoveAuxImage(img.id)}
                      className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-black/50 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">&times;</button>
                  </div>
                ))}
              </div>
            )}
            <input ref={auxFileRef} type="file" accept="image/*" multiple className="hidden"
              onChange={(e) => { onAuxImagesUpload(e.target.files); e.target.value = ''; }} />
            {artwork.auxImages.length < 3 && (
              <button type="button" onClick={() => auxFileRef.current?.click()}
                disabled={uploading[`a-${artwork.id}-aux`]}
                className="px-4 py-2 border border-dashed border-gray-200 rounded-xl text-gray-400 hover:border-indigo-300 hover:text-indigo-400 transition-all text-sm disabled:opacity-50">
                {uploading[`a-${artwork.id}-aux`] ? (
                  <span className="inline-flex items-center gap-1.5">
                    <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    上传中...
                  </span>
                ) : '+ 上传辅图'}
              </button>
            )}
            {uploadErrors[`a-${artwork.id}-aux`] && (
              <p className="mt-1.5 text-xs text-red-500">{uploadErrors[`a-${artwork.id}-aux`]}</p>
            )}
          </div>

          {/* Thumbnail */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">目录缩略图 <span className="text-gray-400">（可选）</span></label>
            <p className="text-xs text-gray-400 mb-2">用于目录页或首页小图展示</p>
            {artwork.thumbnail ? (
              <div className="relative group w-20 h-20 rounded-lg overflow-hidden border border-gray-200">
                <img src={artwork.thumbnail.dataUrl} alt="" className="w-full h-full object-cover" />
                <button type="button" onClick={onRemoveThumbnail}
                  className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-black/50 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">&times;</button>
              </div>
            ) : (
              <>
                <input ref={thumbFileRef} type="file" accept="image/*" className="hidden"
                  onChange={(e) => { onThumbnailUpload(e.target.files?.[0] || null); e.target.value = ''; }} />
                <button type="button" onClick={() => thumbFileRef.current?.click()}
                  disabled={uploading[`a-${artwork.id}-thumb`]}
                  className="px-4 py-2 border border-dashed border-gray-200 rounded-xl text-gray-400 hover:border-indigo-300 hover:text-indigo-400 transition-all text-sm disabled:opacity-50">
                  {uploading[`a-${artwork.id}-thumb`] ? (
                    <span className="inline-flex items-center gap-1.5">
                      <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      上传中...
                    </span>
                  ) : '+ 上传缩略图'}
                </button>
              </>
            )}
            {uploadErrors[`a-${artwork.id}-thumb`] && (
              <p className="mt-1.5 text-xs text-red-500">{uploadErrors[`a-${artwork.id}-thumb`]}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   Preview Card (Step 3)
   ═══════════════════════════════════════════════ */
function PreviewCard({ style, themeKey }: { style: string; themeKey: string }) {
  const t = THEME_MAP[themeKey as ThemeKey] || THEME_MAP.red;

  const styleLabel: Record<string, string> = {
    simple: '简洁求职风', designer: '设计师作品集风', art: '艺术展览风', tech: 'AI 科技风',
  };

  const styleGradient: Record<string, string> = {
    simple: `linear-gradient(135deg, ${t.bgAlt}, ${t.divider})`,
    designer: `linear-gradient(135deg, ${t.primary}, ${t.secondary})`,
    art: `linear-gradient(135deg, #1a1a1a, #333)`,
    tech: `linear-gradient(135deg, #0f172a, ${t.primary}, ${t.secondary})`,
  };

  return (
    <div className="w-full max-w-[320px] mx-auto">
      <p className="text-xs text-gray-400 text-center mb-2">作品集封面预览</p>
      <div
        className="w-full rounded-xl overflow-hidden shadow-lg border border-gray-100"
        style={{ aspectRatio: '16/9' }}
      >
        <div className="flex h-full">
          {/* Left color block */}
          <div className="w-[40%] h-full flex flex-col justify-between p-4" style={{ backgroundColor: t.primary }}>
            <div>
              <p className="text-[10px] font-black tracking-tighter leading-none" style={{ color: t.onPrimary }}>
                PORTFOLIO
              </p>
              <div className="w-4 h-px my-2 opacity-50" style={{ backgroundColor: t.onPrimary }} />
              <p className="text-[8px] font-semibold tracking-tight" style={{ color: t.onPrimary }}>
                你的姓名
              </p>
            </div>
            <p className="text-[6px] tracking-widest uppercase opacity-35" style={{ color: t.onPrimary }}>
              2026
            </p>
          </div>

          {/* Right preview area */}
          <div className="w-[60%] h-full flex items-center justify-center p-4" style={{ background: styleGradient[style] || styleGradient.designer }}>
            {style === 'art' ? (
              <div className="w-8 h-8 rounded opacity-25" style={{ backgroundColor: '#fbbf24' }} />
            ) : style === 'tech' ? (
              <div className="w-8 h-8 rounded-full border opacity-25" style={{ borderColor: '#67e8f9' }} />
            ) : (
              <div className="grid grid-cols-2 gap-1.5 w-full h-full p-2">
                <div className="rounded opacity-15" style={{ backgroundColor: t.onPrimary }} />
                <div className="rounded opacity-10" style={{ backgroundColor: t.onPrimary }} />
                <div className="rounded opacity-10" style={{ backgroundColor: t.onPrimary }} />
                <div className="rounded opacity-15" style={{ backgroundColor: t.onPrimary }} />
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center gap-2 mt-2">
        <span className="text-[10px] text-gray-500">{styleLabel[style] || '设计师作品集风'}</span>
        <span className="w-1 h-1 rounded-full bg-gray-300" />
        <span className="text-[10px] text-gray-500">{THEME_OPTIONS.find((o) => o.key === themeKey)?.label || 'Creative Red'}</span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   Main Form Page
   ═══════════════════════════════════════════════ */
export default function FormPage() {
  const router = useRouter();
  const { state, setFormData, setGeneratedData } = useStore();
  const { formData } = state;

  const [currentStep, setCurrentStep] = useState(0);

  const update = (field: keyof FormData, value: string) => setFormData({ [field]: value });

  const formDataRef = useRef(formData);
  formDataRef.current = formData;

  /* ── Upload state ── */
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [uploadErrors, setUploadErrors] = useState<Record<string, string>>({});
  const clearError = useCallback((key: string) => {
    setUploadErrors((prev) => { const n = { ...prev }; delete n[key]; return n; });
  }, []);

  async function uploadImage(slotKey: string, file: File, onSuccess: (img: ArtworkImage) => void) {
    if (!file.type.startsWith('image/')) {
      setUploadErrors((prev) => ({ ...prev, [slotKey]: '请选择图片文件' }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadErrors((prev) => ({ ...prev, [slotKey]: '图片大小不能超过 5MB' }));
      return;
    }
    setUploading((prev) => ({ ...prev, [slotKey]: true }));
    clearError(slotKey);
    try {
      const url = await uploadToCloudinary(file);
      onSuccess({ id: `img${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, dataUrl: url });
    } catch (err) {
      const msg = err instanceof UploadError ? err.message : '上传失败，请检查网络后重试';
      setUploadErrors((prev) => ({ ...prev, [slotKey]: msg }));
    } finally {
      setUploading((prev) => { const n = { ...prev }; delete n[slotKey]; return n; });
    }
  }

  /* ── Artwork helpers ── */
  const setArtworks = (artworks: Artwork[]) => setFormData({ artworks });
  const addArtwork = () => setArtworks([...formData.artworks, newArtwork()]);
  const removeArtwork = (id: string) => {
    if (formData.artworks.length <= 1) return;
    setArtworks(formData.artworks.filter((aw) => aw.id !== id));
  };
  const updateArtwork = (id: string, patch: Partial<Artwork>) =>
    setArtworks(formData.artworks.map((a) => (a.id === id ? { ...a, ...patch } : a)));

  /* ── Image upload handlers ── */
  const handleCoverUpload = (file: File | null) => {
    if (!file) return;
    uploadImage('cover', file, (img) => setFormData({ coverImage: img }));
  };
  const handleProfilePhotoUpload = (file: File | null) => {
    if (!file) return;
    uploadImage('photo', file, (img) => setFormData({ profilePhoto: img }));
  };
  const handleMainImageUpload = (artworkId: string, file: File | null) => {
    if (!file) return;
    const key = `a-${artworkId}-main`;
    uploadImage(key, file, (img) => updateArtwork(artworkId, { mainImage: img }));
  };
  const handleAuxImagesUpload = (artworkId: string, files: FileList | null) => {
    if (!files) return;
    const current = formDataRef.current.artworks.find((a) => a.id === artworkId);
    if (!current) return;
    const remaining = 3 - current.auxImages.length;
    if (remaining <= 0) return;
    const valid = Array.from(files).filter((f) => f.type.startsWith('image/')).slice(0, remaining);

    const key = `a-${artworkId}-aux`;
    setUploading((prev) => ({ ...prev, [key]: true }));

    Promise.allSettled(valid.map((f) => uploadToCloudinary(f))).then((results) => {
      const newImgs: ArtworkImage[] = [];
      results.forEach((r) => {
        if (r.status === 'fulfilled') {
          newImgs.push({ id: `img${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, dataUrl: r.value });
        }
      });
      if (newImgs.length > 0) {
        updateArtwork(artworkId, { auxImages: [...current.auxImages, ...newImgs] });
      }
      const firstErr = results.find((r): r is PromiseRejectedResult => r.status === 'rejected');
      if (firstErr) {
        const msg = firstErr.reason instanceof UploadError ? firstErr.reason.message : '上传失败，请检查网络后重试';
        setUploadErrors((prev) => ({ ...prev, [key]: msg }));
      }
      setUploading((prev) => { const n = { ...prev }; delete n[key]; return n; });
    });
  };
  const removeAuxImage = (artworkId: string, imageId: string) => {
    const artwork = formData.artworks.find((a) => a.id === artworkId);
    if (!artwork) return;
    updateArtwork(artworkId, { auxImages: artwork.auxImages.filter((i) => i.id !== imageId) });
  };

  /* ── Submit ── */
  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const generated = generatePortfolio(formData);
    setGeneratedData(generated);
    router.push('/generate');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <StepIndicator current={currentStep} onStepClick={(s) => { if (s < currentStep) setCurrentStep(s); }} />

        {/* ═══ Step Content Card ═══ */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 mb-6">
          <form onSubmit={(e) => e.preventDefault()}>

            {/* ── Step 0: 填写信息 ── */}
            {currentStep === 0 && (
              <div className="space-y-8">
                {/* 基础信息 */}
                <div>
                  <SectionTitle>基础信息</SectionTitle>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <InputField label="姓名" value={formData.name} onChange={(v) => update('name', v)} placeholder="你的姓名" required />
                    <InputField label="学校" value={formData.school} onChange={(v) => update('school', v)} placeholder="就读学校" required />
                    <InputField label="专业" value={formData.major} onChange={(v) => update('major', v)} placeholder="所学专业" required />
                    <SelectField label="学历" value={formData.degree} onChange={(v) => update('degree', v)} options={DEGREE_OPTIONS} placeholder="选择学历" />
                    <InputField label="所在地" value={formData.location} onChange={(v) => update('location', v)} placeholder="如：北京、上海、杭州" />
                  </div>
                </div>

                {/* 求职方向 */}
                <div>
                  <SectionTitle>求职方向</SectionTitle>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <InputField label="求职岗位" value={formData.jobDirection} onChange={(v) => update('jobDirection', v)} placeholder="如：UI 设计师、品牌设计师" required />
                    <InputField label="行业领域" value={formData.industry} onChange={(v) => update('industry', v)} placeholder="如：互联网、教育、文创" />
                    <SelectField label="工作经验" value={formData.experience} onChange={(v) => update('experience', v)} options={EXPERIENCE_OPTIONS} placeholder="选择经验" />
                  </div>
                </div>

                {/* 个人介绍 */}
                <div>
                  <SectionTitle>个人介绍</SectionTitle>
                  <div className="space-y-4">
                    <TextareaField label="个人介绍" value={formData.personalIntro} onChange={(v) => update('personalIntro', v)} placeholder="描述你的背景和创作兴趣。例如：我热爱视觉设计，擅长用图形和色彩传达品牌理念..." rows={3} />
                    <TextareaField label="希望突出的个人能力" value={formData.desiredAbilities} onChange={(v) => update('desiredAbilities', v)} placeholder="如：视觉设计、品牌策划、用户研究、跨团队协作" rows={2} />
                  </div>
                </div>

                {/* 封面设置 */}
                <div>
                  <SectionTitle>封面设置</SectionTitle>
                  <div className="px-3 py-2 rounded-lg bg-indigo-50/60 border border-indigo-100 text-xs text-indigo-500 mb-5">
                    当前版本已支持云端图片存储，上传后的图片可在刷新或更换设备后继续显示。
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ImageUploadField
                      label="封面主图"
                      desc="作品集封面展示的图片"
                      image={formData.coverImage}
                      uploading={uploading['cover'] || false}
                      error={uploadErrors['cover'] || null}
                      onUpload={handleCoverUpload}
                      onRemove={() => { setFormData({ coverImage: null }); }}
                    />
                    <ImageUploadField
                      label="个人形象照"
                      desc="用于作品集自我介绍页展示"
                      image={formData.profilePhoto}
                      uploading={uploading['photo'] || false}
                      error={uploadErrors['photo'] || null}
                      onUpload={handleProfilePhotoUpload}
                      onRemove={() => { setFormData({ profilePhoto: null }); }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ── Step 1: 上传作品 ── */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <SectionTitle>作品案例</SectionTitle>
                  <button type="button" onClick={addArtwork}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-medium hover:shadow-lg hover:shadow-indigo-500/25 transition-all duration-300">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    添加作品
                  </button>
                </div>

                {formData.artworks.map((artwork, idx) => (
                  <ArtworkCard
                    key={artwork.id}
                    artwork={artwork}
                    index={idx}
                    total={formData.artworks.length}
                    uploading={uploading}
                    uploadErrors={uploadErrors}
                    onChange={(p) => updateArtwork(artwork.id, p)}
                    onRemove={() => removeArtwork(artwork.id)}
                    onMainImageUpload={(f) => handleMainImageUpload(artwork.id, f)}
                    onAuxImagesUpload={(f) => handleAuxImagesUpload(artwork.id, f)}
                    onRemoveAuxImage={(imgId) => removeAuxImage(artwork.id, imgId)}
                    onThumbnailUpload={(f) => {
                      if (!f) return;
                      uploadImage(`a-${artwork.id}-thumb`, f, (img) => updateArtwork(artwork.id, { thumbnail: img }));
                    }}
                    onRemoveThumbnail={() => { updateArtwork(artwork.id, { thumbnail: null }); }}
                    onRemoveMainImage={() => { updateArtwork(artwork.id, { mainImage: null }); }}
                  />
                ))}

                {formData.artworks.length > 1 && (
                  <button type="button" onClick={addArtwork}
                    className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 hover:border-indigo-300 hover:text-indigo-400 transition-all text-sm font-medium">
                    + 添加更多作品
                  </button>
                )}
              </div>
            )}

            {/* ── Step 2: 风格选择并生成 ── */}
            {currentStep === 2 && (
              <div className="space-y-0">
                <div className="flex flex-col lg:flex-row gap-8">
                  {/* Left column: selections */}
                  <div className="flex-1 space-y-8 min-w-0">
                    {/* 作品集风格 */}
                    <div>
                      <SectionTitle>作品集风格</SectionTitle>
                      <div className="grid grid-cols-2 gap-3">
                        {STYLE_OPTIONS.map((opt) => (
                          <button key={opt.value} type="button"
                            onClick={() => update('portfolioStyle', opt.value)}
                            className={`text-left p-4 rounded-xl border-2 transition-all ${
                              formData.portfolioStyle === opt.value
                                ? 'border-indigo-500 bg-indigo-50 shadow-sm'
                                : 'border-gray-100 hover:border-gray-200 bg-white'
                            }`}>
                            <div
                              className={`w-full h-12 rounded-lg mb-3 ${
                                opt.value === 'simple' ? 'bg-gradient-to-br from-gray-100 to-gray-200' :
                                opt.value === 'designer' ? 'bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400' :
                                opt.value === 'art' ? 'bg-gradient-to-br from-gray-900 to-gray-700' :
                                'bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900'
                              }`}
                            >
                              {opt.value === 'art' && <div className="w-6 h-6 mx-auto mt-3 rounded bg-amber-400/20" />}
                              {opt.value === 'tech' && <div className="w-6 h-6 mx-auto mt-3 rounded-full border border-cyan-400/30" />}
                            </div>
                            <p className="text-sm font-medium text-gray-800">{opt.label}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{opt.desc}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 作品集主色调 */}
                    <div>
                      <SectionTitle>作品集主色调</SectionTitle>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        {THEME_OPTIONS.map((opt) => {
                          const selected = formData.portfolioThemeColor === opt.key;
                          return (
                            <button key={opt.key} type="button"
                              onClick={() => update('portfolioThemeColor', opt.key)}
                              className={`text-left p-3 rounded-xl border-2 transition-all ${
                                selected ? 'border-gray-800 bg-gray-50 shadow-sm' : 'border-gray-100 hover:border-gray-300 bg-white'
                              }`}>
                              <div className="flex gap-1.5 mb-2">
                                {opt.colors.map((c, i) => (
                                  <span key={i} className="w-4 h-4 rounded-full" style={{ backgroundColor: c }} />
                                ))}
                              </div>
                              <p className={`text-xs font-semibold ${selected ? 'text-gray-900' : 'text-gray-700'}`}>{opt.label}</p>
                              <p className="text-[10px] text-gray-400 mt-0.5 leading-relaxed">{opt.desc}</p>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* 版式偏好 */}
                    <div>
                      <SectionTitle>版式偏好</SectionTitle>
                      <div className="grid grid-cols-2 gap-3">
                        {LAYOUT_OPTIONS.map((opt) => (
                          <button key={opt.value} type="button"
                            onClick={() => update('layoutPreference', opt.value)}
                            className={`text-left p-4 rounded-xl border-2 transition-all ${
                              formData.layoutPreference === opt.value
                                ? 'border-indigo-500 bg-indigo-50 shadow-sm'
                                : 'border-gray-100 hover:border-gray-200 bg-white'
                            }`}>
                            <div className={`w-full h-10 rounded-lg mb-3 flex items-center justify-center ${
                              opt.value === 'auto'
                                ? 'bg-gradient-to-br from-indigo-100 to-purple-100'
                                : 'bg-gray-50 border border-gray-100'
                            }`}>
                              {opt.value === 'auto' ? (
                                <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                                </svg>
                              ) : (
                                <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
                                </svg>
                              )}
                            </div>
                            <p className="text-sm font-medium text-gray-800">{opt.label}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{opt.desc}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 联系方式 */}
                    <div>
                      <SectionTitle>联系方式</SectionTitle>
                      <InputField label="" value={formData.contact} onChange={(v) => update('contact', v)} placeholder="邮箱、手机号或微信号" required />
                    </div>
                  </div>

                  {/* Right column: preview */}
                  <div className="lg:w-[340px] shrink-0 flex flex-col items-center justify-start pt-0">
                    <div className="sticky top-24 w-full">
                      <PreviewCard style={formData.portfolioStyle} themeKey={formData.portfolioThemeColor} />
                    </div>
                  </div>
                </div>
              </div>
            )}

          </form>
        </div>

        {/* ═══ Navigation Buttons ═══ */}
        <div className="flex items-center justify-between max-w-3xl mx-auto">
          <div>
            {currentStep > 0 && (
              <button
                type="button"
                onClick={() => setCurrentStep((s) => s - 1)}
                className="inline-flex items-center gap-2 px-5 py-3 border border-gray-200 text-gray-600 font-medium rounded-2xl hover:bg-white hover:border-gray-300 transition-all"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
                上一步
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {currentStep < 2 ? (
              <button
                type="button"
                onClick={() => setCurrentStep((s) => s + 1)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-2xl hover:shadow-xl hover:shadow-indigo-500/25 transition-all duration-300"
              >
                下一步
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleSubmit()}
                className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-2xl hover:shadow-xl hover:shadow-indigo-500/25 transition-all duration-300 hover:-translate-y-0.5 text-lg"
              >
                生成作品集
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
