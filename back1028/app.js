var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var schedule = require('node-schedule');
var axios = require('axios');
var indexRouter = require('./routes/index');
var bulksaleRouter = require('./routes/bulksale');
var usersRouter = require('./routes/users');
var postcodeRouter = require('./routes/postcode');
var ordersRouter = require('./routes/orders');
var productsRouter = require('./routes/products');
var calpostageRouter = require('./routes/calpostage');
var adminRouter = require('./routes/admin');
var cartRouter = require('./routes/cart');
var imagesRouter = require('./routes/images');
var detailRouter = require('./routes/detail');
var wishRouter = require('./routes/wish');
var containersRouter = require('./routes/containers');
var async = require('async')
// var tediousExpress = require('express4-tedious');
var app = express();
var cors = require('cors')
app.use(express.json({limit: '50mb'}));
 
app.use(cors());

// app.use(function (req, res, next) {
//     req.sql = tediousExpress(config);
//     next();
// });
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/postcode', postcodeRouter);
app.use('/products', productsRouter);
app.use('/orders', ordersRouter);
app.use('/calpostage',calpostageRouter);
app.use('/admin',adminRouter);
app.use('/cart',cartRouter);
app.use('/images',imagesRouter);
app.use('/wish',wishRouter);
app.use('/containers',containersRouter);
app.use('/detail',detailRouter);

const  scheduleCronstyle = ()=>{
  //每分钟的第30秒定时执行一次:
    let rule = new schedule.RecurrenceRule();

    // your timezone
    rule.tz = 'Australia/Melbourne';
    rule.second = 0;
    rule.minute = 0;
    rule.hour = 17;
    schedule.scheduleJob(rule,()=>{
        const getBreeds = () => {
          try {
            const headers = {
              'Content-Type': 'application/json',
              'SellerToken': 'ad6853309ce1391f55bf9a3ab439f7b60c8e3122',
              'SellerID':'xinsports',
              // 'Access-Control-Allow-Origin': '*',
              // 'Access-Control-Allow-Credentials': true
            }
            return axios.get('https://nimda-marketplace.aws.kgn.io/api/marketplace/orders',{'headers':headers,'params':{'status':'ReleasedForShipment'}})
          } catch (error) {
            console.error(error)
          }
        } 
        const countBreeds = async () => {
          const breeds = getBreeds()
            .then(res => {
                const koganOrder = res.data;
                // console.log('result',result);
                // let testkoganOrder = {
                //   "Status": "Complete",
                //   "PendingUri": null,
                //   "Errors": [
                //     {
                //       "ID": 1000,
                //       "ErrorCode": "Info",
                //       "Message": "string"
                //     }
                //   ],
                //   "ResponseBody": [
                //       {
                //           "Currency": "string",
                //           "ID": "44",
                //           "Items": [
                //             {
                //               "ID": "123",
                //               "Quantity": 1,
                //               "SellerSku": "string",
                //               "UnitPrice": "12.5"
                //             }
                //           ],
                //           "OrderDateUtc": "2020-09-23T04:29:39Z",
                //           "OrderStatus": "ReleasedForShipment",
                //           "TotalPrice": "18",
                //           "TotalShippingPrice": "5.5",
                //           "BuyerAddress": {
                //             "AddressLine1": "string",
                //             "AddressLine2": "string",
                //             "City": "string",
                //             "CompanyName": "string",
                //             "Country": "string",
                //             "DaytimePhone": "string",
                //             "EmailAddress": "string",
                //             "FirstName": "string",
                //             "LastName": "string",
                //             "PostalCode": "3145",
                //             "StateOrProvince": "string"
                //           },
                //           "DeliverByDateUtc": "2020-09-23T04:29:39Z",
                //           "ShippingAddress": {
                //             "AddressLine1": "string",
                //             "AddressLine2": "string",
                //             "City": "string",
                //             "CompanyName": "string",
                //             "Country": "string",
                //             "DaytimePhone": "string",
                //             "EmailAddress": "string",
                //             "FirstName": "string",
                //             "LastName": "string",
                //             "PostalCode": "3161",
                //             "StateOrProvince": "string"
                //           }
                //         }
                //       ,
                //     {
                //       "Currency": "string",
                //       "ID": "33",
                //       "Items": [
                //         {
                //           "ID": "555",
                //           "Quantity": 1,
                //           "SellerSku": "string",
                //           "UnitPrice": "12.5"
                //         },
                //         {
                //           "ID": "666",
                //           "Quantity": 1,
                //           "SellerSku": "string",
                //           "UnitPrice": "12.5"
                //         }
                //       ],
                //       "OrderDateUtc": "2020-09-23T04:29:39Z",
                //       "OrderStatus": "ReleasedForShipment",
                //       "TotalPrice": "18",
                //       "TotalShippingPrice": "5.5",
                //       "BuyerAddress": {
                //         "AddressLine1": "string",
                //         "AddressLine2": "string",
                //         "City": "string",
                //         "CompanyName": "string",
                //         "Country": "string",
                //         "DaytimePhone": "string",
                //         "EmailAddress": "string",
                //         "FirstName": "string",
                //         "LastName": "string",
                //         "PostalCode": "3145",
                //         "StateOrProvince": "string"
                //       },
                //       "DeliverByDateUtc": "2020-09-23T04:29:39Z",
                //       "ShippingAddress": {
                //         "AddressLine1": "string",
                //         "AddressLine2": "string",
                //         "City": "string",
                //         "CompanyName": "string",
                //         "Country": "string",
                //         "DaytimePhone": "string",
                //         "EmailAddress": "string",
                //         "FirstName": "string",
                //         "LastName": "string",
                //         "PostalCode": "3161",
                //         "StateOrProvince": "string"
                //       }
                //     }
                //   ]
                // }
              let koganArr = []
              for(let i=0;i<koganOrder.ResponseBody.length;i++){
                  const {ID,Items,OrderDateUtc,OrderStatus,TotalPrice,TotalShippingPrice,BuyerAddress,ShippingAddress} = koganOrder.ResponseBody[i]
                  const {AddressLine1,AddressLine2,City,CompanyName,Country,DaytimePhone,EmailAddress,FirstName,LastName,PostalCode,StateOrProvince} = BuyerAddress
                  koganArr.push({
                      'KoganID':ID,
                      'PostToEmailAddress':ShippingAddress.EmailAddress,
                      'PostToFirstName':ShippingAddress.FirstName,
                      'PostToLastName':ShippingAddress.LastName,
                      'PostToAddress1':ShippingAddress.AddressLine1,
                      'PostToAddress2':ShippingAddress.AddressLine2,
                      'PostToCity':ShippingAddress.City,
                      'PostToState':ShippingAddress.StateOrProvince,
                      'PostToPostCode':ShippingAddress.PostalCode,
                      'PostToContactNumber':ShippingAddress.DaytimePhone,
                      'ShippingPrice':TotalShippingPrice,
                      'FinalPaidPrice':TotalPrice,
                      'OrderDateTime':OrderDateUtc,
                      'OrderStatus':OrderStatus,
                      'BuyerEmailAddress':EmailAddress,
                      'BuyerFirstName':FirstName,
                      'BuyerLastName':LastName,
                      'BuyerAddress1':AddressLine1,
                      'BuyerAddress2':AddressLine2,
                      'BuyerCity':City,
                      'BuyerState':StateOrProvince,
                      'BuyerPostCode':PostalCode,
                      'BuyerContactNumber':DaytimePhone,
                      'Items':Items
                  })
                  }
                  // export const baseUrl = 'https://stadiumsportsback.azurewebsites.net/';
                  // http://localhost:4000/
                  axios.post(`http://localhost:4000/orders/savekoganOrder`,koganArr).then(response=>{
                    console.log('response:',response.data);
                  })
            })
            .catch(error => {
              console.log(error)
            })
        }
        countBreeds()
        console.log('scheduleCronstyle:' + new Date());
    }); 
}
// scheduleCronstyle();

//------------------------------------start of my code-------------------
const  scheduleOrderStatusChange = ()=>{
  //每天17点定时执行一次:
    let rule = new schedule.RecurrenceRule();

    // your timezone
    rule.tz = 'Australia/Melbourne';
    // runs at 17:00:00
    rule.second = 0;
    rule.minute = 0;
    rule.hour = 17;
    schedule.scheduleJob(rule,()=>{
          try{
              baseUrl = 'https://stadiumsportsback.azurewebsites.net/';
              baseUrl2 = 'http://localhost:4000/'
              axios.get(`${baseUrl2}orders/scheduleOrderStatusChange`).then(response=>{
                console.log('response:',response.data);
              })
            }
          catch(error){
              console.log(error)
            }
        })
}
scheduleOrderStatusChange()
//------------------------------------end of my code-------------------


function parallel(middlewares) {
  return function (req, res, next) {
    async.each(middlewares, function (mw, cb) {
      mw(req, res, cb);
    }, next);
  };
}

app.use(parallel([
  indexRouter,
  usersRouter,
  postcodeRouter,
  productsRouter,
  ordersRouter,
  calpostageRouter,
  adminRouter,
  cartRouter,
  wishRouter,
  detailRouter,
  bulksaleRouter
]));


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


module.exports = app;



