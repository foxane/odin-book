import multer from 'multer';
import { extname } from 'node:path';

const localStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, 'upload'),
  filename: (req, file, cb) => {
    const uniqueSuffix = req.user.name.replaceAll(' ', '_') + '-' + Date.now();
    const fileName =
      file.fieldname +
      '-' +
      uniqueSuffix.toLowerCase() +
      extname(file.originalname);

    cb(null, fileName);
  },
});

export const upload = multer({
  storage:
    process.env.NODE_ENV === 'production'
      ? multer.memoryStorage()
      : localStorage,
  limits: {
    fileSize: 1024 * 1024 * 10, // 10MB
  },
});
