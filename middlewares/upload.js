const multer = require("multer");
const path = require("path");
const storage = multer.diskStorage({

    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, "../uploads"));
    },

    filename: (req, file, cb) => {
        const uniqueSuffix =
            Date.now() +
            "-" +
            Math.round(Math.random() * 1E9);
        const ext =
            path.extname(file.originalname);
        const name =
            file.fieldname +
            "-" +
            uniqueSuffix +
            ext;
        cb(null, name);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedFile = [
        '.jpg',
        '.jpeg',
        '.png',
        '.pdf'
    ];

    const ext =
        path.extname(file.originalname)
            .toLowerCase();
    if (!allowedFile.includes(ext)) {
        return cb(
            new Error(
                'File harus JPG, PNG, atau PDF'
            ),
            false
        );
    }
    cb(null, true);
};

module.exports = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 2 * 1024 * 1024
    }

});