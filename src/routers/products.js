const express = require('express');
const Product = require('../models/product');
const Category = require('../models/category');
const router = express.Router();
const multer = require('multer');
const { default: mongoose } = require('mongoose');

// Multer

const FILE_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg',
};
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const isValid = FILE_TYPE_MAP[file.mimetype];
        let uploadError = new Error('Invalid image type');
        if (isValid) {
            uploadError = null;
        }
        cb(uploadError, 'public/uploads');
    },
    filename: function (req, file, cb) {
        const fileName = file.originalname.split(' ').join('-');
        const extension = FILE_TYPE_MAP[file.mimetype];
        cb(null, `${fileName}-${Date.now()}.${extension}`);
    },
});

const uploadOptions = multer({ storage: storage });

router.get(`/`, (req, res, next) => {
    let filter = {};
    if (req.query.categories) {
        filter = { category: req.query.categories.split(',') };
    }
    Product.find(filter)
        .then((products) => {
            return res.status(200).json({
                success: true,
                count: products.length,
                data: products,
            });
        })
        .catch((err) => {
            return res.status(500).json({
                error: err,
                success: false,
            });
        });
});

router.get(`/:id`, (req, res, next) => {
    Product.findById(req.params.id)
        .then((product) => {
            if (product) {
                return res.status(200).json({
                    success: true,
                    data: product,
                });
            }
            return res.status(404).json({
                success: false,
                message: 'Product not found!',
            });
        })
        .catch((err) => {
            return res.status(500).json({
                error: err,
                success: false,
            });
        });
});

router.post(`/`, uploadOptions.single('image'), async (req, res, next) => {
    const file = req.file;
    if (!file) {
        return res.status(400).json({
            success: false,
            message: 'No image in the request',
        });
    }
    const fileName = req.file.filename;
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;
    const promises = [
        Category.findById(req.body.category),
        Product.create({
            name: req.body.name,
            description: req.body.description,
            richDescription: req.body.richDescription,
            image: `${basePath}${fileName}`,
            images: req.body.images,
            brand: req.body.brand,
            price: req.body.price,
            category: req.body.category,
            countInStock: req.body.countInStock,
            rating: req.body.rating,
            numReviews: req.body.numReviews,
            isFeatured: req.body.isFeatured,
        }),
    ];

    Promise.all(promises)
        .then(([category, product]) => {
            if (!category) {
                return res.status(400).json('Invalid Category');
            }
            return res.status(201).json({
                success: true,
                message: 'Product created successfully',
                data: product,
            });
        })
        .catch((err) => {
            console.error(err);
            return res.status(500).json({
                error: 'Internal Server Error',
                success: false,
            });
        });
});

router.put('/:id', (req, res, next) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid Product ID',
        });
    }

    promises = [
        Category.findById(req.body.category),
        Product.findByIdAndUpdate(
            req.params.id,
            {
                name: req.body.name,
                description: req.body.description,
                richDescription: req.body.richDescription,
                image: req.body.image,
                images: req.body.images,
                brand: req.body.brand,
                price: req.body.price,
                category: req.body.category,
                countInStock: req.body.countInStock,
                rating: req.body.rating,
                numReviews: req.body.numReviews,
                isFeatured: req.body.isFeatured,
            },
            { new: true }
        ),
    ];
    Promise.all(promises)
        .then(([category, product]) => {
            if (!category) {
                return res.status(400).json('Invalid Category');
            }
            return res.status(200).json({
                success: true,
                message: 'Product updated successfully',
                data: product,
            });
        })
        .catch((err) => {
            console.error(err);
            return res.status(500).json({
                error: 'Internal Server Error',
                success: false,
            });
        });
});

router.delete('/:id', (req, res, next) => {
    Product.findByIdAndDelete(req.params.id)
        .then((product) => {
            if (product) {
                return res.status(200).json({
                    success: true,
                    message: 'Product deleted successfully',
                });
            }
            return res.status(404).json({
                success: false,
                message: 'Product not found',
            });
        })
        .catch((err) => {
            console.error(err);
            return res.status(500).json({
                error: 'Internal Server Error',
                success: false,
            });
        });
});

router.get(`/get/count`, (req, res, next) => {
    Product.countDocuments()
        .then((count) => {
            return res.status(200).json({
                success: true,
                count: count,
            });
        })
        .catch((err) => {
            return res.status(500).json({
                error: err,
                success: false,
            });
        });
});

router.get('/get/featured', (req, res, next) => {
    Product.find({ isFeatured: false })
        .then((products) => {
            if (products.length === 0) {
                return res.status(404).json({
                    success: true,
                    message: 'No featured products found',
                });
            }
            return res.status(200).json({
                success: true,
                count: products.length,
                data: products,
            });
        })
        .catch((err) => {
            return res.status(500).json({
                error: err,
                success: false,
            });
        });
});

router.get('/get/featured/:count', (req, res, next) => {
    Product.find({ isFeatured: true })
        .limit(+req.params.count)
        .then((products) => {
            if (products.length === 0) {
                return res.status(404).json({
                    success: true,
                    message: 'No featured products found',
                });
            }
            return res.status(200).json({
                success: true,
                count: products.length,
                data: products,
            });
        })
        .catch((err) => {
            return res.status(500).json({
                error: err,
                success: false,
            });
        });
});

router.put('/gallery-images/:id', uploadOptions.array('images', 10), async (req, res, next) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid Product ID',
        });
    }
    const files = req.files;
    let imagesPaths = [];
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;

    if (files) {
        files.map((file) => {
            imagesPaths.push(`${basePath}${file.filename}`);
        });
    }
    Product.findByIdAndUpdate(
        req.params.id,
        {
            images: imagesPaths,
        },
        {
            new: true,
        }
    )
        .then((product) => {
            if (product) {
                return res.status(200).json({
                    success: true,
                    message: 'Images updated successfully',
                    data: product,
                });
            }
        })
        .catch((err) => {
            console.error(err);
            return res.status(500).json({
                error: err,
                success: false,
            });
        });
});

module.exports = router;
