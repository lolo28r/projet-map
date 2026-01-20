const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const uploadDir = path.join(__dirname, "../uploads");

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

exports.uploadImage = async (file) => {
    if (!file) return null;

    const ext = path.extname(file.originalname);
    const filename = crypto.randomUUID() + ext;
    const filepath = path.join(uploadDir, filename);

    await fs.promises.writeFile(filepath, file.buffer);

    return `/uploads/${filename}`;
};
