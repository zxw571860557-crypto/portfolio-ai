'use client';

import { useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useStore, FormData, Artwork, ArtworkImage, newArtwork } from '@/lib/StoreContext';
import { generatePortfolio } from '@/lib/mockAI';
import { THEME_OPTIONS, ThemeKey } from '@/lib/themes';
import { uploadToCloudinary, UploadError } from '@/lib/cloudinary';

const ARTWORK_TYPES = ['海报设计', '品牌设计', 'UI设计', '空间设计', '插画', '摄影', 'AI视觉', '其他'];
const STYLE_OPTIONS = [
  { value: 'simple', label: '简洁求职风', desc: '干净利落、重点突出，适合简历投递' },
  { value: 'designer', label: '设计师作品集风', desc: '大胆撞色、视觉优先，适合展示设计能力' },
  { value: 'art', label: '艺术展览风', desc: '暗色背景、大图展示，像在画廊看展' },
  { value: 'tech', label: 'AI 科技风', desc: '渐变光效、科技质感，适合数字创作者' },
];

/* ── Reused components ── */
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
function InputField({ label, value, onChange, placeholder, required }: { label: string; value: string; onChange: (v: string) => void; placeholder: string; required?: boolean }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}{required && <span className="text-indigo-500 ml-0.5">*</span>}</label>
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all bg-white text-sm" />
    </div>
  );
}
function TextareaField({ label, value, onChange, placeholder, rows }: { label: string; value: string; onChange: (v: string) => void; placeholder: string; rows: number }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={rows} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all resize-none bg-white text-sm" />
    </div>
  );
}
function SectionCard({ title, desc, children }: { title: string; desc: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-5">
      <h2 className="text-lg font-semibold text-gray-900 mb-1">{title}</h2>
      <p className="text-sm text-gray-400 mb-5">{desc}</p>
      {children}
    </div>
  );
}

export default function FormPage() {
  const router = useRouter();
  const { state, setFormData, setGeneratedData } = useStore();
  const { formData } = state;

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const generated = generatePortfolio(formData);
    setGeneratedData(generated);
    router.push('/generate');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <StepIndicator current={0} />
        <form onSubmit={handleSubmit}>

          {/* 基本信息 */}
          <SectionCard title="基本信息" desc="让招聘方知道你是谁">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <InputField label="姓名" value={formData.name} onChange={(v) => update('name', v)} placeholder="你的姓名" required />
              <InputField label="学校" value={formData.school} onChange={(v) => update('school', v)} placeholder="就读学校" required />
              <InputField label="专业" value={formData.major} onChange={(v) => update('major', v)} placeholder="所学专业" required />
            </div>
          </SectionCard>

          {/* 封面设置 */}
          <SectionCard title="封面设置" desc="设置作品集封面和个人照片">
            <div className="mb-5 px-3 py-2 rounded-lg bg-indigo-50/60 border border-indigo-100 text-xs text-indigo-500">
              当前版本已支持云端图片存储，上传后的图片可在刷新或更换设备后继续显示。
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ImageUploadField
                label="封面主图"
                desc="作品集封面展示的图片"
                image={formData.coverImage}
                uploading={uploading['cover'] || false}
                error={uploadErrors['cover'] || null}
                slotKey="cover"
                onUpload={handleCoverUpload}
                onRemove={() => { setFormData({ coverImage: null }); }}
              />
              <ImageUploadField
                label="个人形象照"
                desc="请上传竖版人物照，以获得更好的作品集展示效果"
                image={formData.profilePhoto}
                uploading={uploading['photo'] || false}
                error={uploadErrors['photo'] || null}
                slotKey="photo"
                onUpload={handleProfilePhotoUpload}
                onRemove={() => { setFormData({ profilePhoto: null }); }}
              />
            </div>
          </SectionCard>

          {/* 求职意向 */}
          <SectionCard title="求职意向" desc="明确你的目标岗位">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField label="求职方向" value={formData.jobDirection} onChange={(v) => update('jobDirection', v)} placeholder="如：UI 设计师、品牌设计师" required />
              <InputField label="目标岗位" value={formData.targetPosition} onChange={(v) => update('targetPosition', v)} placeholder="如：初级UI设计师、视觉设计实习生" />
            </div>
          </SectionCard>

          {/* 自我描述 */}
          <SectionCard title="自我描述" desc="告诉 AI 你是谁，它才能更好地表达你">
            <div className="space-y-4">
              <TextareaField label="个人介绍" value={formData.personalIntro} onChange={(v) => update('personalIntro', v)} placeholder="描述你的背景和创作兴趣。例如：我热爱视觉设计，擅长用图形和色彩传达品牌理念..." rows={3} />
              <TextareaField label="希望突出的个人能力" value={formData.desiredAbilities} onChange={(v) => update('desiredAbilities', v)} placeholder="如：视觉设计、品牌策划、用户研究、跨团队协作" rows={2} />
            </div>
          </SectionCard>

          {/* 技能与AI工具 */}
          <SectionCard title="技能与 AI 工具" desc="展示你的工具链">
            <div className="space-y-4">
              <TextareaField label="技能工具" value={formData.skills} onChange={(v) => update('skills', v)} placeholder="用逗号分隔，如：Figma, Photoshop, Illustrator, After Effects" rows={2} />
              <TextareaField label="AI 工具使用情况" value={formData.aiToolUsage} onChange={(v) => update('aiToolUsage', v)} placeholder="如：用 Midjourney 生成设计灵感、用 ChatGPT 优化文案" rows={2} />
            </div>
          </SectionCard>

          {/* ── 作品案例（核心）── */}
          <SectionCard title="作品案例" desc="上传你的设计作品，这是作品集最重要的部分">
            <div className="space-y-6">
              {formData.artworks.map((artwork, idx) => (
                <ArtworkCard
                  key={artwork.id}
                  artwork={artwork}
                  index={idx}
                  total={formData.artworks.length}
                  uploading={uploading}
                  uploadErrors={uploadErrors}
                  clearError={clearError}
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

              <button type="button" onClick={addArtwork}
                className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 hover:border-indigo-300 hover:text-indigo-400 transition-all text-sm font-medium">
                + 添加作品
              </button>
            </div>
          </SectionCard>

          {/* 实习经历 */}
          <SectionCard title="实习经历" desc="如果有相关实习经历，这里填写">
            <TextareaField label="实习经历" value={formData.internship} onChange={(v) => update('internship', v)} placeholder="描述你的实习经历，包括公司、岗位、工作内容和收获..." rows={3} />
          </SectionCard>

          {/* ── 作品集风格选择 ── */}
          <SectionCard title="作品集风格" desc="选择一种视觉风格，影响作品集的整体呈现">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {STYLE_OPTIONS.map((opt) => (
                <button key={opt.value} type="button"
                  onClick={() => update('portfolioStyle', opt.value)}
                  className={`text-left p-4 rounded-xl border-2 transition-all ${formData.portfolioStyle === opt.value ? 'border-indigo-500 bg-indigo-50 shadow-sm' : 'border-gray-100 hover:border-gray-200 bg-white'}`}>
                  <div className={`w-full h-16 rounded-lg mb-3 ${opt.value === 'simple' ? 'bg-gradient-to-br from-gray-100 to-gray-200' : opt.value === 'designer' ? 'bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400' : opt.value === 'art' ? 'bg-gradient-to-br from-gray-900 to-gray-700' : 'bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900'}`}>
                    {opt.value === 'art' && <div className="w-8 h-8 mx-auto mt-4 rounded bg-amber-400/20" />}
                    {opt.value === 'tech' && <div className="w-8 h-8 mx-auto mt-4 rounded-full border border-cyan-400/30" />}
                  </div>
                  <p className="text-sm font-medium text-gray-800">{opt.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{opt.desc}</p>
                </button>
              ))}
            </div>
          </SectionCard>

          {/* ── 作品集主色调 ── */}
          <SectionCard title="作品集主色调" desc="选择一种颜色基调，影响整个作品集的视觉气质">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {THEME_OPTIONS.map((opt) => {
                const selected = formData.portfolioThemeColor === opt.key;
                return (
                  <button key={opt.key} type="button"
                    onClick={() => update('portfolioThemeColor', opt.key)}
                    className={`text-left p-4 rounded-xl border-2 transition-all ${selected ? 'border-gray-800 bg-gray-50 shadow-sm' : 'border-gray-100 hover:border-gray-300 bg-white'}`}>
                    <div className="flex gap-1.5 mb-3">
                      {opt.colors.map((c, i) => (
                        <span key={i} className="w-5 h-5 rounded-full" style={{ backgroundColor: c }} />
                      ))}
                    </div>
                    <p className={`text-sm font-semibold ${selected ? 'text-gray-900' : 'text-gray-700'}`}>{opt.label}</p>
                    <p className="text-xs text-gray-400 mt-1 leading-relaxed">{opt.desc}</p>
                  </button>
                );
              })}
            </div>
          </SectionCard>

          {/* 联系方式 */}
          <SectionCard title="联系方式" desc="让招聘方能找到你">
            <InputField label="联系方式" value={formData.contact} onChange={(v) => update('contact', v)} placeholder="邮箱、手机号或微信号" required />
          </SectionCard>

          <button type="submit"
            className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-2xl hover:shadow-xl hover:shadow-indigo-500/25 transition-all duration-300 hover:-translate-y-0.5 text-lg">
            生成我的作品集
          </button>
        </form>
      </div>
    </div>
  );
}

/* ── Image upload field (single) ── */
function ImageUploadField({ label, desc, image, uploading, error, onUpload, onRemove, slotKey }: {
  label: string; desc: string;
  image: ArtworkImage | null;
  uploading: boolean;
  error: string | null;
  onUpload: (file: File | null) => void;
  onRemove: () => void;
  slotKey: string;
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
      {error && (
        <p className="mt-1.5 text-xs text-red-500">{error}</p>
      )}
    </div>
  );
}

/* ── Individual Artwork Card ── */
function ArtworkCard({ artwork, index, total, onChange, onRemove, onMainImageUpload, onAuxImagesUpload, onRemoveAuxImage, onThumbnailUpload, onRemoveMainImage, onRemoveThumbnail, uploading, uploadErrors, clearError }: {
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
  clearError: (key: string) => void;
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

        {/* 3-tier image upload */}
        <div className="border-t border-gray-200 pt-4 space-y-4">
          <p className="text-sm font-medium text-gray-700">作品图片</p>

          {/* Main image */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">作品主图 <span className="text-indigo-400">（封面大图）</span></label>
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
            <label className="block text-xs font-medium text-gray-500 mb-1.5">目录缩略图 <span className="text-gray-400">（可选，用于目录页小图展示）</span></label>
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
