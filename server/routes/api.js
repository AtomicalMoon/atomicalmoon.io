// Express API Routes
import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads/'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

export default function createApiRoutes(db) {
  // Commission endpoints
  router.post('/commissions', (req, res) => {
    try {
      const result = db.createCommission(req.body);
      db.logEvent('commission_created', req.body, req.get('user-agent'), req.ip);
      res.json({
        success: true,
        data: { id: result.lastInsertRowid },
        message: 'Commission request submitted successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  });

  router.get('/commissions', (req, res) => {
    try {
      const status = req.query.status || null;
      const commissions = db.getCommissions(status);
      res.json({
        success: true,
        data: commissions
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // Gallery endpoints
  router.get('/gallery', (req, res) => {
    try {
      const items = db.getGalleryItems();
      res.json({
        success: true,
        data: items.map(item => ({
          ...item,
          tags: item.tags ? JSON.parse(item.tags) : []
        }))
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  router.post('/gallery', upload.single('image'), (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'No file uploaded'
        });
      }

      const result = db.addGalleryItem({
        src: `/uploads/${req.file.filename}`,
        alt: req.body.alt || '',
        title: req.body.title || '',
        description: req.body.description || '',
        tags: req.body.tags ? JSON.parse(req.body.tags) : [],
        order_index: parseInt(req.body.order_index) || 0
      });

      res.json({
        success: true,
        data: { id: result.lastInsertRowid },
        message: 'Gallery item added successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  });

  // Analytics endpoints
  router.post('/analytics', (req, res) => {
    try {
      db.logEvent(
        req.body.eventType,
        req.body.eventData || {},
        req.get('user-agent'),
        req.ip
      );
      res.json({
        success: true,
        message: 'Event logged'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  });

  router.get('/analytics', (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      const analytics = db.getAnalytics(startDate, endDate);
      res.json({
        success: true,
        data: analytics.map(item => ({
          ...item,
          event_data: JSON.parse(item.event_data)
        }))
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // Settings endpoints
  router.get('/settings/:key', (req, res) => {
    try {
      const value = db.getSetting(req.params.key);
      res.json({
        success: true,
        data: { value }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  router.post('/settings/:key', (req, res) => {
    try {
      db.setSetting(req.params.key, req.body.value);
      res.json({
        success: true,
        message: 'Setting updated'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  });

  return router;
}
