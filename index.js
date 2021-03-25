require('dotenv').config();
const mongoose = require('mongoose')
const express = require('express')
const cors = require('cors')



const taskRoute = require('./routes/tasks')
const userRoute = require('./routes/users')


const app = express();
const port = process.env.PORT || 5000;
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors({
    origin: process.env.REQUEST_ORIGIN
}))

app.use('/task',taskRoute);
app.use('/user',userRoute);

const connectionUrl = process.env.MONGO_URL;
mongoose.connect(connectionUrl, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log("Successfully connected to mongodb")).catch(err => console.log("mongo error", err));
app.listen(port, () => console.log(`listening on port : ${port}`));