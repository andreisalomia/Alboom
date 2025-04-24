const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const listEndpoints = require('express-list-endpoints');
require('dotenv').config({ path: __dirname + '/.env' });

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error(err));

// 🟩 REGISTER ROUTES - aceste 3 linii TREBUIE să fie AICI:
app.use('/api/auth', require('./routes/auth'));
app.use('/api/music', require('./routes/music'));
app.use('/api/admin', require('./routes/admin'));

// 🟥 NU pune nimic mai jos de .listen() !!!
app.listen(process.env.PORT, () => {
  console.log(`Server on http://localhost:${process.env.PORT}`);
});
