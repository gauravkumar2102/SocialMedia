const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

// ── Configure Cloudinary ─────────────────────────────────────────────────────
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|webp/;
  const okExt = allowed.test(file.originalname.toLowerCase());
  const okMime = allowed.test(file.mimetype);
  if (okExt && okMime) cb(null, true);
  else cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'), false);
};

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter,
});


const uploadToCloudinary = (buffer, folder = 'socialwave/posts') => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        transformation: [
          { width: 1080, crop: 'limit' },
          { quality: 'auto' },            // auto-compress
          { fetch_format: 'auto' },
        ],
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    );
    // Pipe the in-memory Buffer into the Cloudinary upload stream
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

const deleteFromCloudinary = async (imageUrl) => {
  try {
    if (!imageUrl) return;

    const parts = imageUrl.split('/');
    const filename = parts[parts.length - 1].split('.')[0];
    const folder = parts[parts.length - 2];
    const parent = parts[parts.length - 3];
    const publicId = `${parent}/${folder}/${filename}`;
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.error('Cloudinary delete error:', err.message);
  }
};

module.exports = { upload, uploadToCloudinary, deleteFromCloudinary };
