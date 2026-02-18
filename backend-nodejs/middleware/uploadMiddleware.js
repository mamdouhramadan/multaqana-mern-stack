const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const fsp = fs.promises;
const crypto = require('crypto');

// --- Helper Functions ---
// Async: ensure directory exists (idempotent; safe to call if already exists)
const ensureDir = (dirPath) => fsp.mkdir(dirPath, { recursive: true });

// Whitelist: mimetype -> safe file extension (never use client originalname for path)
const MIME_TO_EXT = {
  'image/jpeg': 'jpeg',
  'image/jpg': 'jpeg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/webp': 'webp',
  'image/svg+xml': 'svg',
  'application/pdf': 'pdf',
  'application/msword': 'doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'application/vnd.ms-excel': 'xls',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
  'application/vnd.ms-powerpoint': 'ppt',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
  'text/plain': 'txt',
  'application/zip': 'zip',
  'application/x-rar-compressed': 'rar',
  'video/mp4': 'mp4',
  'video/webm': 'webm',
  'video/ogg': 'ogv'
};

function getExtensionFromMimetype(mimetype) {
  return MIME_TO_EXT[mimetype] || null;
}

// Reject path traversal or path separators in client-provided filename
function hasPathTraversal(name) {
  if (!name || typeof name !== 'string') return true;
  const normalized = path.normalize(name);
  return normalized.includes('..') || path.isAbsolute(normalized) || /[\\/]/.test(normalized);
}

// Helper: Create a generic upload middleware using Disk Storage
// Usage: createUploadMiddleware('folder_name', /regex/, size_limit)
const createUploadMiddleware = (subfolder, allowedTypes, limit) => {
  const uploadPath = path.join('public', subfolder);
  const genericStorage = multer.diskStorage({
    destination: function (req, file, cb) {
      ensureDir(uploadPath).then(() => cb(null, uploadPath)).catch(cb);
    },
    filename: function (req, file, cb) {
      if (hasPathTraversal(file.originalname)) {
        return cb(new Error('Invalid filename'), false);
      }
      const ext = getExtensionFromMimetype(file.mimetype);
      if (!ext || !allowedTypes.test(ext)) {
        return cb(new Error('Invalid file type'), false);
      }
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + '.' + ext);
    }
  });

  // 2. Configure File Filter: mimetype must map to allowed extension; reject path traversal
  const genericFilter = (req, file, cb) => {
    if (hasPathTraversal(file.originalname)) {
      return cb(new Error('Invalid filename'), false);
    }
    const ext = getExtensionFromMimetype(file.mimetype);
    if (!ext || !allowedTypes.test(ext)) {
      return cb(new Error('Invalid file type'), false);
    }
    cb(null, true);
  };

  // 3. Return configured multer instance
  return multer({
    storage: genericStorage,
    fileFilter: genericFilter,
    limits: { fileSize: limit }
  });
};

// --- Storage Config ---
const storage = multer.memoryStorage();

// --- 1. MEMORY STORAGE FILTERS ---
// Used for images that need processing (resizing) BEFORE saving to disk.

// Allowed image mimetypes and their extensions
const IMAGE_MIMES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];

// Filter: Images Only; validate mimetype and reject path traversal
const imageFilter = (req, file, cb) => {
  if (hasPathTraversal(file.originalname)) {
    return cb(new Error('Invalid filename'), false);
  }
  if (IMAGE_MIMES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Not an image! Please upload only images.'), false);
  }
};

// Filter: specific document types; reject path traversal
const documentFilter = (req, file, cb) => {
  if (hasPathTraversal(file.originalname)) {
    return cb(new Error('Invalid filename'), false);
  }
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type! Only PDF and Word documents are allowed.'), false);
  }
};

// Filter: Magazine Assets (Thumbnail + PDF); reject path traversal
const magazineFilter = (req, file, cb) => {
  if (hasPathTraversal(file.originalname)) {
    return cb(new Error('Invalid filename'), false);
  }
  if (file.fieldname === 'thumbnail') {
    if (IMAGE_MIMES.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Thumbnail must be an image'), false);
  } else if (file.fieldname === 'file') {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    if (allowedTypes.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Invalid document type'), false);
  } else {
    cb(new Error('Unexpected field'), false);
  }
};

// --- Generic Helper to Create Middleware (Memory Storage + Sharp) ---
// Why? This pattern separates 'upload' from 'processing'.
// 1. 'upload' puts file in memory.
// 2. 'resize' takes buffer, resizes, saves to disk, and updates req.file with public URL.

const uploadImage = (fieldName, subfolder) => {
  // A. Configure Upload (Memory Storage)
  const upload = multer({
    storage,
    fileFilter: imageFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB Limit
  }).single(fieldName);

  // B. Resize & Save Logic
  // Why? Resizing ensures consistent image dimensions and optimizes file size.
  const resize = async (req, res, next) => {
    if (!req.file) return next(); // Skip if no file uploaded

    req.file.filename = `${fieldName}-${crypto.randomUUID()}-${Date.now()}.jpeg`;
    const uploadPath = path.join('public', 'img', subfolder);

    try {
      await ensureDir(uploadPath);
      // Process with Sharp
      await sharp(req.file.buffer)
        .resize(800, 800, { fit: 'inside' }) // Resize to max 800x800
        .toFormat('jpeg')
        .jpeg({ quality: 85 }) // Optimize quality
        .toFile(path.join(uploadPath, req.file.filename));

      // 4. Attach public URL for the controller to use
      req.file.publicUrl = `/img/${subfolder}/${req.file.filename}`;
      next();
    } catch (error) {
      next(error);
    }
  };

  // Return both middlewares (Run sequence: upload -> resize)
  return [upload, resize];
};

// Helper: Standard Document Upload (Memory -> Disk)
// Note: Doesn't "resize" documents, but saving logic is separated similar to images for consistency if needed.
const uploadDocument = (fieldName, subfolder) => {
  const upload = multer({
    storage: multer.memoryStorage(),
    fileFilter: documentFilter,
    limits: { fileSize: 10 * 1024 * 1024 }
  }).single(fieldName);

  const saveFile = async (req, res, next) => {
    if (!req.file) return next();

    const ext = getExtensionFromMimetype(req.file.mimetype) || 'bin';
    req.file.filename = `${fieldName}-${crypto.randomUUID()}-${Date.now()}.${ext}`;
    const uploadPath = path.join('public', 'files', subfolder);

    try {
      await ensureDir(uploadPath);
      await fsp.writeFile(path.join(uploadPath, req.file.filename), req.file.buffer);
      req.file.publicUrl = `/files/${subfolder}/${req.file.filename}`;
      next();
    } catch (error) {
      next(error);
    }
  };

  return [upload, saveFile];
};

// Helper: Magazine Assets Upload
// Handles: Thumbnail (Image) + File (PDF/Doc) in one request
const uploadMagazineAssets = () => {
  const upload = multer({
    storage,
    fileFilter: magazineFilter,
    limits: { fileSize: 20 * 1024 * 1024 } // 20MB Total
  }).fields([{ name: 'thumbnail', maxCount: 1 }, { name: 'file', maxCount: 1 }]);

  const processFiles = async (req, res, next) => {
    if (!req.files) return next();

    const dateStr = Date.now();
    const uuid = crypto.randomUUID();

    // 1. Process Thumbnail (Resize)
    if (req.files.thumbnail && req.files.thumbnail[0]) {
      const file = req.files.thumbnail[0];
      file.filename = `thumb-${uuid}-${dateStr}.jpeg`;
      const uploadPath = path.join('public', 'img', 'magazines');

      try {
        await ensureDir(uploadPath);
        await sharp(file.buffer)
          .resize(600, 800, { fit: 'cover' })
          .toFormat('jpeg')
          .jpeg({ quality: 90 })
          .toFile(path.join(uploadPath, file.filename));
        req.thumbnailUrl = `/img/magazines/${file.filename}`;
      } catch (err) {
        return next(err);
      }
    }

    // 2. Process Document (Save directly; extension from mimetype)
    if (req.files.file && req.files.file[0]) {
      const file = req.files.file[0];
      const ext = getExtensionFromMimetype(file.mimetype) || 'bin';
      file.filename = `mag-${uuid}-${dateStr}.${ext}`;
      const uploadPath = path.join('public', 'files', 'magazines');

      try {
        await ensureDir(uploadPath);
        await fsp.writeFile(path.join(uploadPath, file.filename), file.buffer);
        req.fileUrl = `/files/magazines/${file.filename}`;
      } catch (err) {
        return next(err);
      }
    }

    next();
  };

  return [upload, processFiles];
};

// --- 4. VIDEO UPLOAD (Large Files) ---
// Why? Videos are large and handled separately (Disk Storage, higher limits).
// Usage: Used in Video creation route

// A. Storage Config for Video: extension from mimetype only; reject path traversal
const videoStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    ensureDir(path.join('public', 'videos')).then(() => cb(null, 'public/videos')).catch(cb);
  },
  filename: function (req, file, cb) {
    if (hasPathTraversal(file.originalname)) {
      return cb(new Error('Invalid filename'), false);
    }
    const ext = getExtensionFromMimetype(file.mimetype);
    if (!ext || !file.mimetype.startsWith('video/')) {
      return cb(new Error('Only video files are allowed!'), false);
    }
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '.' + ext);
  }
});

// B. Filter for Video: MP4, WebM, Ogg; reject path traversal
const videoFilter = (req, file, cb) => {
  if (hasPathTraversal(file.originalname)) {
    return cb(new Error('Invalid filename'), false);
  }
  if (file.mimetype.startsWith('video/') && getExtensionFromMimetype(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only video files are allowed!'), false);
  }
};

// C. Multer Instance for Video
const uploadVideoFile = multer({
  storage: videoStorage,
  fileFilter: videoFilter,
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit for videos
}).single('videoFile'); // Field name in frontend form

// D. Wrapper Middleware for Video
// Why? Wraps the multer call to handle errors gracefully and attach public URL.
const uploadVideo = (req, res, next) => {
  uploadVideoFile(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ message: `Video upload error: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ message: err.message });
    }

    if (req.file) {
      // Add the public URL to the request object
      req.videoUrl = `/videos/${req.file.filename}`;
    }
    next();
  });
};

// --- 5. ALBUM UPLOAD (Multiple Images) ---
// Why? For uploading multiple images at once (e.g., Photo Gallery).
// Allows uploading array of images.

const uploadAlbumImagesFile = multer({
  storage: storage, // Use the same image storage as generic images
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB per image
}).array('images', 20); // Allow up to 20 images

// Wrapper for Album
const uploadAlbum = (req, res, next) => {
  uploadAlbumImagesFile(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ message: `Album upload error: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ message: err.message });
    }

    if (req.files) {
      // Map files to their URLs
      req.imageUrls = req.files.map(file => `/img/uploads/${file.filename}`);
    }
    next();
  });
};


// --- EXPORTS ---

// Specific Uploaders using helpers
const uploadProfileImage = uploadImage('image', 'profiles');
const uploadNewsImage = uploadImage('image', 'news');

// Note: Magazine assets are handled by uploadMagazineAssets usually, but defining specific ones if needed:
const uploadMagazineCover = uploadImage('thumbnail', 'magazines');
const uploadMagazineFile = uploadDocument('file', 'magazines');

// Defined Helper Usages
// Why? Pre-configured middlewares for common tasks to be used directly in routes.
const uploadAppLogo = createUploadMiddleware('applications', /jpeg|jpg|png|svg|webp/, 5 * 1024 * 1024);
const uploadFileDoc = createUploadMiddleware('files', /pdf|doc|docx|xls|xlsx|ppt|pptx|txt|zip|rar/, 50 * 1024 * 1024);

module.exports = {
  uploadProfileImage,
  uploadNewsImage,
  uploadMagazineCover,
  uploadMagazineFile,
  uploadVideo,
  uploadAlbum,
  uploadAppLogo,
  uploadFileDoc,
  uploadImage,
  uploadDocument,
  uploadMagazineAssets
};
