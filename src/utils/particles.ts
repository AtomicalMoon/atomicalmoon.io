// TypeScript implementation of Particle System
import type { Particle, SiteConfig } from '../types';

export class ParticleSystem {
  private particles: Particle[] = [];
  private container: SVGSVGElement | null = null;
  private animationId: number | null = null;
  private config: SiteConfig['particles'];

  constructor(config: SiteConfig['particles']) {
    this.config = config;
  }

  init(containerId: string): void {
    if (!this.config.enabled) return;
    
    this.container = document.getElementById(containerId) as SVGSVGElement;
    if (!this.container) {
      console.error(`Container with id "${containerId}" not found`);
      return;
    }

    this.createParticles();
    this.animate();
    this.setupInteractions();
  }

  private createParticles(): void {
    const count = this.config.count;
    for (let i = 0; i < count; i++) {
      const particle = this.createParticle();
      this.particles.push(particle);
      if (this.container) {
        this.container.appendChild(particle.element);
      }
    }
  }

  private createParticle(): Particle {
    const size = Math.random() * (this.config.sizeMax - this.config.sizeMin) + this.config.sizeMin;
    const element = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    
    element.setAttribute('r', size.toString());
    element.setAttribute('fill', this.config.color);
    element.setAttribute('opacity', this.config.opacity.toString());
    element.classList.add('particle');

    const x = Math.random() * window.innerWidth;
    const y = Math.random() * window.innerHeight;
    
    element.setAttribute('cx', x.toString());
    element.setAttribute('cy', y.toString());

    return {
      element,
      x,
      y,
      vx: (Math.random() - 0.5) * this.config.speed,
      vy: (Math.random() - 0.5) * this.config.speed,
      size
    };
  }

  private animate(): void {
    this.particles.forEach(particle => {
      particle.x += particle.vx;
      particle.y += particle.vy;

      if (particle.x < 0 || particle.x > window.innerWidth) particle.vx *= -1;
      if (particle.y < 0 || particle.y > window.innerHeight) particle.vy *= -1;

      particle.element.setAttribute('cx', particle.x.toString());
      particle.element.setAttribute('cy', particle.y.toString());
    });

    if (this.config.showConnections) {
      this.drawConnections();
    }

    this.animationId = requestAnimationFrame(() => this.animate());
  }

  private drawConnections(): void {
    if (!this.container) return;

    // Remove old connections
    const oldLines = this.container.querySelectorAll('.particle-connection');
    oldLines.forEach(line => line.remove());

    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const p1 = this.particles[i];
        const p2 = this.particles[j];
        const distance = Math.sqrt(
          Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2)
        );

        if (distance < this.config.connectionDistance) {
          const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
          line.setAttribute('x1', p1.x.toString());
          line.setAttribute('y1', p1.y.toString());
          line.setAttribute('x2', p2.x.toString());
          line.setAttribute('y2', p2.y.toString());
          line.setAttribute('stroke', this.config.color);
          line.setAttribute('stroke-opacity', ((1 - distance / this.config.connectionDistance) * 0.3).toString());
          line.setAttribute('stroke-width', '1');
          line.classList.add('particle-connection');
          this.container.appendChild(line);
        }
      }
    }
  }

  private setupInteractions(): void {
    document.addEventListener('mousemove', (e: MouseEvent) => {
      this.particles.forEach(particle => {
        const dx = e.clientX - particle.x;
        const dy = e.clientY - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const force = 100 / distance;

        if (distance < 100) {
          particle.vx -= (dx / distance) * force * 0.01;
          particle.vy -= (dy / distance) * force * 0.01;
        }
      });
    });
  }

  resize(): void {
    this.particles.forEach(particle => {
      if (particle.x > window.innerWidth) particle.x = window.innerWidth;
      if (particle.y > window.innerHeight) particle.y = window.innerHeight;
    });
  }

  destroy(): void {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
    }
    this.particles = [];
  }
}
