const express = require('express');
const router = express.Router();
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

router.get('/', (req, res, next) => {
    User.find()
        .select('-passwordHash')
        .then((users) => {
            return res.status(200).json({
                count: users.length,
                success: true,
                data: users,
            });
        })
        .catch((err) => {
            return res.status(500).json({
                error: err,
                success: false,
            });
        });
});

router.get('/:id', (req, res, next) => {
    User.findById(req.params.id)
        .select('-passwordHash')
        .then((user) => {
            if (user) {
                return res.status(200).json({
                    success: true,
                    data: user,
                });
            }
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        })
        .catch((err) => {
            return res.status(500).json({
                error: err,
                success: false,
            });
        });
});

router.post('/', (req, res, next) => {
    User.create({
        name: req.body.name,
        email: req.body.email,
        passwordHash: bcrypt.hashSync(req.body.password, 10),
        phone: req.body.phone,
        isAdmin: req.body.isAdmin,
        street: req.body.street,
        apartment: req.body.apartment,
        zip: req.body.zip,
        city: req.body.city,
        country: req.body.country,
    })
        .then((user) => {
            return res.status(201).json({
                message: 'User created successfully',
                success: true,
                data: user,
            });
        })
        .catch((err) => {
            return res.status(500).json({
                error: err,
                success: false,
            });
        });
});

router.post('/login', (req, res, next) => {
    User.findOne({
        email: req.body.email,
    })
        .then((user) => {
            if (user) {
                if (bcrypt.compareSync(req.body.password, user.passwordHash)) {
                    const token = jwt.sign(
                        {
                            userId: user.id,
                            isAdmin: user.isAdmin,
                        },
                        process.env.SECRET_KEY,
                        {
                            expiresIn: '1d',
                        }
                    );
                    return res.status(200).json({
                        success: true,
                        message: 'User logged in successfully',
                        data: {
                            email: user.email,
                            token: token,
                        },
                    });
                }
                return res.status(404).json({
                    success: false,
                    message: 'Invalid Password',
                });
            } else {
                return res.status(404).json({
                    success: false,
                    message: 'User not found',
                });
            }
        })
        .catch((err) => {
            return res.status(500).json({
                error: err,
                success: false,
            });
        });
});

router.post('/register', (req, res, next) => {
    User.create({
        name: req.body.name,
        email: req.body.email,
        passwordHash: bcrypt.hashSync(req.body.password, 10),
        phone: req.body.phone,
        // isAdmin: req.body.isAdmin,
        street: req.body.street,
        apartment: req.body.apartment,
        zip: req.body.zip,
        city: req.body.city,
        country: req.body.country,
    })
        .then((user) => {
            return res.status(201).json({
                message: 'User registered successfully',
                success: true,
                data: user,
            });
        })
        .catch((err) => {
            return res.status(500).json({
                error: err,
                success: false,
            });
        });
});

// router.post('/logout', (req, res, next) => {
//     // clear token in client side
//     return res.status(200).json({
//         success: true,
//         message: 'User logged out successfully',
//     });
// })

router.get('/get/count', (req, res, next) => {
    User.countDocuments()
        .then((count) => {
            return res.status(200).json({
                count: count,
                success: true,
            });
        })
        .catch((err) => {
            return res.status(500).json({
                error: err,
                success: false,
            });
        });
});

router.delete('/:id', (req, res, next) => {
    User.findByIdAndDelete(req.params.id)
        .then((user) => {
            if (user) {
                return res.status(200).json({
                    success: true,
                    message: 'User deleted successfully',
                });
            }
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        })
        .catch((err) => {
            return res.status(500).json({
                error: err,
                success: false,
            });
        });
});

module.exports = router;
