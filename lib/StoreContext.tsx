'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';

/* ── Artwork & Image types ── */
export interface ArtworkImage {
  id: string;
  dataUrl: string;
}
export interface Artwork {
  id: string;
  name: string;
  type: string;
  description: string;
  tools: string;
  highlights: string;
  mainImage: ArtworkImage | null;
  auxImages: ArtworkImage[];
  thumbnail: ArtworkImage | null;
}

/* ── Form data ── */
export interface FormData {
  name: string;
  school: string;
  major: string;
  jobDirection: string;
  targetPosition: string;
  personalIntro: string;
  desiredAbilities: string;
  skills: string;
  toolsUsed: string;
  aiToolUsage: string;
  internship: string;
  contact: string;
  artworks: Artwork[];
  portfolioStyle: string;
  portfolioThemeColor: string;
  coverImage: ArtworkImage | null;
  profilePhoto: ArtworkImage | null;
}

/* ── Generated data ── */
export interface SkillCategory {
  category: string;
  items: string[];
}

export interface ArtworkDescription {
  artworkId: string;
  name: string;
  optimized: string;
}

export interface GeneratedData {
  portfolioTitle: string;
  positioningStatement: string;
  optimizedIntro: string;
  highlights: string[];
  skillSummary: SkillCategory[];
  artworkDescriptions: ArtworkDescription[];
  artworkOrder: string[];
  layoutAdvice: string;
  aiCapabilityAdvice: string;
  pageDirectory: string[];
}

/* ── State ── */
function newArtwork(): Artwork {
  return { id: `a${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, name: '', type: '', description: '', tools: '', highlights: '', mainImage: null, auxImages: [], thumbnail: null };
}

const defaultFormData: FormData = {
  name: '', school: '', major: '', jobDirection: '', targetPosition: '',
  personalIntro: '', desiredAbilities: '',
  skills: '', toolsUsed: '', aiToolUsage: '',
  internship: '', contact: '',
  artworks: [newArtwork()],
  portfolioStyle: 'designer',
  portfolioThemeColor: 'red',
  coverImage: null,
  profilePhoto: null,
};

interface AppState { formData: FormData; generatedData: GeneratedData | null; }

const initialState: AppState = { formData: defaultFormData, generatedData: null };

type Action =
  | { type: 'SET_FORM_DATA'; payload: Partial<FormData> }
  | { type: 'SET_GENERATED_DATA'; payload: GeneratedData }
  | { type: 'RESET' };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_FORM_DATA':
      return { ...state, formData: { ...state.formData, ...action.payload } };
    case 'SET_GENERATED_DATA':
      return { ...state, generatedData: action.payload };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

interface StoreContextType {
  state: AppState;
  setFormData: (data: Partial<FormData>) => void;
  setGeneratedData: (data: GeneratedData) => void;
  reset: () => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

function loadState(): AppState {
  if (typeof window === 'undefined') return initialState;
  try {
    const saved = localStorage.getItem('portfolio-ai-state');
    if (!saved) return initialState;
    const parsed = JSON.parse(saved);
    const fd = { ...defaultFormData, ...(parsed.formData || {}) };
    // migrate old artwork.images[] → mainImage / auxImages / thumbnail
    if (fd.artworks) {
      fd.artworks = fd.artworks.map((a: any) => {
        if (a.images && !('mainImage' in a)) {
          const imgs = a.images || [];
          return { ...a, mainImage: imgs[0] || null, auxImages: imgs.slice(1), thumbnail: null };
        }
        return a;
      });
    }
    // keep Cloudinary URLs (https://), discard blob: and data: URLs
    const keepImage = (img: any) => {
      if (!img?.dataUrl) return false;
      const url = String(img.dataUrl);
      return url.startsWith('https://');
    };
    fd.coverImage = keepImage(fd.coverImage) ? fd.coverImage : null;
    fd.profilePhoto = keepImage(fd.profilePhoto) ? fd.profilePhoto : null;
    fd.artworks = fd.artworks.map((a: any) => ({
      ...a,
      mainImage: keepImage(a.mainImage) ? a.mainImage : null,
      auxImages: (a.auxImages || []).filter((img: any) => keepImage(img)),
      thumbnail: keepImage(a.thumbnail) ? a.thumbnail : null,
    }));
    const merged: AppState = {
      formData: fd,
      generatedData: parsed.generatedData || null,
    };
    // invalidate old generatedData that lack new fields
    if (merged.generatedData && !('portfolioTitle' in merged.generatedData)) {
      merged.generatedData = null;
    }
    return merged;
  } catch {
    return initialState;
  }
}

export { newArtwork };

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, null, () => loadState());

  useEffect(() => {
    try {
      const fd = state.formData;
      const persistImg = (img: any) => {
        if (!img?.dataUrl) return null;
        const url = String(img.dataUrl);
        return url.startsWith('https://') ? img : null;
      };
      const filterAux = (imgs: any[]) => imgs.filter((img) => persistImg(img));
      const toStore = {
        formData: {
          ...fd,
          coverImage: persistImg(fd.coverImage),
          profilePhoto: persistImg(fd.profilePhoto),
          artworks: fd.artworks.map((a) => ({
            id: a.id,
            name: a.name,
            type: a.type,
            description: a.description,
            tools: a.tools,
            highlights: a.highlights,
            mainImage: persistImg(a.mainImage),
            auxImages: filterAux(a.auxImages),
            thumbnail: persistImg(a.thumbnail),
          })),
        },
        generatedData: state.generatedData,
      };
      localStorage.setItem('portfolio-ai-state', JSON.stringify(toStore));
    } catch {
      console.warn('localStorage 保存失败，可能是数据过大');
    }
  }, [state]);

  const setFormData = (data: Partial<FormData>) => dispatch({ type: 'SET_FORM_DATA', payload: data });
  const setGeneratedData = (data: GeneratedData) => dispatch({ type: 'SET_GENERATED_DATA', payload: data });
  const reset = () => dispatch({ type: 'RESET' });

  return (
    <StoreContext.Provider value={{ state, setFormData, setGeneratedData, reset }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within a StoreProvider');
  return context;
}
