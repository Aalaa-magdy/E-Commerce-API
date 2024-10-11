const express = require('express')
const bodyParser = require('body-parser')
const morgan = require('morgan')
require('dotenv/config')
const mongoose = require('mongoose')
const api = process.env.API_URL;
const app = express();
const productRouter= require('./routers/products')
const categoryRouter = require('./routers/categories')
const userRouter = require('./routers/users')
const orderRouter = require('./routers/orders')
const cors= require('cors');
const authJwt= require('./helpers/jwt')
const errorHandler = require('./helpers/error-handler');

// middleware
app.use(bodyParser.json())
app.use(cors())
app.use('public/uploads',express.static(__dirname + '/public/uploads') )
app.options('*',cors())

app.use(morgan('tiny'))

app.use(authJwt())
app.use(errorHandler)
// Routes
app.use(`${api}/products`,productRouter)
app.use(`${api}/categories`,categoryRouter)
app.use(`${api}/users`,userRouter)
app.use(`${api}/orders`,orderRouter)
mongoose.connect(process.env.CONNECT_STRING,{
  useNewUrlParser: true,
  useUnifiedTopology: true,
  dbName:'E-Shop-database',
  serverSelectionTimeoutMS: 30000,  
}).then(()=>{
  console.log('Connected to MongoDB')
}).catch((err)=>{
  console.log(err);
})



app.listen(5000,()=>{
  console.log(api)
  console.log('Server is running on port 5000')
}
  ) 



