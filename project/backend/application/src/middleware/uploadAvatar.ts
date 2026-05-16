import multer from 'multer';
import path from 'path';
import fs from 'fs';

const uploadPath = '/app/application/uploads/avatars';
fs.mkdirSync(uploadPath, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => { cb(null, uploadPath); },
    filename: (req, file, cb) => {
        const userId = (req as any).user?.id;
        const ext = path.extname(file.originalname);

        const filename = `user-${userId}-${Date.now()}${ext}`;
        cb(null, filename);
    },
});

const fileFilter = (req: any, file: Express.Multer.File, cb: any) => {
    const isImage = file.mimetype.startsWith('image/');

    if (!isImage) {
        return cb(new Error('Only image files are allowed'), false);
    }

    cb(null, true);
};

export const uploadAvatar = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });
