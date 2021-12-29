import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import morgan from 'morgan';
import customers from './routes/customers/customers';
import payment_methods from './routes/payment_methods/payment_methods';
import categories from './routes/products/categories';
import products from './routes/products/products';
import users from './routes/users/users';
import vendors from './routes/vendors/vendors';
import zakekeConfig from './routes/zakeke/zakekeConfig';
import zakekeproducts from './routes/zakeke/zakekeProducts';

dotenv.config();
const app = express();
app.use(cors());
app.use(morgan('dev'));
app.use('/uploads', express.static('uploads'));
app.use(bodyParser.json());



mongoose
  .connect(
//     `mongodb+srv://scaffolding:scaffolding@cluster0-cqgrr.mongodb.net/test?retryWrites=true&w=majority`,
//     { useNewUrlParser: true }
    "mongodb://varshik:test123@localhost:27017/printtribe?authSource=admin",{ useNewUrlParser: true }
  )
  .then(client => {
    console.log("connected to database");
  })
//   )
// mongoose.connect("mongodb://localhost:27017/printtribe",{ useNewUrlParser: true })
  .catch(err => {
    console.log(err);
  });

  app.use('/api/users/', users);
  app.use('/api/categories', categories);
  app.use('/api/products', products);
  app.use('/api/vendors', vendors);
  app.use('/api/zakekeConfig', zakekeConfig);
  app.use('/api/zakekeVariant', zakekeproducts);
  app.use('/api/customers', customers);
  app.use('/api/payment_methods', payment_methods);

app.listen(500, function() {
    console.log('listening on 500')
  });
