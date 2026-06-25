import express from 'express';
import { allowRoles, protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/imgbb', protect, allowRoles('vendor', 'admin'), async (req, res, next) => {
  try {
    const { image } = req.body;
    if (!process.env.IMGBB_API_KEY) return res.status(500).json({ message: 'IMGBB_API_KEY is not configured' });
    if (!image) return res.status(400).json({ message: 'Base64 image data is required' });

    const form = new FormData();
    form.set('key', process.env.IMGBB_API_KEY);
    form.set('image', image.replace(/^data:image\/\w+;base64,/, ''));
    const response = await fetch('https://api.imgbb.com/1/upload', {
      method: 'POST',
      body: form,
    });
    const result = await response.json();
    if (!response.ok || !result.success) {
      return res.status(502).json({ message: result?.error?.message || 'imgbb upload failed' });
    }
    res.json({ url: result.data.url, displayUrl: result.data.display_url, deleteUrl: result.data.delete_url });
  } catch (error) {
    next(error);
  }
});

export default router;
