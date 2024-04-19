const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        if (process.env.NODE_ENV === 'Development') {
            const db = await mongoose.connect('mongodb://localhost:27017/e-commerce');
        } else {
            const db = await mongoose.connect(process.env.MONGO_URI);
        }

        console.log('Database connection is ready...');
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
