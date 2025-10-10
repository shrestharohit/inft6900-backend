const express = require("express");
const router = express.Router();
const multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        return cb(null, 'uploads/'); // Directory where files will be stored
    },
    filename: function (req, file, cb) {
        return cb(null, `${Date.now()}_${file.originalname}`); // Use original file name
    }
});

const upload = multer({ storage: storage });

router.post('/', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({error: 'No file received'})
    }
    return res.status(200).json({
        message: 'file successfully uploaded',
        path: `/uploads/${req.file.filename}`
    });
})

module.exports = router;