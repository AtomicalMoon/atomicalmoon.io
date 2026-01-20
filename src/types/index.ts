// TypeScript type definitions for the entire application

export interface SiteConfig {
  animations: {
    enabled: boolean;
    duration: number;
    easing: string;
    scrollThreshold: number;
    staggerDelay: number;
    parallaxSpeed: number;
  };
  particles: {
    enabled: boolean;
    count: number;
    speed: number;
    sizeMin: number;
    sizeMax: number;
    opacity: number;
    color: string;
    connectionDistance: number;
    showConnections: boolean;
  };
  stars: {
    enabled: boolean;
    countBack: number;
    countMid: number;
    countFront: number;
    twinkleSpeed: number;
  };
  effects: {
    lightbox: boolean;
    cursorEffects: boolean;
    magneticButtons: boolean;
    parallax3D: boolean;
    tilt3D: boolean;
    smoothScroll: boolean;
  };
  performance: {
    reduceMotion: boolean;
    throttleScroll: boolean;
    throttleResize: boolean;
    useWillChange: boolean;
  };
  theme: {
    name: string;
    colors: {
      bgPrimary: string;
      bgSecondary: string;
      textPrimary: string;
      accent: string;
    };
  };
}

export interface Particle {
  element: SVGCircleElement;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
}

export interface Plugin {
  init?: () => void;
  destroy?: () => void;
  resize?: () => void;
  [key: string]: any;
}

export interface AnimationPreset {
  opacity?: number;
  x?: number;
  y?: number;
  scale?: number;
  rotation?: number;
  duration: number;
  ease: string;
}

export interface GalleryItem {
  id: string;
  src: string;
  alt: string;
  title?: string;
  description?: string;
  tags?: string[];
}

export interface CommissionRequest {
  name: string;
  email: string;
  type: 'model' | 'texture' | 'render' | 'other';
  description: string;
  budget?: number;
  deadline?: string;
}

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface DatabaseConfig {
  type: 'sqlite' | 'postgresql' | 'mysql';
  path?: string;
  host?: string;
  port?: number;
  database?: string;
  username?: string;
  password?: string;
}
