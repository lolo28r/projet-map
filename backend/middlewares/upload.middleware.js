const multer = require("multer");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/"); // dossier de stockage
    },
    filename: function (req, file, cb) {
        const ext = file.originalname.split(".").pop();
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}.${ext}`;
        cb(null, uniqueName);
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith("image/")) {
            cb(new Error("Seules les images sont autorisées"), false);
        } else {
            cb(null, true);
        }
    },
});

module.exports = upload;
