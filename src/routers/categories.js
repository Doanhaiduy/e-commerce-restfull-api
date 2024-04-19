const express = require('express');
const router = express.Router();
const Category = require('../models/category');

router.get('/', (req, res, next) => {
    Category.find()
        .then((categories) => {
            return res.status(200).json({
                success: true,
                data: categories,
            });
        })
        .catch((err) => {
            return res.status(500).json({ success: false, error: err });
        });
});

router.get('/:id', (req, res, next) => {
    Category.findById(req.params.id)
        .then((category) => {
            if (category) {
                return res.status(200).json({
                    success: true,
                    data: category,
                });
            }
            return res.status(404).json({ success: false, message: 'Category not found!' });
        })
        .catch((err) => {
            return res.status(500).json({ success: false, error: err });
        });
});

router.post('/', (req, res, next) => {
    Category.create({
        name: req.body.name,
        icon: req.body.icon,
        color: req.body.color,
    })
        .then((category) => {
            return res.status(201).json({
                success: true,
                message: 'Category created successfully!',
                data: category,
            });
        })
        .catch((err) => {
            return res.status(500).json({ error: err, success: false });
        });
});

router.put('/:id', (req, res, next) => {
    Category.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            icon: req.body.icon,
            color: req.body.color,
        },
        { new: true }
    )
        .then((category) => {
            if (category) {
                return res.status(200).json({ success: true, message: 'The category is updated!', data: category });
            }
            return res.status(404).json({ success: false, message: 'Category not found!' });
        })
        .catch((err) => {
            return res.status(400).json({ success: false, error: err });
        });
});

router.delete('/:id', (req, res, next) => {
    Category.findByIdAndDelete(req.params.id)
        .then((category) => {
            if (category) {
                return res.status(200).json({ success: true, message: 'The category is deleted!' });
            }
            return res.status(404).json({ success: false, message: 'Category not found!' });
        })
        .catch((err) => {
            return res.status(400).json({ success: false, error: err });
        });
});
module.exports = router;
