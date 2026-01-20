# AtomicalMoon Portfolio - Advanced Multi-Technology Stack

A highly customizable portfolio website built with multiple modern technologies for maximum capabilities and extensibility.

## 🚀 Technology Stack

### Frontend
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and dev server
- **GSAP** - Advanced animations
- **Web Components** - Modular UI components
- **Service Worker** - PWA capabilities
- **WebAssembly** - High-performance calculations

### Backend
- **Node.js** - JavaScript runtime
- **Express** - Web framework
- **SQLite** - Database (easily switchable to PostgreSQL)
- **WebSocket** - Real-time communication
- **Multer** - File upload handling

### Development Tools
- **ESLint** - Code linting
- **Vitest** - Testing framework
- **TypeScript** - Type checking

## 📦 Installation

```bash
# Install dependencies
npm install

# Development mode (frontend + backend)
npm run dev:full

# Frontend only
npm run dev

# Backend only
npm run server

# Build for production
npm run build

# Type checking
npm run type-check
```

## 🎨 Customization

### CSS Variables
Edit `:root` variables in `index.html` for theme customization.

### TypeScript Configuration
Modify `SiteConfig` in `src/types/index.ts` or runtime via browser console.

### API Endpoints
Backend API routes are in `server/routes/api.js`.

### Database Schema
Database tables are defined in `server/database.js`.

## 📁 Project Structure

```
├── src/
│   ├── types/          # TypeScript type definitions
│   ├── utils/          # Utility functions
│   ├── components/     # Web Components
│   └── api/            # API client
├── server/
│   ├── routes/        # API routes
│   ├── database.js    # Database manager
│   ├── websocket.js   # WebSocket server
│   └── index.js       # Express server
├── public/
│   ├── sw.js          # Service Worker
│   └── manifest.json  # PWA manifest
├── wasm/              # WebAssembly modules
├── vite.config.ts     # Vite configuration
├── tsconfig.json      # TypeScript configuration
└── package.json       # Dependencies
```

## 🔧 Features

- ✅ TypeScript for type safety
- ✅ Build system with Vite
- ✅ Node.js backend with Express
- ✅ SQLite database
- ✅ RESTful API
- ✅ WebSocket real-time communication
- ✅ Service Worker (PWA)
- ✅ Web Components
- ✅ WebAssembly support
- ✅ File upload handling
- ✅ Analytics tracking
- ✅ Commission management system

## 🌐 API Endpoints

- `POST /api/commissions` - Submit commission request
- `GET /api/commissions` - Get commissions
- `GET /api/gallery` - Get gallery items
- `POST /api/gallery` - Upload gallery item

Frontend-only gallery
---------------------

To add images to the site gallery without editing code, place your image files into `src/assets/gallery/` (create the folder if it doesn't exist). The site automatically bundles and displays any `png`, `jpg`, `jpeg`, or `webp` file found there.

Examples:

- `src/assets/gallery/render1.png`
- `src/assets/gallery/render2.jpg`

If no images are found in that folder, the page will gracefully fall back to `render1.png` at the project root (legacy behavior).
- `POST /api/analytics` - Log analytics event
- `GET /api/analytics` - Get analytics data
- `GET /api/settings/:key` - Get setting
- `POST /api/settings/:key` - Update setting

## 📝 Environment Variables

Create a `.env` file:

```env
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

## 🎯 Usage Examples

### TypeScript API Client
```typescript
import api from '@api/client';

// Submit commission
await api.submitCommission({
  name: 'John Doe',
  email: 'john@example.com',
  type: 'model',
  description: 'Custom 3D model'
});

// Get gallery items
const response = await api.getGalleryItems();
```

### WebSocket Connection
```javascript
const ws = new WebSocket('ws://localhost:3001/ws');
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Received:', data);
};
```

## 📄 License

MIT
