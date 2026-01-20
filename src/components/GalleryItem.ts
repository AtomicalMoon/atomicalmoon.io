// Web Component for Gallery Items
import type { GalleryItem as GalleryItemType } from '../types';

export class GalleryItemComponent extends HTMLElement {

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  static get observedAttributes() {
    return ['src', 'alt', 'title', 'description'];
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    this.render();
  }

  set data(item: GalleryItemType) {
    if (item.src) this.setAttribute('src', item.src);
    if (item.alt) this.setAttribute('alt', item.alt);
    if (item.title) this.setAttribute('title', item.title);
    if (item.description) this.setAttribute('description', item.description);
    this.render();
  }

  private render() {
    if (!this.shadowRoot) return;

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          position: relative;
          overflow: hidden;
          border-radius: 12px;
          cursor: pointer;
          transition: transform 0.4s cubic-bezier(0.23, 1, 0.32, 1);
        }

        :host(:hover) {
          transform: translateY(-8px) scale(1.02);
        }

        img {
          width: 100%;
          height: auto;
          display: block;
          aspect-ratio: 1;
          object-fit: cover;
        }

        .overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
          padding: 20px;
          transform: translateY(100%);
          transition: transform 0.3s ease;
        }

        :host(:hover) .overlay {
          transform: translateY(0);
        }

        .title {
          color: white;
          font-weight: 600;
          margin-bottom: 5px;
        }

        .description {
          color: rgba(255,255,255,0.8);
          font-size: 0.9em;
        }
      </style>
      <img src="${this.getAttribute('src') || ''}" alt="${this.getAttribute('alt') || ''}" loading="lazy">
      <div class="overlay">
        <div class="title">${this.getAttribute('title') || ''}</div>
        <div class="description">${this.getAttribute('description') || ''}</div>
      </div>
    `;
  }
}

customElements.define('gallery-item', GalleryItemComponent);
