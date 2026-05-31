import multer from 'multer';
import path from 'path';
import fs from 'fs';

const uploadPath = '/app/uploads/tasks';
fs.mkdirSync(uploadPath, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => { cb(null, uploadPath); },

  filename: (req, file, cb) => {
    const taskId = req.params.id;
    const ext = path.extname(file.originalname);

    const filename = `task-${taskId}-${Date.now()}${ext}`;

    cb(null, filename);
  },
});

const allowedTypes = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'application/zip',
  'text/plain',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const fileFilter = (req: any, file: Express.Multer.File, cb: any) => {
  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new Error('File type not allowed'), false);
  }

  cb(null, true);
};

export const uploadFile = multer({ storage, fileFilter, limits: { fileSize: 20 * 1024 * 1024 } });