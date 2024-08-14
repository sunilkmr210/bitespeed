const express = require('express');
const app = express();
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
const identifyRoute = require('./routes/identify')

mongoose.connect(
    process.env.mongo_url
)
.then(()=>console.log('db connection successfull'))
.catch((err)=>{
    console.log(err);
})

app.use(express.json());
app.use('/api', identifyRoute);

app.listen(5000 || process.env.PORT, ()=>{
    console.log('listening on port 5000');
})