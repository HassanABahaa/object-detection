import multer from 'multer';

// Use memory storage to avoid saving files to disk if we only need Base64
const storage = multer.memoryStorage();

export const upload = multer({ 
    storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});
