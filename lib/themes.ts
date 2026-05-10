export type ThemeKey = 'red' | 'blue' | 'green' | 'mono' | 'purple';

export interface ThemeColors {
  primary: string;
  primaryLight: string;
  secondary: string;
  onPrimary: string;
  background: string;
  bgAlt: string;
  surface: string;
  text: string;
  textMuted: string;
  divider: string;
  numberColor: string;
  accentBar: string;
  tagBg: string;
}

export interface ThemeOption {
  key: ThemeKey;
  label: string;
  desc: string;
  colors: [string, string, string];
}

export const THEME_OPTIONS: ThemeOption[] = [
  {
    key: 'red',
    label: 'Creative Red',
    desc: '强烈 · 年轻 · 有冲击力 — 适合视觉设计 / 品牌设计',
    colors: ['#C41E3A', '#E8455B', '#F8D0D6'],
  },
  {
    key: 'blue',
    label: 'Deep Blue',
    desc: '理性 · 专业 · 科技感 — 适合产品设计 / UI设计',
    colors: ['#1A3A5C', '#2D6DA4', '#D0E0F0'],
  },
  {
    key: 'green',
    label: 'Gallery Green',
    desc: '自然 · 安静 · 高级 — 适合空间设计 / 建筑设计',
    colors: ['#2D5A3D', '#4A8B5C', '#D0E8D4'],
  },
  {
    key: 'mono',
    label: 'Minimal Mono',
    desc: '极简 · 克制 · 专业 — 适合建筑 / 学术型作品集',
    colors: ['#1A1A1A', '#666666', '#D4D4D4'],
  },
  {
    key: 'purple',
    label: 'AI Purple',
    desc: '未来感 · AI感 · 年轻 — 适合AIGC / 数字媒体',
    colors: ['#5B3E96', '#8B6FC0', '#E0D8F0'],
  },
];

export const THEME_MAP: Record<ThemeKey, ThemeColors> = {
  red: {
    primary: '#C41E3A',
    primaryLight: '#FEF0F2',
    secondary: '#E8455B',
    onPrimary: '#FFFFFF',
    background: '#FFFFFF',
    bgAlt: '#FAFAF8',
    surface: '#FDF8F9',
    text: '#1A1A1A',
    textMuted: '#9E8A8A',
    divider: '#E8D8D8',
    numberColor: '#F5E0E4',
    accentBar: '#C41E3A',
    tagBg: '#FEF0F2',
  },
  blue: {
    primary: '#1A3A5C',
    primaryLight: '#EEF2F6',
    secondary: '#2D6DA4',
    onPrimary: '#FFFFFF',
    background: '#FFFFFF',
    bgAlt: '#F8F9FA',
    surface: '#F5F7FA',
    text: '#1A1A1A',
    textMuted: '#8A94A0',
    divider: '#D8DEE4',
    numberColor: '#E4EAF0',
    accentBar: '#2D6DA4',
    tagBg: '#EEF2F6',
  },
  green: {
    primary: '#2D5A3D',
    primaryLight: '#EEF4EF',
    secondary: '#4A8B5C',
    onPrimary: '#FFFFFF',
    background: '#FFFFFF',
    bgAlt: '#FAFAF6',
    surface: '#F5F8F5',
    text: '#1A1A1A',
    textMuted: '#8A9890',
    divider: '#D4E0D8',
    numberColor: '#E4ECE6',
    accentBar: '#4A8B5C',
    tagBg: '#EEF4EF',
  },
  mono: {
    primary: '#1A1A1A',
    primaryLight: '#F0F0F0',
    secondary: '#555555',
    onPrimary: '#FFFFFF',
    background: '#FFFFFF',
    bgAlt: '#F8F8F8',
    surface: '#FAFAFA',
    text: '#1A1A1A',
    textMuted: '#999999',
    divider: '#D4D4D4',
    numberColor: '#ECECEC',
    accentBar: '#1A1A1A',
    tagBg: '#F0F0F0',
  },
  purple: {
    primary: '#5B3E96',
    primaryLight: '#F2EEF8',
    secondary: '#8B6FC0',
    onPrimary: '#FFFFFF',
    background: '#FFFFFF',
    bgAlt: '#FAF8FC',
    surface: '#F7F4FA',
    text: '#1A1A1A',
    textMuted: '#9A92A8',
    divider: '#D8D0E8',
    numberColor: '#ECE4F4',
    accentBar: '#8B6FC0',
    tagBg: '#F2EEF8',
  },
};

export const DEFAULT_THEME: ThemeKey = 'red';
