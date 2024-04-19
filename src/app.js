const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const productsRouter = require('./routers/products');
const categoriesRouter = require('./routers/categories');
const usersRouter = require('./routers/users');
const ordersRouter = require('./routers/orders');

const connectDB = require('./services');
const authJwt = require('./helpers/jwt');
const errorHandler = require('./helpers/error-handler');

const app = express();

require('dotenv').config();

const PORT = process.env.PORT || 3000;
const api = process.env.API_URL;

// Middleware
app.use(bodyParser.json());
app.use(morgan('tiny'));
app.use(authJwt());
app.use(errorHandler);
app.use('/public/uploads', express.static(path.join(__dirname, '../public/uploads/')));

// Set cors:
app.options('*', cors());
// Connect to MongoDB
connectDB();
// Routes
app.get('/', (req, res) => {
    res.send('Server is ready!');
});
app.use(`${api}/products`, productsRouter);
app.use(`${api}/categories`, categoriesRouter);
app.use(`${api}/users`, usersRouter);
app.use(`${api}/orders`, ordersRouter);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
