import { FormData, GeneratedData, Artwork } from './StoreContext';

export function generatePortfolio(data: FormData): GeneratedData {
  const activeArtworks = data.artworks.filter((a) => a.name.trim());

  return {
    portfolioTitle: generatePortfolioTitle(data, activeArtworks),
    positioningStatement: generatePositioning(data),
    optimizedIntro: optimizeIntro(data),
    highlights: generateHighlights(data, activeArtworks),
    skillSummary: summarizeSkills(data.skills, data.toolsUsed),
    artworkDescriptions: activeArtworks.map((a) => ({
      artworkId: a.id,
      name: a.name,
      optimized: optimizeArtworkDescription(a, data),
    })),
    artworkOrder: suggestArtworkOrder(activeArtworks),
    layoutAdvice: generateLayoutAdvice(activeArtworks, data.portfolioStyle),
    aiCapabilityAdvice: generateAIAdvice(data),
    pageDirectory: generatePageDirectory(data, activeArtworks),
  };
}

/* ── 作品集标题 ── */
function generatePortfolioTitle(data: FormData, artworks: Artwork[]): string {
  const { name, jobDirection, targetPosition } = data;
  const role = targetPosition || jobDirection || '设计师';
  const displayName = name || '创作者';

  const types = Array.from(new Set(artworks.map((a) => a.type).filter(Boolean)));
  if (types.length > 0) {
    return `${displayName} 的${types.slice(0, 2).join('·')}作品集 ｜ ${role}`;
  }
  return `${displayName} 的设计作品集 ｜ ${role}`;
}

/* ── 定位语 ── */
function generatePositioning(data: FormData): string {
  const { jobDirection, targetPosition, major, desiredAbilities } = data;
  const role = targetPosition || jobDirection || '设计师';
  const field = jobDirection || major || '创意设计';
  if (desiredAbilities) {
    const abilities = desiredAbilities.split(/[,，、；;\s]+/).filter(Boolean).slice(0, 3);
    return `${role} ｜ 专注${field} · ${abilities.join(' · ')}`;
  }
  return `${role} ｜ 专注${field} · 用创意驱动设计`;
}

/* ── 个人介绍 ── */
function optimizeIntro(data: FormData): string {
  const { name, school, major, jobDirection, personalIntro, desiredAbilities } = data;
  const displayName = name || '同学';
  const schoolInfo = school && major ? `${school} ${major}专业` : school || major || '在读学生';

  if (!personalIntro.trim()) {
    return [
      `我是${displayName}，${schoolInfo}。`,
      `在校期间专注于${jobDirection || '创意设计'}的学习与实践，`,
      `对视觉表达与用户体验保持敏锐的感知力。`,
      `追求功能与审美的平衡，`,
      `致力于创作有温度、有影响力的作品。`,
    ].join('');
  }

  const cleaned = personalIntro.trim().replace(/[。！？，,]$/, '');
  const abilityTag = desiredAbilities
    ? `擅长${desiredAbilities.split(/[,，、；;\s]+/).filter(Boolean).slice(0, 2).join('、')}，`
    : '';
  return [
    `我是${displayName}，${schoolInfo}，${cleaned}。`,
    abilityTag,
    `在${jobDirection || '专业领域'}方向上持续深耕，`,
    `注重创意表达与视觉叙事。`,
    `希望加入有创造力的团队，做出有温度、有影响力的作品。`,
  ].join('');
}

/* ── 求职亮点 ── */
function generateHighlights(data: FormData, artworks: Artwork[]): string[] {
  const h: string[] = [];
  const { school, major, jobDirection, targetPosition, internship, desiredAbilities } = data;

  if (school && major) h.push(`${school} ${major}专业背景，具备系统的设计训练与审美素养`);
  if (jobDirection || targetPosition) h.push(`明确的职业方向——${targetPosition || jobDirection}，有清晰的成长路径`);
  if (internship && internship.trim().length > 10) h.push('拥有真实工作场景的实践经验，熟悉团队协作与企业级设计流程');
  if (artworks.length > 0) h.push(`${artworks.length} 组完整作品展示，涵盖${Array.from(new Set(artworks.map((a) => a.type).filter(Boolean))).join('、') || '多个品类'}`);
  if (artworks.filter((a) => a.mainImage || a.auxImages.length > 0).length > 0) h.push('作品配有完整视觉展示，可直接用于求职投递');
  if (desiredAbilities && desiredAbilities.trim()) {
    const abilities = desiredAbilities.split(/[,，、；;\s]+/).filter(Boolean).slice(0, 2);
    h.push(`核心能力突出：${abilities.join('、')}`);
  }
  h.push('保持对设计趋势与技术工具的持续关注，学习敏锐度高');
  return h;
}

/* ── 技能总结 ── */
function summarizeSkills(skills: string, toolsUsed: string): { category: string; items: string[] }[] {
  const allSkills = [...skills.split(/[,，、;\s]+/), ...toolsUsed.split(/[,，、;\s]+/)]
    .map((s) => s.trim()).filter(Boolean);
  if (allSkills.length === 0) return [];

  const categories: { category: string; items: string[] }[] = [];
  const design = /figma|sketch|photoshop|illustrator|after.?effects|premiere|blender|c4d|cinema.?4d|zeplin|invision|principle|framer|adobe.?xd|lightroom|indesign|coreldraw|procreate|canva/i;
  const dev = /html|css|javascript|typescript|react|vue|angular|node|python|java|swift|kotlin|flutter|golang|rust|php|sql|mongodb|git|docker|webpack|vite|next|nuxt/i;
  const media = /premiere|final.?cut|davinci|resolve|after.?effects|摄影|摄像|剪辑|拍摄|后期|调色|录音|混音|audition/i;
  const ai = /chatgpt|midjourney|stable.?diffusion|dall.?e|copilot|claude|gemini|notion.?ai|runway|pika|sora|ai|人工智能/i;

  const d = allSkills.filter((s) => design.test(s));
  const dv = allSkills.filter((s) => dev.test(s));
  const md = allSkills.filter((s) => media.test(s));
  const aiT = allSkills.filter((s) => ai.test(s));
  const other = allSkills.filter((s) => !design.test(s) && !dev.test(s) && !media.test(s) && !ai.test(s));

  if (d.length) categories.push({ category: '设计工具', items: Array.from(new Set(d)) });
  if (dv.length) categories.push({ category: '开发技术', items: Array.from(new Set(dv)) });
  if (md.length) categories.push({ category: '媒体制作', items: Array.from(new Set(md)) });
  if (aiT.length) categories.push({ category: 'AI 工具', items: Array.from(new Set(aiT)) });
  if (other.length) categories.push({ category: '其他技能', items: Array.from(new Set(other)) });
  return categories;
}

/* ── 作品描述优化 ── */
function optimizeArtworkDescription(artwork: Artwork, _data: FormData): string {
  const { name, type, description, tools, highlights } = artwork;
  const typeLabel = type ? `「${type}」作品` : '作品';
  const namePart = name ? `《${name}》` : '';

  if (!description.trim()) {
    const toolPart = tools ? `运用${tools.trim().replace(/[，,、；;\s]+$/, '')}完成，` : '';
    const highlightPart = highlights ? `着重呈现${highlights.trim().replace(/[。！？，,]$/, '')}。` : '注重创意表达与细节打磨，力求让作品兼具视觉冲击力与实用价值。';
    return `${namePart}${typeLabel}，${toolPart}${highlightPart}`;
  }

  const cleaned = description.trim().replace(/[。！？，,]$/, '');
  const toolPart = tools ? `。在创作过程中使用${tools.trim().replace(/[，,、；;\s]+$/, '')}` : '';
  const highlightPart = highlights ? `，作品亮点在于${highlights.trim().replace(/[。！？，,]$/, '')}` : '';
  return `${namePart}${typeLabel}——${cleaned}${toolPart}${highlightPart}。`;
}

/* ── 作品排序建议 ── */
function suggestArtworkOrder(artworks: Artwork[]): string[] {
  if (artworks.length <= 1) return artworks.map((a) => a.id);
  // simple heuristic: artworks with images first, then by name existence
  const hasImage = (a: Artwork) => !!a.mainImage || a.auxImages.length > 0;
  const withImages = artworks.filter(hasImage);
  const withoutImages = artworks.filter((a) => !hasImage(a));
  return [...withImages, ...withoutImages].map((a) => a.id);
}

/* ── 图片排版建议 ── */
function generateLayoutAdvice(artworks: Artwork[], style: string): string {
  const totalImages = artworks.reduce((sum, a) => sum + (a.mainImage ? 1 : 0) + a.auxImages.length, 0);
  if (totalImages === 0) return '尚未上传作品图片。建议为每组作品上传至少 2-3 张高质量展示图，让作品集更具视觉说服力。';

  const styleLabel =
    style === 'designer' ? '设计师风格' :
    style === 'art' ? '艺术展览风格' :
    style === 'tech' ? 'AI 科技风格' : '简洁求职风格';

  return [
    `你选择了「${styleLabel}」，共有 ${artworks.length} 组作品、${totalImages} 张图片。`,
    artworks.length <= 2
      ? '建议采用大幅图片 + 全屏展示，让每组作品有充分的视觉呼吸空间。'
      : '建议采用网格展示，每组作品用 3 列或 2 列布局排列图片，重要作品放大展示。',
    '每组作品之间用留白或分割线区隔，保持视觉节奏感。',
    '精美的作品图片是设计作品集最核心的竞争力，优先确保图片清晰且有足够的展示面积。',
  ].join('');
}

/* ── AI 能力建议 ── */
function generateAIAdvice(data: FormData): string {
  const { aiToolUsage, jobDirection } = data;
  if (!aiToolUsage || !aiToolUsage.trim()) {
    return [
      '善用AI工具提升创作效率已成为设计师的核心竞争力之一。',
      '建议尝试在日常工作流中引入AI：用 Midjourney / DALL·E 进行视觉灵感探索，',
      '用 ChatGPT / Claude 辅助文案润色，用 AI 设计助手加速素材生成。',
      '在作品集中展示「AI + 设计」工作流，会让你的能力更具时代感。',
    ].join('');
  }
  return [
    `你已在创作中运用 AI 工具（${aiToolUsage.trim().replace(/[。！？，,]$/, '')}），`,
    '这是值得在作品集中突出的差异化亮点。',
    '建议展示：① 在哪些环节使用AI（灵感/素材/文案/效率），',
    '② AI辅助前后对比，③ 你对「AI+创作」工作流的思考。',
  ].join('');
}

/* ── 页面目录 ── */
function generatePageDirectory(data: FormData, artworks: Artwork[]): string[] {
  const pages: string[] = ['01 封面 — 姓名、定位语、联系方式'];
  if (data.personalIntro || data.desiredAbilities) pages.push('02 关于我 — 个人介绍与职业目标');
  if (data.skills || data.toolsUsed) pages.push('03 技能工具 — 工具链与技术栈');
  artworks.forEach((a, i) => {
    pages.push(`${String(pages.length + 1).padStart(2, '0')} 作品${i + 1} — ${a.name || '未命名作品'}`);
  });
  if (data.internship && data.internship.trim().length > 5) pages.push(`${String(pages.length + 1).padStart(2, '0')} 实习经历`);
  if (data.aiToolUsage) pages.push(`${String(pages.length + 1).padStart(2, '0')} AI 工作流`);
  pages.push(`${String(pages.length + 1).padStart(2, '0')} 联系方式`);
  return pages;
}
