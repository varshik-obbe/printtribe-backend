import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import morgan from 'morgan';
import adminSettings from './routes/admin_settings/admin_settings';
import customers from './routes/customers/customers';
import customerInventory from './routes/customers/products';
import walletInfo from './routes/customers/wallet';
import customerShipping from './routes/customer_shipping/customer_shipping';
import adminInvoice from './routes/orders/offline_orders';
import orders from "./routes/orders/orders";
import payment_methods from './routes/payment_methods/payment_methods';
import printribeSettings from './routes/printribe_settings/printribe_settings';
import categories from './routes/products/categories';
import products from './routes/products/products';
import quantProducts from './routes/products/product_quantity';
import pickupShiprocketOrder from "./routes/shipment/shiprocketShipment";
import pickupWixorder from "./routes/shipment/shiprocketWixOrders";
import shiprocketwebhhok from "./routes/shipment/webhookAuth";
import tasks from './routes/tasks/tasks';
import users from './routes/users/users';
import vendors from './routes/vendors/vendors';
import testToken from "./routes/wix_config/wix_config";
import zakekeConfig from './routes/zakeke/zakekeConfig';
import zakekeCSV from './routes/zakeke/zakekeCSV';
import zakekeCustomize from './routes/zakeke/zakekeCustomize';
import zakekeproducts from './routes/zakeke/zakekeProducts';

dotenv.config();
const app = express();
app.use(cors());
app.use(morgan('dev'));
app.use('/uploads', express.static('uploads'));
app.use('/ZakekeFiles', express.static('ZakekeFiles'));
app.use(bodyParser.json({limit: '100mb'}));
app.use(bodyParser.text({limit: '10mb'}));



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
  app.use('/api/zakekeCSV', zakekeCSV);
  app.use('/api/zakekeCustomize', zakekeCustomize);
  app.use('/api/orders', orders);
  app.use('/api/adminSettings', adminSettings);
  app.use('/api/customerShipping', customerShipping);
  app.use('/api/customerInventory', customerInventory);
  app.use('/api/customerWallet', walletInfo);
  app.use('/api/productQuant', quantProducts);
  app.use('/api/shiprocketGenrate', pickupShiprocketOrder);
  app.use('/api/shippingWebhook', shiprocketwebhhok);
  app.use('/api/wix', testToken);
  app.use('/api/adminInvoice', adminInvoice);
  app.use('/api/shiprocketWixOrders', pickupWixorder);
  app.use('/api/printribeSettings', printribeSettings);
  app.use('/api/tasks', tasks)

app.listen(500, function() {
    console.log('listening on 500')
  });
