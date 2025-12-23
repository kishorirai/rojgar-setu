const multer = require('multer');

// Use memory storage for profile images (so you get `req.file.buffer`)
const imageUpload = multer({ storage: multer.memoryStorage() });

// (Optional) Disk storage for documents (if needed)
const path = require('path');
const fs = require('fs');
const documentDir = path.join(__dirname, '../uploads/documents');
if (!fs.existsSync(documentDir)) {
  fs.mkdirSync(documentDir, { recursive: true });
}
const documentUpload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, documentDir);
    },
    filename: function (req, file, cb) {
      const ext = path.extname(file.originalname);
      cb(null, `${Date.now()}-${file.fieldname}${ext}`);
    }
  }),
});

module.exports = { imageUpload, documentUpload };