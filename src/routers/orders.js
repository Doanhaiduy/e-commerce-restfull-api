const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const Order = require('../models/order');
const OrderItem = require('../models/order-item');
const Product = require('../models/product');

router.get('/', (req, res) => {
    Order.find()
        .populate('user', 'name')
        .sort({ dateOrdered: -1 })
        .then((orders) => {
            return res.status(200).json({
                success: true,
                count: orders.length,
                data: orders,
            });
        })
        .catch((err) => {
            return res.status(500).json({
                error: err,
                success: false,
            });
        });
});

router.get('/:id', (req, res) => {
    Order.findById(req.params.id)
        .populate({
            path: 'orderItems',
            populate: {
                path: 'product',
                populate: 'category',
            },
        })
        .populate('user', 'name')
        .then((order) => {
            if (order) {
                return res.status(200).json({
                    success: true,
                    data: order,
                });
            }
            return res.status(404).json({
                success: false,
                message: 'Order not found',
            });
        })
        .catch((err) => {
            return res.status(500).json({
                error: err,
                success: false,
            });
        });
});

router.post('/', async (req, res) => {
    if (req.headers.authorization) {
        token = req.headers.authorization.split(' ')[1];
    }
    const user = jwt.verify(token, process.env.SECRET_KEY);

    const orderItemsIds = Promise.all(
        req.body.orderItems.map(async (orderItem) => {
            let newOrderItem = new OrderItem({
                quantity: orderItem.quantity,
                product: orderItem.product,
            });

            newOrderItem = await newOrderItem.save();
            return newOrderItem._id;
        })
    );
    const orderItemsIdsResolved = await orderItemsIds;
    const totalPrices = await Promise.all(
        orderItemsIdsResolved.map(async (orderItemId) => {
            const orderItem = await OrderItem.findById(orderItemId).populate('product', 'price');
            const totalPrice = orderItem.product.price * orderItem.quantity;
            return totalPrice;
        })
    );

    const totalPrice = totalPrices.reduce((a, b) => a + b, 0);
    Order.create({
        orderItems: orderItemsIdsResolved,
        shippingAddress1: req.body.shippingAddress1,
        shippingAddress2: req.body.shippingAddress2,
        city: req.body.city,
        zip: req.body.zip,
        country: req.body.country,
        phone: req.body.phone,
        status: req.body.status,
        totalPrice: totalPrice,
        user: user ? user.userId : req.body.user,
    })
        .then((order) => {
            return res.status(201).json({
                success: true,
                message: 'Order was created successfully',
                data: order,
            });
        })
        .catch((err) => {
            return res.status(500).json({
                error: err,
                success: false,
            });
        });
});

router.put('/:id', (req, res) => {
    Order.findByIdAndUpdate(
        req.params.id,
        {
            status: req.body.status,
        },
        { new: true }
    )
        .then((order) => {
            if (order) {
                return res.status(200).json({
                    success: true,
                    message: 'Order was updated successfully',
                    data: order,
                });
            }
            return res.status(404).json({
                success: false,
                message: 'Order not found',
            });
        })
        .catch((err) => {
            return res.status(500).json({
                error: err,
                success: false,
            });
        });
});

router.delete('/:id', (req, res) => {
    Order.findByIdAndDelete(req.params.id)
        .then((order) => {
            if (order) {
                order.orderItems.map((orderItem) => {
                    OrderItem.findByIdAndDelete(orderItem._id).then((orderDeleted) => {});
                });
                return res.status(200).json({
                    success: true,
                    message: 'Order was deleted successfully',
                });
            }
            return res.status(404).json({
                success: false,
                message: 'Order not found',
            });
        })
        .catch((err) => {
            return res.status(500).json({
                error: err,
                success: false,
            });
        });
});

router.get('/get/totalsales', (req, res) => {
    Order.aggregate([{ $group: { _id: null, totalsales: { $sum: '$totalPrice' } } }])
        .then((totalsales) => {
            return res.status(200).json({
                success: true,
                data: totalsales.pop().totalsales,
            });
        })
        .catch((err) => {
            return res.status(500).json({
                error: err,
                success: false,
            });
        });
});

router.get('/get/count', (req, res) => {
    Order.countDocuments()
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

router.get('/get/userorders/:userid', (req, res) => {
    Order.find({ user: req.params.userid })
        .populate({
            path: 'orderItems',
            populate: {
                path: 'product',
                populate: 'category',
            },
        })
        .then((orders) => {
            return res.status(200).json({
                success: true,
                count: orders.length,
                data: orders,
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
