const multer = require('multer');
const crypto = require('crypto');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '..', 'uploads'));
    },
    filename: (req, file, cb) => {
        crypto.randomBytes
        
        (12, (err, buf) => {
            if (err) {
                return cb(err, null);
            }
            const filename = `${buf.toString('hex')}${path.extname(file.originalname)}`;
            cb(null, filename);
        });
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB size limit
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png/;
        const mimetype = filetypes.test(file.mimetype);
        
        if (mimetype) {
            cb(null, true); // Accept the file
        } else {
            cb(new Error('Only image files are allowed!'), false); // Reject the file
        }
    }
});

module.exports = upload;