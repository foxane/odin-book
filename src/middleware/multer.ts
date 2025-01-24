import multer from 'multer';
import { extname } from 'node:path';

// TODO: Add cloud bucket storage

const localStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, 'upload'),
  filename: (req, file, cb) => {
    const uniqueSuffix = req.user.name.replace(' ', '_') + '-' + Date.now();
    const fileName =
      file.fieldname +
      '-' +
      uniqueSuffix.toLowerCase() +
      extname(file.originalname);

    cb(null, fileName);
  },
});

export const upload = multer({
  storage: localStorage,
  limits: {
    fileSize: 1024 * 1024 * 10, // 10MB
  },
});
