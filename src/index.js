import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import connectMongo from 'connect-mongo';
import express from 'express';
import session from 'express-session';
import mongoose from 'mongoose';
import morgan from 'morgan';
import adminSettings from './routes/admin_settings/admin_settings';
import customers from './routes/customers/customers';
import customerInventory from './routes/customers/products';
import walletInfo from './routes/customers/wallet';
import customerShipping from './routes/customer_shipping/customer_shipping';
import fabricDesigns from './routes/fabricjs/fabricDesigns';
import fabricProducts from "./routes/fabricjs/fabricProducts";
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
import shopifyData from './routes/shopify_config/shopify_config';
import ccavReqHandler from './routes/CCAvenue/ccavRequestHandler';
import ccavResponseHandler from './routes/CCAvenue/ccavResponseHandler';
import addSessionShopify from './utils/addSessionShopify';
import '@shopify/shopify-api/adapters/node';
import {shopifyApi, LATEST_API_VERSION} from '@shopify/shopify-api';
import { restResources } from '@shopify/shopify-api/rest/admin/2023-10';
import ejs from 'ejs'
import path from 'path';
import { fileURLToPath } from 'url';
import customerProductsModel from "./models/customer_inventory_products";
import Customer from "./models/customers";
import fabricdesignModel from "./models/fabricDesigns"

let MonStore = connectMongo(session);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();
const shopify = shopifyApi({
  // The next 4 values are typically read from environment variables for added security
  apiKey: '4bcce42e0a1ba102f8837e678586a8ad',
  apiSecretKey: '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',
  scopes: ['read_products,write_products'],
  hostName: "api.theprintribe.com",
  hostScheme: 'https',
  restResources,
});
const app = express();
app.use(cors());
app.use(morgan('dev'));
app.set('views', __dirname + '/public');
app.set('view engine', 'ejs');
app.engine('html', ejs.renderFile);
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

  app.use(session({
    secret: 'test123',
    resave: false,
    saveUninitialized: true,
    store: new MonStore({ url: "mongodb://varshik:test123@localhost:27017/printtribe?authSource=admin", dbName: "printtribe", ttl: 1 * 24 * 60 * 60, autoRemove: 'native' })
  }));

  app.get('/auth', async (req, res) => {
    // The library will automatically redirect the user
    await shopify.auth.begin({
      shop: shopify.utils.sanitizeShop(req.query.shop, true),
      callbackPath: '/auth/callback',
      isOnline: false,
      rawRequest: req,
      rawResponse: res,
    });
    
    req.session.user = {
      customer_id: req.query.customer_id
    }

    req.session.save(err => {
      if(err){
          console.log(err);
      } else {
        console.log('saved successfully');
      }
    });
  });
  
  app.get('/auth/callback', async (req, res) => {
    // The library will automatically set the appropriate HTTP headers
    const callback = await shopify.auth.callback({
      rawRequest: req,
      rawResponse: res,
    });
  
    if(callback.session) {
      addSessionShopify(req.session.user.customer_id, callback.session, callback.session.shop);
    }
    // You can now use callback.session to make API requests
  
    res.redirect('https://shopify.theprintribe.com/'+req.session.user.customer_id);
  });

  app.post('/ccavRequestHandler', function (request, response){
	ccavReqHandler.postReq(request, response);
  });
  app.get('/CCAvenueForm', function (req, res){
    let order_id = req.query.order_id;
    let amount = req.query.amount;
    res.render('dataFrom.html', {order_id: order_id, amount:amount});
  });

  app.post('/ccavResponseHandler', function (request, response){
    ccavResponseHandler.postRes(request, response);
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
  app.post('/api/shopify/addProducts', async function(req,res) {
    const { productData } = req.body;

    let session;

    let customer_product;

    await Customer.findOne({ _id: productData.customer_id })
    .exec()
    .then((data) => {
      if(data) {
        session = data.shopify_access_token
      }
      else {
        session = {};
      }
    })
    .catch((err) => {
      res.status(400).json({error:{global:"coluld not send mail"}})
    }) 

    const client = new shopify.clients.Rest({session});
    const response = client.get({path: 'shop'});
    const access = await shopify.rest.AccessScope.all({
      session: session,
    });


    await customerProductsModel.findOne({ 'product_id': productData.id })
    .exec()
    .then(async (data) => {
      if(data) {
        customer_product = {
          _id: data._id,
          product_id: data.product_id,
          title: data.title,
          description: data.description,
          price: data.price,
          productsize: data.productsize,
          productcolor: data.productcolor,
          product_img: data.product_img,
          category_id: data.category_id,
          quantity: data.quantity,
          zakeke_price: data.zakeke_price,
          designID: data.designID,
          customer_id: data.customer_id,
          design_url: "",
          shopify_prod: data.shopify_prod ? data.shopify_prod : "",
          shopify_inventory_id: data.shopify_inventory_id ? data.shopify_inventory_id : "",
          shopify_prod_id: data.shopify_prod_id ? data.shopify_prod_id : "",
          authorization_code: data.authorization_code ? data.authorization_code : "",
          createdAt: data.createdAt,
          updatedAt: data.updatedAt
      };
      }
      else {
        customer_product = {};
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(400).json({error:{global:"coluld not find the product"}})
    })

    if(customer_product) {
        let designData = await fabricdesignModel.findOne({ 'productId': customer_product.product_id, 'color': customer_product.productcolor, 'side': "one", 'customerId': customer_product.customer_id })
        .exec()
        .then(async (desData) => {
            if(desData) {
              customer_product.design_url = desData.url.split("base64,")[1];
            }
            else {
              customer_product.design_url = "";
            }
        })
        .catch((err) => console.log("error getting the design", err));
    }

    const product = new shopify.rest.Product({session: session});
    product.title = customer_product.title;
    product.body_html = "<strong>"+customer_product.description+"</strong>";
    product.product_type = "T-Shirt";
    product.status = "draft"
    product.variants = [
      {
        "option1": customer_product.productcolor,
        "option2": customer_product.productsize,
        "price": customer_product.price,
        "sku": customer_product.title+customer_product.productsize+customer_product.productcolor+customer_product._id
      }
    ];
    product.options = [
      {
        "name": "Color",
        "values": [
          customer_product.productcolor,
        ]
      },
      {
        "name": "Size",
        "values": [
          customer_product.productsize
        ]
      }
    ];
    product.images = [
      {
        "attachment": customer_product.design_url
      }
    ];
    const product_saved = await product.save({
      update: true,
    });


    await customerProductsModel.updateOne({ 'product_id': productData.id }, { $set: { 'shopify_prod': 'yes', 'shopify_prod_id': product.id, 'shopify_inventory_id': product.variants[0].id, 'authorization_code': productData.authorization_code } })
    .then((updateData) => {
      res.status(200).json({ global: { success: "updated data" } })
    })
    .catch((err) => {
      console.log("error occured while updating product"+err)
      res.status(400).json({ global: {error: "error occured while updating product"} })                  
    })
  });

  app.post('/api/shopify/removeProduct', async function(req,res) {
    const { productData } = req.body;

    let session;

    let customer_product;

    await Customer.findOne({ _id: productData.customer_id })
    .exec()
    .then((data) => {
      if(data) {
        session = data.shopify_access_token
      }
      else {
        session = {};
      }
    })
    .catch((err) => {
      res.status(400).json({error:{global:"coluld not send mail"}})
    })

    await customerProductsModel.findOne({ 'product_id': productData.id })
    .exec()
    .then(async (data) => {
      if(data) {
        customer_product = {
          _id: data._id,
          shopify_prod: data.shopify_prod ? data.shopify_prod : "",
          shopify_inventory_id: data.shopify_inventory_id ? data.shopify_inventory_id : "",
          shopify_prod_id: data.shopify_prod_id ? data.shopify_prod_id : ""
      };
      }
      else {
        customer_product = {};
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(400).json({error:{global:"coluld not find the product"}})
    })

    if(customer_product.shopify_prod == "yes")
    {
      await shopify.rest.Product.delete({
        session: session,
        id: customer_product.shopify_prod_id,
      });

      customerProductsModel.updateOne({ 'product_id': productData.id }, { $set: { 'shopify_prod': 'no' } })
      .then((updateData) => {
        res.status(200).json({ global: { success: "updated data" } })
      })
      .catch((err) => {
        console.log("error occured while updating product"+err)
        res.status(400).json({ global: {error: "error occured while updating product"} })                  
      })
    }
    else {
      res.status(400).json({ global: {error: "not a shopify product"} }) 
    }
  });

  app.post('/webhooksShopify', express.text({type: '*/*'}), async (req, res) => {
    const {valid, topic, domain} = await shopify.webhooks.validate({
      rawBody: req.body, // is a string
      rawRequest: req,
      rawResponse: res,
    });
  
    if (!valid) {
      console.error('Invalid webhook call, not handling it');
      res.send(400); // Bad Request
    }
  
    console.log(`Received webhook for ${topic} for shop ${domain}`);
  
    const sessionId = shopify.session.getOfflineId(domain);


  
    // Run your webhook-processing code here!
  });
  app.use('/api/shopify', shopifyData)
  app.use('/api/adminInvoice', adminInvoice);
  app.use('/api/shiprocketWixOrders', pickupWixorder);
  app.use('/api/printribeSettings', printribeSettings);
  app.use('/api/tasks', tasks)
  app.use('/api/fabric', fabricProducts);
  app.use('/api/fabricDesigns', fabricDesigns);

app.listen(500, function() {
    console.log('listening on 500')
  });
