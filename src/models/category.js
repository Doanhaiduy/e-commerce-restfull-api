const mongoose = require('mongoose');
const CategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    icon: {
        type: String,
    },
    color: {
        type: String,
    },
});

mongoose.model('Category', CategorySchema);

module.exports = mongoose.model('Category');
