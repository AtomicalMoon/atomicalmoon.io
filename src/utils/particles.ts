// TypeScript implementation of Particle System
import type { Particle, SiteConfig } from '../types';
import { loadWasmParticles, type WasmParticles } from './wasmParticles';

export class ParticleSystem {
  private particles: Particle[] = [];
  private container: SVGSVGElement | null = null;
  private animationId: number | null = null;
  private config: SiteConfig['particles'];
  private animateBound: FrameRequestCallback;
  private connectionsGroup: SVGGElement | null = null;
  private connectionPool: SVGLineElement[] = [];
  private mouse = { x: 0, y: 0, active: false };
  private wasm: WasmParticles | null = null;

  constructor(config: SiteConfig['particles']) {
    this.config = config;
    this.animateBound = this.animate.bind(this);
  }

  init(containerId: string): void {
    if (!this.config.enabled) return;
    
    this.container = document.getElementById(containerId) as SVGSVGElement;
    if (!this.container) {
      console.error(`Container with id "${containerId}" not found`);
      return;
    }

    // Group for connections to avoid removing other children
    this.connectionsGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    this.connectionsGroup.classList.add('particle-connections');
    this.container.appendChild(this.connectionsGroup);

    this.createParticles();
    this.setupInteractions();
    // Try to load WASM; if successful use it for updates when possible
    loadWasmParticles('/particles.wasm').then(w => {
      this.wasm = w;
      console.log('✅ Particle WASM loaded');
    }).catch(() => {
      // silently ignore - fallback to JS
    }).finally(() => {
      this.animationId = requestAnimationFrame(this.animateBound);
    });
  }

  private createParticles(): void {
    const count = this.config.count;
    const width = window.innerWidth;
    const height = window.innerHeight;

    for (let i = 0; i < count; i++) {
      const size = Math.random() * (this.config.sizeMax - this.config.sizeMin) + this.config.sizeMin;
      const element = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      element.setAttribute('r', size.toString());
      element.setAttribute('fill', this.config.color);
      element.setAttribute('opacity', this.config.opacity.toString());
      element.classList.add('particle');

      const x = Math.random() * width;
      const y = Math.random() * height;

      element.setAttribute('cx', x.toString());
      element.setAttribute('cy', y.toString());

      const particle: Particle = {
        element,
        x,
        y,
        vx: (Math.random() - 0.5) * this.config.speed,
        vy: (Math.random() - 0.5) * this.config.speed,
        size
      };

      this.particles.push(particle);
      if (this.container) this.container.appendChild(element);
    }
  }

  private animate(): void {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const maxDist = this.config.connectionDistance;
    const maxDistSq = maxDist * maxDist;

    // If WASM is loaded and memory big enough, copy particle data into WASM memory,
    // call updateParticles, then read back positions. This reduces per-particle work in JS.
    if (this.wasm && this.wasm.floatView.buffer.byteLength >= (this.particles.length * 5 * 4)) {
      const fv = this.wasm.floatView;
      // copy particles: x,y,vx,vy,size
      for (let i = 0; i < this.particles.length; i++) {
        const p = this.particles[i];
        const base = i * 5;
        fv[base] = p.x;
        fv[base + 1] = p.y;
        fv[base + 2] = p.vx;
        fv[base + 3] = p.vy;
        fv[base + 4] = p.size;
      }

      try {
        this.wasm.updateParticles(this.particles.length, 1 / 60, w, h);
        // copy back positions and velocities
        for (let i = 0; i < this.particles.length; i++) {
          const base = i * 5;
          const p = this.particles[i];
          p.x = fv[base];
          p.y = fv[base + 1];
          p.vx = fv[base + 2];
          p.vy = fv[base + 3];
          p.element.setAttribute('cx', p.x.toString());
          p.element.setAttribute('cy', p.y.toString());
        }
      } catch (e) {
        // If WASM fails at runtime, drop it and fallback to JS
        console.error('Particle WASM error, falling back to JS', e);
        this.wasm = null;
      }
    } else {
      for (let i = 0, len = this.particles.length; i < len; i++) {
        const p = this.particles[i];

        // Apply velocity
        p.x += p.vx;
        p.y += p.vy;

        // Mouse interaction (cheap): only when active
        if (this.mouse.active) {
          const dx = this.mouse.x - p.x;
          const dy = this.mouse.y - p.y;
          const distSq = dx * dx + dy * dy;
          if (distSq < 100 * 100 && distSq > 0.0001) {
            const dist = Math.sqrt(distSq);
            const force = 100 / dist;
            p.vx -= (dx / dist) * force * 0.01;
            p.vy -= (dy / dist) * force * 0.01;
          }
        }

        // Boundary checks
        if (p.x < 0) { p.x = 0; p.vx *= -1; }
        else if (p.x > w) { p.x = w; p.vx *= -1; }
        if (p.y < 0) { p.y = 0; p.vy *= -1; }
        else if (p.y > h) { p.y = h; p.vy *= -1; }

        p.element.setAttribute('cx', p.x.toString());
        p.element.setAttribute('cy', p.y.toString());
      }
    }

    if (this.config.showConnections && this.connectionsGroup) {
      this.drawConnections(maxDist, maxDistSq);
    }

    this.animationId = requestAnimationFrame(this.animateBound);
  }

  private drawConnections(maxDist: number, maxDistSq: number): void {
    if (!this.connectionsGroup) return;

    let poolIndex = 0;
    const len = this.particles.length;

    for (let i = 0; i < len; i++) {
      const p1 = this.particles[i];
      for (let j = i + 1; j < len; j++) {
        const p2 = this.particles[j];
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const distSq = dx * dx + dy * dy;

        if (distSq < maxDistSq) {
          const dist = Math.sqrt(distSq);
          const opacity = ((1 - dist / maxDist) * 0.3).toString();

          let line: SVGLineElement;
          if (poolIndex < this.connectionPool.length) {
            line = this.connectionPool[poolIndex];
          } else {
            line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.classList.add('particle-connection');
            this.connectionPool.push(line);
            this.connectionsGroup.appendChild(line);
          }

          line.setAttribute('x1', p1.x.toString());
          line.setAttribute('y1', p1.y.toString());
          line.setAttribute('x2', p2.x.toString());
          line.setAttribute('y2', p2.y.toString());
          line.setAttribute('stroke', this.config.color);
          line.setAttribute('stroke-opacity', opacity);
          line.setAttribute('stroke-width', '1');

          poolIndex++;
        }
      }
    }

    // Hide unused lines
    for (let k = poolIndex; k < this.connectionPool.length; k++) {
      const line = this.connectionPool[k];
      if (line.parentNode === this.connectionsGroup) this.connectionsGroup.removeChild(line);
    }
    // Trim pool to current size to avoid growth
    this.connectionPool.length = poolIndex;
  }

  private setupInteractions(): void {
    const onMove = (e: MouseEvent) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
      this.mouse.active = true;
    };

    const onLeave = () => { this.mouse.active = false; };

    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('mouseout', onLeave);
    window.addEventListener('blur', onLeave);
  }

  resize(): void {
    const w = window.innerWidth;
    const h = window.innerHeight;
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      if (p.x > w) p.x = w;
      if (p.y > h) p.y = h;
      p.element.setAttribute('cx', p.x.toString());
      p.element.setAttribute('cy', p.y.toString());
    }
  }

  destroy(): void {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    if (this.container) {
      this.particles.forEach(p => p.element.remove());
      if (this.connectionsGroup) this.connectionsGroup.remove();
    }
    this.particles = [];
    this.connectionPool = [];
  }
}
