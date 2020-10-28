var express = require('express');
var router = express.Router();
var Request = require('tedious').Request; 
var Connection = require('tedious').Connection; 
var nodemailer = require('nodemailer');
var fs = require('fs');
var moment = require('moment');
var tz = require('moment-timezone');
var smtpTransport = require('nodemailer-smtp-transport'); 
var config = require('../config')
var connection = new Connection(config);  
    connection.on('connect', function(err) {  
        // If no error, then good to proceed.
    if(err){console.log(err);}
    else{
 
router.post('/orderList',function(req,res){
    const {email} = req.body
    withID = (IDArr)=>{
      var request = new Request(`select WebOrderhead.SRN,WebOrderhead.OrderStatus,OrderDateTime, TrackingNo, BestCourier, WebOrderhead.FinalPaidPrice from WebOrderhead left join HBOrderHead on HBOrderHead.SRN = WebOrderhead.SRN where WebCustomerID = '${IDArr[0].WebCustomerID}' order by OrderDateTime desc`, function(err,rowCounts,rows) {  
        if (err) {  
            console.log(err);
          } 
        else {
          jsonArray=[]
          for(var i=0; i < rowCounts; i++)
              {
              var singleRowData = rows[i]; 
              var rowObject= {};
              for(var j =0; j < singleRowData.length; j++)
                {
                  var tempColName = singleRowData[j].metadata.colName;
                  var tempColData = singleRowData[j].value;
                  rowObject[tempColName] = tempColData;
                }
                jsonArray.push(rowObject);
              }
              res.send(jsonArray)
        }
      })
      request.on('row',function(columns){})
      request.on('requestCompleted', function () {
        // Next SQL statement.
      });
      connection.execSql(request)
    }
      request = new Request(`select WebCustomerID from WebCustomer where EmailAddress = '${email} '`,function(err,rowCounts,rows){
        if(err){
          console.log(err);
        }else{
          if(rows.length > 0 ){
            jsonArray=[]
            for(var i=0; i < rowCounts; i++)
                {
                var singleRowData = rows[i]; 
                var rowObject= {};
                for(var j =0; j < singleRowData.length; j++)
                  {
                    var tempColName = singleRowData[j].metadata.colName;
                    var tempColData = singleRowData[j].value;
                    rowObject[tempColName] = tempColData;
                  }
                jsonArray.push(rowObject);
                }
                withID(jsonArray)
                // console.log('a',typeof jsonArray[0].CustomerLevel);
          }
          else{
              res.send([])
          }
        }
    })  
    request.on('row',function(columns){})
    request.on('requestCompleted', function () {
      // Next SQL statement.
    });
    connection.execSql(request)
})

router.get('/orderCheck/:SRNumber/:email',function(req,res){
  const SRNumber = req.params.SRNumber
  const email = req.params.email
  getOrder = (IDArr)=>{
    var request = new Request(`select * from WebOrderhead where WebCustomerID='${IDArr[0].WebCustomerID}' and SRN='${SRNumber}' `,function(err,rowCounts,rows){
      if(err) console.log(err);
      console.log(rowCounts,SRNumber,email,'aaa')
      if(rowCounts>0){
        jsonArray=[]
        for(var i=0; i < rowCounts; i++)
            {
            var singleRowData = rows[i]; 
            var rowObject= {};
            for(var j =0; j < singleRowData.length; j++)
              {
                var tempColName = singleRowData[j].metadata.colName;
                var tempColData = singleRowData[j].value;
                rowObject[tempColName] = tempColData;
              }
            jsonArray.push(rowObject);
            }
            res.send(jsonArray) 
      }else{
        res.send({code:1,msg:'email SRN doesnot match'})
      }
    })
      request.on('row',function(columns){})
      request.on('requestCompleted', function () {
        // Next SQL statement.
      });
      connection.execSql(request)
      request.on('end',()=>{
        connection.close()
      })
  }

    request = new Request(`select WebCustomerID from WebCustomer where EmailAddress = '${email} '`,function(err,rowCounts,rows){
      if(err){
        console.log(err);
      }else{
        if(rows.length > 0 ){
          jsonArray=[]
          for(var i=0; i < rowCounts; i++)
              {
              var singleRowData = rows[i]; 
              var rowObject= {};
              for(var j =0; j < singleRowData.length; j++)
                {
                  var tempColName = singleRowData[j].metadata.colName;
                  var tempColData = singleRowData[j].value;
                  rowObject[tempColName] = tempColData;
                }
              jsonArray.push(rowObject);
              }
              getOrder(jsonArray)
              // console.log('a',typeof jsonArray[0].CustomerLevel);
        }
        else{
            res.send([])
        }
      }
  })  
      request.on('row',function(columns){})
      request.on('requestCompleted', function () {
        // Next SQL statement.
      });
      connection.execSql(request)
})

//----------------here is my code--------------
router.get('/scheduleOrderStatusChange',function(req,res){
  var request = new Request(`select SRN from WebOrderhead where OrderStatus = 'processing'`,function(err,rowCounts,rows){
    if(err) console.log(err);
    else{
      jsonArray=[]
      for(var i=0; i < rowCounts; i++)
          {
          var singleRowData = rows[i]; 
          var rowObject= {};
          for(var j =0; j < singleRowData.length; j++)
            {
              var tempColName = singleRowData[j].metadata.colName;
              var tempColData = singleRowData[j].value;
              rowObject[tempColName] = tempColData;
            }
          jsonArray.push(rowObject);
          }
          findTrackNoExist(jsonArray)
    }
  })
    request.on('row',function(columns){})
    request.on('requestCompleted', function () {
      // Next SQL statement.
    });
    connection.execSql(request)
    request.on('end',()=>{
      connection.close()
    })
    
    findTrackNoExist = (jsonArray)=>{
      let processingSRN = ''
      for(let i = 0; i < jsonArray.length; i++){
        if(i===jsonArray.length-1){
          processingSRN += ` SRN = '${jsonArray[i].SRN}'`
        }
        else{
        processingSRN += ` SRN = '${jsonArray[i].SRN}' or `
        }
      }
    if(processingSRN !== ''){
        request = new Request(`select SRN, EmailAddress, TrackingNo, BestCourier from HBOrderHead where (${processingSRN}) and TrackingNo is not null`, function(err,rowCounts,rows) {  
          if (err) {  
              console.log(err);
            } 
          else {
            if(rowCounts===0){
              res.send({code:1, msg:'No processing order has tracking number'})
            }else{
            newJsonArray=[]
            for(var i=0; i < rowCounts; i++)
                {
                var singleRowData = rows[i]; 
                var rowObject= {};
                for(var j =0; j < singleRowData.length; j++)
                  {
                    var tempColName = singleRowData[j].metadata.colName;
                    var tempColData = singleRowData[j].value;
                    rowObject[tempColName] = tempColData;
                  }
                newJsonArray.push(rowObject);
                } 
                setOrderStatusShip(newJsonArray)
              }
          }
        })
        request.on('row',function(columns){})
        request.on('requestCompleted', function () {
        });
        connection.execSql(request)
        request.on('end',()=>{
          connection.close()
        })
    }else{
      console.log('No processing order to continue setting shipped')
      res.send({code:1, msg:'No processing order to continue setting shipped'})
      request.on('end',()=>{
        connection.close()
      })
    }
  }
    setOrderStatusShip = (newJsonArray)=>{
      let toChangeSRN = ''
      for(let i = 0; i < newJsonArray.length; i++){
        if(i===newJsonArray.length-1){
          toChangeSRN += ` SRN = '${newJsonArray[i].SRN}'`
        }
        else{
          toChangeSRN += ` SRN = '${newJsonArray[i].SRN}' or `
        }
      }
        request = new Request(`UPDATE WebOrderhead set OrderStatus = 'Shipped' where ${toChangeSRN}`, function(err) {  
          if (err) {  
              console.log(err);
            }
          else{
            res.send({code:0,msg:'Order status change to Shipped successfully'})
            sendTrackingToCustomer(newJsonArray)
          }  
        });  
        request.on('row',function(columns){})
        request.on('requestCompleted', function () {
        });
        connection.execSql(request)
        request.on('end',()=>{
          connection.close()
        })
    }

    //----------------send tracking email-----------------
    sendTrackingToCustomer =(newJsonArray)=>{
      for(let i=0; i<newJsonArray.length;i++){
        let trackUser = newJsonArray[i].EmailAddress
        let shipInfo = newJsonArray[i]
        var transporter = nodemailer.createTransport(smtpTransport({
          host: 'cpanel-003-syd.hostingww.com',
          port: 587,
          auth: {
              user: 'admin@xinsports.com.au',
              pass: 'Testtest001'
          }
        }));
          var mailOptions = {
            from: 'admin@xinsports.com.au',
            to: trackUser,
            subject: 'Order Shipped',
            html:
            `<html>
            <head>
            <style type="text/css">
            TABLE.Email {
            width: 640px;
            padding: 5px;
            margin: 0px;
            border: 1px solid #5872CB;
            }
            TABLE.Email TH {
            font-weight: bold;
            font-size: 12px;
            color: #ffffff;
            font-family: Arial, Verdana, Sans-Serif;
            font-style: strong;
            background-color: #5499c7;
            text-align: center;
            text-decoration: none;
            padding: 5px;
            }
            TABLE.Email TD {
            font-weight: normal;
            font-size: 12px;
            color: #000000;
            font-family: Arial, Verdana, Sans-Serif;
            background-color: #ffffff;
            text-align: left;
            text-decoration: none;
            padding: 3px;
            }
            </style>
            </head>
            <body>
            <table class="Email">
            <tbody>
            <tr>
            <td class="Email" colspan="2">
            <p><strong>Your order ${shipInfo.SRN} has been shipped </strong><strong>!</strong></p>
            <p>If you would like to check the Tracking number and the Courier, please visit your personal My Orders page. Thank you for shopping with us.</p>
            <p>xinsports.com.au</p>
            </td>
            </tr>
            </tbody>
            </table>
            <table class="Email">
            <tbody>
            <tr>
            <th class="Email">Shipment Information</th>
            </tr>
            </tbody>
            </table>
            <table class="Email">
            <tbody>
            <tr>
            <td class="Email" style="text-align: center; width: 48px;" colspan="4">
            <table style="width: 100%;">
            <tbody>
            <tr>
            <td class="Email" style="width: 50%;" valign="top"><strong>Tracking Number:</strong>
            <div style="padding-left: 30px;">${shipInfo.TrackingNo}</div>
            </td>
            <td class="Email" style="width: 50%;" valign="top"><strong>Courier:</strong>
            <div style="padding-left: 30px;">${shipInfo.BestCourier}</div>
            </td>
            </tr>
            </tbody>
            </table>
            </td>
            </tr>
            </tbody>
            </table>
            <p>&nbsp;</p>
            </body>
            </html>`
          };
          transporter.sendMail(mailOptions, function (error, info) {
              if (error) {
                  console.log(error);
              } else {
                  console.log('Email sent: ' + info.response);
              }
          });
       }
    }
})
//----------------here is the end--------------


router.get('/orderDetail/:SRNumber',function(req,res){
  const SRNumber = req.params.SRNumber
  var request = new Request(`select * from (WebOrderhead join WebOrderBody on WebOrderBody.SRN = WebOrderhead.SRN) where WebOrderBody.SRN = '${SRNumber}' `,function(err,rowCounts,rows){
    if(err) console.log(err);
    else{
      jsonArray=[]
      for(var i=0; i < rowCounts; i++)
          {
          var singleRowData = rows[i]; 
          var rowObject= {};
          for(var j =0; j < singleRowData.length; j++)
            {
              var tempColName = singleRowData[j].metadata.colName;
              var tempColData = singleRowData[j].value;
              rowObject[tempColName] = tempColData;
            }
          jsonArray.push(rowObject);
          }
          if(jsonArray[0].OrderStatus==='Shipped'){
            getProcessingTrackNo(jsonArray,jsonArray[0].SRN)
            // res.send(jsonArray)
          }else{
            res.send(jsonArray) 
          }
    }
  })
    request.on('row',function(columns){})
    request.on('requestCompleted', function () {
      // Next SQL statement.
    });
    connection.execSql(request)
    request.on('end',()=>{
      connection.close()
    })

    getProcessingTrackNo =(detailArr, SRNStr)=>{
      request = new Request(`select TrackingNo, BestCourier from HBOrderHead where SRN = ${SRNStr} and TrackingNo is not null`, function(err,rowCounts,rows) {  
        if (err) {  
            console.log(err);
          } 
        else {
          if(rowCounts===0){
            res.send(detailArr)
          }else{
          // jsonArray=[]
          for(var i=0; i < rowCounts; i++)
              {
              var singleRowData = rows[i]; 
              var rowObject= {};
              for(var j =0; j < singleRowData.length; j++)
                {
                  var tempColName = singleRowData[j].metadata.colName;
                  var tempColData = singleRowData[j].value;
                  rowObject[tempColName] = tempColData;
                }
              detailArr.push(rowObject);
              } 
              res.send(detailArr)
            }
        }
      })
        request.on('row',function(columns){})
        request.on('requestCompleted', function () {
          // Next SQL statement.
        });
        connection.execSql(request)
    }

})

 
router.delete('/deleteOrder/:SRN',function(req,res){
  const SRN = req.params.SRN;
  deleteFromBody = ()=>{
    var request = new Request(`delete from WebOrderBody where SRN = '${SRN}'`,function(err){
      if(err){
        console.log(err);
      }
      else{
        res.send({code:0,msg:'delete succ'})
      }
    })
    request.on('row',function(columns){})
    request.on('requestCompleted', function () {
      // Next SQL statement.
    });
    connection.execSql(request)
    request.on('end',()=>{
      connection.close()
    })
  }
  var request = new Request(`delete from WebOrderhead where SRN = '${SRN}'`,function(err){
    if(err){
      console.log(err);
    }
    else{
      deleteFromBody()
      
    }
  })
  request.on('row',function(columns){})
  request.on('requestCompleted', function () {
    // Next SQL statement.
  });
  connection.execSql(request)

})

 
router.post('/payStatus/:SRNumber/:finalPrice',function(req,res){
  const SRNumber = req.params.SRNumber;
  const finalPrice = req.params.finalPrice;
  const {id,status,payer} = req.body;
  var d = new Date();
  function toISOLocal(d) {
    var z  = n =>  ('0' + n).slice(-2);
    var zz = n => ('00' + n).slice(-3);
    var off = d.getTimezoneOffset();
    var sign = off < 0? '+' : '-';
    off = Math.abs(off);
    if(req.get('host')==='localhost:4000'){
      return d.getFullYear() + '-'
           + z(d.getMonth()+1) + '-' +
           z(d.getDate()) + ' ' +
           z(d.getHours()) + ':'  + 
           z(d.getMinutes()) + ':' +
           z(d.getSeconds()) + '.' +
           zz(d.getMilliseconds())
    }
    else{
      let nextD = 0
      if(d.getHours()>=16){
        nextD = 1
      }
      return d.getFullYear() + '-'
      + z(d.getMonth()+1) + '-' +
      z(d.getDate()+nextD) + ' ' +
      z(d.getHours()+z(off/60|0)) + ':'  + 
      z(d.getMinutes()) + ':' +
      z(d.getSeconds()) + '.' +
      zz(d.getMilliseconds())
    }
    
  }
  // let payment_date = toISOLocal(d)
  var utc = moment().utc()
  var payment_date = utc.clone().tz('Australia/Melbourne').format()
  payment_date = payment_date.toString()
  payment_date = payment_date.slice(0,-6)
  insertWebPaypalIPN = ()=>{
   var request = new Request(`insert into WebPayPalIPN ("Receiver_email","Payer_email","Payment_status","Txn_id","Mc_gross","mc_currency","payment_date","Item_number") values ('service@xinsports.com.au','${payer.email_address}','${status}','${id}','${finalPrice}','AUD','${payment_date}','${SRNumber}') `,function(err,rowCounts,rows){
      if(err) console.log(err);
      else{
        res.send({code:0,msg:'pay succ insert'})
      }
    })
      request.on('row',function(columns){})
      request.on('requestCompleted', function () {
        // Next SQL statement.
      });
      connection.execSql(request)
      request.on('end',()=>{
        connection.close()
      })
  }
  var request = new Request(`update WebOrderhead set OrderStatus = 'paid', PaymentMethod = 'paypal' where SRN = '${SRNumber}'`, function(err) {  
    if (err) {  
        console.log(err);
      }
    else{ 
      insertWebPaypalIPN()
      // res.send({code:0,msg:'already paid'})
    }  
    });  
    request.on('row',function(columns){})
    request.on('requestCompleted', function () {
      // Next SQL statement.
    });
 connection.execSql(request)
})
router.get('/getKOrderInfo',function(req,res){
  getKOrderBody = (tempData,tempArr)=>{
    let SRNStr = ''
    tempData.map((item,index)=>{
        if(tempData.length-1===index){
          SRNStr = SRNStr+`SRN = ${item.SRN}`
        }
        else{
          SRNStr = SRNStr+`SRN = ${item.SRN} or `
        }
    })
    request = new Request(`select KoganID,SRN, CustomLabel,Quantity from KOrderBody where ${SRNStr}`, function(err,rowCounts,rows) {  
      if (err) {  
          console.log(err);
        } 
      else {
      console.log('3');
        jsonArray=[]
        for(var i=0; i < rowCounts; i++)
            {
            var singleRowData = rows[i]; 
            var rowObject= {};
            for(var j =0; j < singleRowData.length; j++)
              {
                var tempColName = singleRowData[j].metadata.colName;
                var tempColData = singleRowData[j].value;
                rowObject[tempColName] = tempColData;
              }
            jsonArray.push(rowObject);
            } 
            // console.log(jsonArray,'arr');
            let finalArr = []
            finalArr.push(jsonArray)
            finalArr.push(tempData)
            finalArr.push(tempArr)
            res.send(finalArr)
      }
    })
      request.on('row',function(columns){})
      request.on('requestCompleted', function () {
        // Next SQL statement.
      });
      connection.execSql(request)
      request.on('end',()=>{
        connection.close()
      })
  }
  getFromHBOrder =(tempArr)=>{
    let SRNStr = ''
    console.log('temparr',tempArr);
    tempArr.map((item,index)=>{
        if(tempArr.length-1===index){
          SRNStr = SRNStr+`SRN = ${item.SRN}`
        }
        else{
          SRNStr = SRNStr+`SRN = ${item.SRN} or `
        }
    })
    console.log('str',SRNStr);
    request = new Request(`select SRN, TrackingNo,BestCourier,[Posted on Date] from HBOrderHead where (${SRNStr}) and TrackingNo is not null`, function(err,rowCounts,rows) {  
      if (err) {  
          console.log(err);
        } 
      else {
        if(rowCounts===0){
          res.send({code:1,msg:`No Order's tracking number need to be uploaded`})
        }else{
      console.log('2');
        jsonArray=[]
        for(var i=0; i < rowCounts; i++)
            {
            var singleRowData = rows[i]; 
            var rowObject= {};
            for(var j =0; j < singleRowData.length; j++)
              {
                var tempColName = singleRowData[j].metadata.colName;
                var tempColData = singleRowData[j].value;
                rowObject[tempColName] = tempColData;
              }
            jsonArray.push(rowObject);
            } 
            console.log(jsonArray,'arr');
            getKOrderBody(jsonArray,tempArr)
          }
      }
    })
      request.on('row',function(columns){})
      request.on('requestCompleted', function () {
        // Next SQL statement.
      });
      connection.execSql(request)
  }
  request = new Request(`select SRN,KoganID from KOrderHead where OrderStatus='ReleasedForShipment'`, function(err,rowCounts,rows) {  
    if (err) {  
        console.log(err);
      } 
    else {
      console.log('1');
      jsonArray=[]
      for(var i=0; i < rowCounts; i++)
          {
          var singleRowData = rows[i]; 
          var rowObject= {};
          for(var j =0; j < singleRowData.length; j++)
            {
              var tempColName = singleRowData[j].metadata.colName;
              var tempColData = singleRowData[j].value;
              rowObject[tempColName] = tempColData;
            }
          jsonArray.push(rowObject);
          } 
          let tempArr = []
          jsonArray.map((item,index)=>{
            tempArr.push({'SRN':item.SRN,'ID':item.KoganID})
          })
          getFromHBOrder(tempArr)
    }
  })
    request.on('row',function(columns){})
    request.on('requestCompleted', function () {
      // Next SQL statement.
    });
    connection.execSql(request)
})
router.post('/savekoganOrder',function(req,res){
  let koganArr = req.body
  insertValue=(jsonArray,invalidKoganID)=>{
    let SRNArr= []
    jsonArray.map((item,index)=>{
      SRNArr.push(parseInt(item.SRN))
    })
    let SRNumber=501646
    // if(SRNArr.length===0){
    //   SRNumber=9000001
    // }
    SRNumber = Math.max(...SRNArr)+1
    
    let insertSentence = ''
    let insertSentence2 = ''
    for(let k =0;k<invalidKoganID.length;k++){
      for(let x=0;x<koganArr.length;x++){
        if(invalidKoganID[k].KoganID===koganArr[x].KoganID){
          koganArr.splice(x,1)
        }
      }
    }
    // console.log('a',koganArr);
    // koganArr = kogantempArr
    for(let i=0;i<koganArr.length;i++){
      console.log(parseInt(SRNumber),parseInt(i));
        SRNumber = parseInt(SRNumber) +parseInt(i)
        insertSentence = insertSentence+` insert into KOrderHead ("SRN","KoganID","PostToEmailAddress","PostToFirstName","PostToLastName","PostToAddress1","PostToAddress2","PostToCity","PostToState","PostToPostCode","PostToContactNumber","ShippingPrice","FinalPaidPrice","OrderDateTime","OrderStatus","BuyerEmailAddress","BuyerFirstName","BuyerLastName","BuyerAddress1","BuyerAddress2","BuyerCity","BuyerState","BuyerPostCode","BuyerContactNumber") values ('${SRNumber}','${koganArr[i].KoganID}','${koganArr[i].PostToEmailAddress}','${koganArr[i].PostToFirstName}','${koganArr[i].PostToLastName}','${koganArr[i].PostToAddress1}','${koganArr[i].PostToAddress2}','${koganArr[i].PostToCity}','${koganArr[i].PostToState}','${koganArr[i].PostToPostCode}','${koganArr[i].PostToContactNumber}','${parseFloat(koganArr[i].ShippingPrice)}','${parseFloat(koganArr[i].FinalPaidPrice)}','${koganArr[i].OrderDateTime}','${koganArr[i].OrderStatus}','${koganArr[i].BuyerEmailAddress}','${koganArr[i].BuyerFirstName}','${koganArr[i].BuyerLastName}','${koganArr[i].BuyerAddress1}','${koganArr[i].BuyerAddress2}','${koganArr[i].BuyerCity}','${koganArr[i].BuyerState}','${koganArr[i].BuyerPostCode}','${koganArr[i].BuyerContactNumber}')  `
        for(let j=0;j<koganArr[i].Items.length;j++){
          // console.log(koganArr[i].Items[j].UnitPrice,'aaaa');
          let totalPrice = koganArr[i].Items[j].Quantity * parseFloat(koganArr[i].Items[j].UnitPrice)
          // console.log('s',totalPrice);
          insertSentence2 = insertSentence2+ ` insert into KOrderBody ("KoganID","SRN","CustomLabel","ItemTitle","Price","Quantity","ItemTotal") values ('${koganArr[i].Items[j].ID}','${SRNumber}','${koganArr[i].Items[j].SellerSku}','','${parseFloat(koganArr[i].Items[j].UnitPrice)}','${parseFloat(koganArr[i].Items[j].Quantity)}','${parseFloat(totalPrice)}')`
        }
     }
     request = new Request(`${insertSentence} ${insertSentence2}`,function(err,rowCounts,rows){
       if(err){console.log(err);}
       else{
        // jsonArray=[]
        // for(var i=0; i < rowCounts; i++)
        //     {
        //     var singleRowData = rows[i]; 
        //     var rowObject= {};
        //     for(var j =0; j < singleRowData.length; j++)
        //       {
        //         var tempColName = singleRowData[j].metadata.colName;
        //         var tempColData = singleRowData[j].value;
        //         rowObject[tempColName] = tempColData;
        //       }
        //     jsonArray.push(rowObject);
        //     } 
        console.log('3');
            res.send({code:0,msg:'add to database successfully'})
       }
     })
     request.on('row',function(columns){})
        request.on('requestCompleted', function () {
          // Next SQL statement.
        });
        connection.execSql(request)
        request.on('end',()=>{
          connection.close()
        })
  }
  checkOrderHead =(SRNArr)=>{
    let sentence= ''
      for(let i =0;i<koganArr.length;i++){
        if(i===koganArr.length-1){
          sentence = sentence + `KoganID = '${koganArr[i].KoganID}'`
        }
        else{
          sentence = sentence + `KoganID = '${koganArr[i].KoganID}' or `
        }
      }
      // console.log('aaaaa',sentence);
      request = new Request(`select KoganID from KOrderHead where ${sentence}`,function(err,rowCounts,rows){
        if(err){console.log(err);}
        else{
         jsonArray=[]
         console.log('2');
         for(var i=0; i < rowCounts; i++)
             {
             var singleRowData = rows[i]; 
             var rowObject= {};
             for(var j =0; j < singleRowData.length; j++)
               {
                 var tempColName = singleRowData[j].metadata.colName;
                 var tempColData = singleRowData[j].value;
                 rowObject[tempColName] = tempColData;
               }
             jsonArray.push(rowObject);
             } 
             insertValue(SRNArr,jsonArray)
             
        }
      })
      request.on('row',function(columns){})
         request.on('requestCompleted', function () {
           // Next SQL statement.
         });
         connection.execSql(request)
  }
  request = new Request(`select SRN from KOrderHead where SRN > 501646`, function(err,rowCounts,rows) {  
    if (err) {  
        console.log(err);
      } 
    else {
      jsonArray=[]
      console.log('1');
      for(var i=0; i < rowCounts; i++)
          {
          var singleRowData = rows[i]; 
          var rowObject= {};
          for(var j =0; j < singleRowData.length; j++)
            {
              var tempColName = singleRowData[j].metadata.colName;
              var tempColData = singleRowData[j].value;
              rowObject[tempColName] = tempColData;
            }
          jsonArray.push(rowObject);
          } 
      checkOrderHead(jsonArray)
    }
  })
    request.on('row',function(columns){})
    request.on('requestCompleted', function () {
      // Next SQL statement.
    });
    connection.execSql(request)
})
/* generate purchase order. */
router.post('/order/:cashChecked', function (req, res) {
  const cart = req.body.cart;
  const formValue = req.body.form;
  const cashChecked = (req.params.cashChecked==='no'?'paypal':req.params.cashChecked);
  const {email,Fname,Lname,address,Oaddress,city,state,postcode,Pnumber,finalPrice,postage,selPickUp,exampleRadios,remarks} = req.body.form
  var d = new Date();
  function toISOLocal(d) {
    var z  = n =>  ('0' + n).slice(-2);
    var zz = n => ('00' + n).slice(-3);
    var off = d.getTimezoneOffset();
    // function Timezone() {
    //   var x = new Date();
    //   var currentTimeZoneOffsetInHours = x.getTimezoneOffset() / 60;
    //   return currentTimeZoneOffsetInHours
    // }
    // let AuDate = Timezone();
    var sign = off < 0? '+' : '-';
    off = Math.abs(off);
    if(req.get('host')==='localhost:4000'){
      return d.getFullYear() + '-'
           + z(d.getMonth()+1) + '-' +
           z(d.getDate()) + ' ' +
           z(d.getHours()) + ':'  + 
           z(d.getMinutes()) + ':' +
           z(d.getSeconds()) + '.' +
           zz(d.getMilliseconds())
    }
    else{
      let nextD = 0
      if(d.getHours()>=16){
        nextD = 1
      }
      return d.getFullYear() + '-'
      + z(d.getMonth()+1) + '-' +
      z(d.getDate()+nextD) + ' ' +
      z(d.getHours()+z(off/60|0)) + ':'  + 
      z(d.getMinutes()) + ':' +
      z(d.getSeconds()) + '.' +
      zz(d.getMilliseconds()) 
      // sign + z(off/60|0) + ':' + z(off%60); 
    }
  }
  // let orderDate = toISOLocal(d)
  var utc = moment().utc()
  console.log(utc,'aa');
  var orderDate = utc.clone().tz('Australia/Melbourne').format()
  // var orderDate = moment().tz('Australia/Melbourne').format(); 
  orderDate = orderDate.toString()
  orderDate = orderDate.slice(0,-6)
  console.log(orderDate);
  relatedToWebOrderBody = (SRNumber)=>{
    let tempSQLArr = []
    for(let i=0;i<cart.length;i++){
      let price = 0
      if(cart[i][`${cart[i].priceType}`]===0||cart[i].Stock<cart[i].estimateStock){
          price = cart[i].XinWebPrice
      }
      else{
          price = cart[i][`${cart[i].priceType}`]
      }
      tempSQLArr.push(`('${SRNumber}','${cart[i].CustomLabel}','${cart[i].WebTitle}','${price}','${cart[i].quantity}','${(price*cart[i].quantity).toFixed(2)}')`)
    }
    let finalSQLValue = tempSQLArr.toString()
      request = new Request(`INSERT into WebOrderBody ("SRN","CustomLabel","ItemTitle","Price","Quantity","ItemTotal") VALUES ${finalSQLValue}`, function(err) {  
        if (err) {  
            console.log(err);
          }
        else{
          res.send({code:0,msg:'ready to pay',SRNumber:SRNumber})
        }  
        });  
        request.on('row',function(columns){})
        request.on('requestCompleted', function () {
          // Next SQL statement.
        });
        connection.execSql(request)
        request.on('end',()=>{
          connection.close()
        })
  }
  // `update WebCustomer set shippingAddress1='${address}',shippingAddress2='${Oaddress}',shipToCity='${city}',shipToState='${state}',shipToPostCode='${postcode}',shipToFirstName='${Fname}',shipToLastName='${Lname}',ShipToContactNumber='${Pnumber}' where EmailAddress ='${email}'`
  insertValue = (jsonArray,IDArr)=>{
    let SRNArr= []
    jsonArray.map((item,index)=>{
      SRNArr.push(parseInt(item.SRN))
    })
    let SRNumber = Math.max(...SRNArr)+1
    console.log(SRNumber,'aaa');
    if(formValue.exampleRadios){
      request = new Request(`INSERT into WebOrderhead ("SRN","EmailAddress","FirstName","LastName","ContactNumber","OrderPrice","ShippingPrice","HandlingFee","FinalPaidPrice","Remarks","OrderDateTime","OrderStatus","CouponRn","SelfPickUp","SelfPickUpDetails","PaymentMethod","WebCustomerID")  VALUES ('${SRNumber}','${email}','${Fname}','${Lname}','${Pnumber}','${(finalPrice-postage).toFixed(2)}','0','0','${finalPrice}','${remarks}','${orderDate}','Unpaid','0','${selPickUp}','${exampleRadios}','${cashChecked}','${IDArr[0].WebCustomerID}')
      `, function(err,rowCounts,rows) {  
        if (err) {  
            console.log(err);
          } 
        else {
          relatedToWebOrderBody(SRNumber)
        }})
        request.on('row',function(columns){})
        request.on('requestCompleted', function () {
          // Next SQL statement.
        });
        connection.execSql(request)
    }
    else{
       var request = new Request(`INSERT into WebOrderhead ("SRN","EmailAddress","FirstName","LastName","PostToAddress1","PostToAddress2","PostToCity","PostToState","PostCode","ContactNumber","OrderPrice","ShippingPrice","HandlingFee","FinalPaidPrice","Remarks","OrderDateTime","OrderStatus","CouponRn","SelfPickUp","WebCustomerID") VALUES ('${SRNumber}','${email}','${Fname}','${Lname}','${address}','${Oaddress}','${city}','${state}','${postcode}','${Pnumber}','${(finalPrice-postage).toFixed(2)}','${postage}','0','${finalPrice}','${remarks}','${orderDate}','Unpaid','0','${selPickUp}','${IDArr[0].WebCustomerID}')`, function(err,rowCounts,rows) {  
        if (err) {  
            console.log(err);
          } 
        else {
          console.log('here');
          relatedToWebOrderBody(SRNumber)
        }
      })
        request.on('row',function(columns){})
        request.on('requestCompleted', function () {
          // Next SQL statement.
        });
        connection.execSql(request)
    }
  }
  findSRN = (IDArr)=>{
  var request = new Request(`select SRN from WebOrderhead where SRN > 900000`, function(err,rowCounts,rows) {  
    if (err) {  
        console.log(err);
      } 
    else {
      jsonArray=[]
      for(var i=0; i < rowCounts; i++)
          {
          var singleRowData = rows[i]; 
          var rowObject= {};
          for(var j =0; j < singleRowData.length; j++)
            {
              var tempColName = singleRowData[j].metadata.colName;
              var tempColData = singleRowData[j].value;
              rowObject[tempColName] = tempColData;
            }
          jsonArray.push(rowObject);
          } 
      insertValue(jsonArray,IDArr)
    }
  }) 
    request.on('row',function(columns){})
    request.on('requestCompleted', function () {
    // Next SQL statement.
    });
    connection.execSql(request)
  }
    request = new Request(`select WebCustomerID from WebCustomer where EmailAddress = '${email} '`,function(err,rowCounts,rows){
      if(err){
        console.log(err);
      }else{
        if(rows.length > 0 ){
          jsonArray=[]
          for(var i=0; i < rowCounts; i++)
              {
              var singleRowData = rows[i]; 
              var rowObject= {};
              for(var j =0; j < singleRowData.length; j++)
                {
                  var tempColName = singleRowData[j].metadata.colName;
                  var tempColData = singleRowData[j].value;
                  rowObject[tempColName] = tempColData;
                }
              jsonArray.push(rowObject);
              }
              findSRN(jsonArray)
              // console.log('a',typeof jsonArray[0].CustomerLevel);
        }
        else{
            res.send([])
        }
      }
  })  
      request.on('row',function(columns){})
      request.on('requestCompleted', function () {
        // Next SQL statement.
      });
      connection.execSql(request)
 });

router.post('/changeShipStatus',function(req,res){
    const idArr = req.body;
    let sentence = ''
    console.log(idArr,'aaaa');
    idArr.map((item,index)=>{
      console.log('index',index,idArr.length);
        if(index === idArr.length-1){
            sentence = sentence + `KoganID = '${item}'`
        }
        else{
            sentence = sentence + `KoganID = '${item}' or `
        }
    })
    var request = new Request(`update KOrderHead set OrderStatus='Shipped' where ${sentence}`,function(err){
      if(err){
        console.log(err);
        res.send({code:1,msg:'update failed'})
      }
      else{
        res.send({code:0,msg:'update successful'})
      }
    })
    request.on('row',function(columns){})
    request.on('requestCompleted', function () {
      // Next SQL statement.
    });
    connection.execSql(request)
    request.on('end',()=>{
      connection.close()
    })
})


//-----------------sendSuccEmailcode------------------
router.post('/sendSuccOrderEmail/:SRNumber', function(req,res){
  const userEmail = req.body.userEmail;
  const SRNumber = req.params.SRNumber;
  request = new Request(`select * from (WebOrderhead join WebOrderBody on WebOrderBody.SRN = WebOrderhead.SRN) where WebOrderBody.SRN = '${SRNumber}'`, 
  function(err,rowCounts,rows){
    if(err) console.log(err);
    else{
      jsonArray=[]
      for(var i=0; i < rowCounts; i++)
          {
          var singleRowData = rows[i]; 
          var rowObject= {};
          for(var j =0; j < singleRowData.length; j++)
            {
              var tempColName = singleRowData[j].metadata.colName;
              var tempColData = singleRowData[j].value;
              rowObject[tempColName] = tempColData;
            }
          jsonArray.push(rowObject);
          }
          sendOrderSuccToCustomer(jsonArray,userEmail)
    }
  })
    request.on('row',function(columns){})
    request.on('requestCompleted', function () {
    });
    connection.execSql(request)
    request.on('end',()=>{
      connection.close()
    })

    sendOrderSuccToCustomer =(jsonArray, userEmail)=>{
      const orderInfo = jsonArray[0];
      var d = new Date();
      var off = d.getTimezoneOffset();
      off = Math.abs(off);
      var z  = n =>  ('0' + n).slice(-2);
      let dd = z(off/60|0);
      AddressStr = '';
      if(orderInfo.PostToAddress1 !==null){
      AddressStr =
      `<td class="Email" width="70%"><strong>Post to Address:</strong>
      <div style="padding-left: 30px;">${orderInfo.PostToAddress1}<br /> ${orderInfo.PostToAddress2}<br /> ${orderInfo.PostToCity}, ${orderInfo.PostToState}, ${orderInfo.PostCode}</div>
      </td>
      <td class="Email" width="30%"><strong>Self Pick Up:</strong>
      <div style="padding-left: 30px;">${orderInfo.SelfPickUp}</div></td>`
      }else{
        AddressStr = 
        `<td class="Email" width="100%"><strong>Self Pick Up: ${orderInfo.SelfPickUp}</strong></td>`
      }
      ItemStr = '';
      for(let i = 0; i<jsonArray.length; i++){
        orderItems = jsonArray[i]
         ItemStr +=  `<tr>
          <td class="Email" style="text-align: center;">${orderItems.CustomLabel}</td>
          <td class="Email">${orderItems.ItemTitle}</td>
          <td class="Email" style="text-align: right;">${orderItems.Price}</td>
          <td class="Email" style="text-align: center;">${orderItems.Quantity}</td>
          </tr>`
      }
      var transporter = nodemailer.createTransport(smtpTransport({
        host: 'cpanel-003-syd.hostingww.com',
        port: 587,
        auth: {
            user: 'admin@xinsports.com.au',
            pass: 'Testtest001'
        }
     }));
        var mailOptions = {
          from: 'admin@xinsports.com.au',
          to: userEmail,
          subject: 'Order Confirmation',
          html:`<html>
          <head>
          <style type="text/css">
          TABLE.Email {
          width: 640px;
          padding: 5px;
          margin: 0px;
          border: 1px solid #5872CB;
          }
          TABLE.Email TH {
          font-weight: bold;
          font-size: 12px;
          color: #ffffff;
          font-family: Arial, Verdana, Sans-Serif;
          font-style: strong;
          background-color: #5499c7;
          text-align: center;
          text-decoration: none;
          padding: 5px;
          }
          TABLE.Email TD {
          font-weight: normal;
          font-size: 12px;
          color: #000000;
          font-family: Arial, Verdana, Sans-Serif;
          background-color: #ffffff;
          text-align: left;
          text-decoration: none;
          padding: 3px;
          }
          </style>
          </head>
          <body>
          <table class="Email">
          <tbody>
          <tr>
          <td class="Email" colspan="2">
          <p><strong>Thank you for your order ${orderInfo.SRN} </strong><strong>!</strong></p>
          <p>If you would like to check the status of your order, please visit your personal My Orders page.</p>
          <p>Thank you for shopping with us.<br />xinsports.com.au</p>
          </td>
          </tr>
          </tbody>
          </table>
          <table class="Email">
          <tbody>
          <tr>
          <th class="Email">Order Summary</th>
          </tr>
          </tbody>
          </table>
          <table class="Email">
          <tbody>
          <tr>
          <td class="Email">
          <div align="right"><strong>Email Address:</strong></div>
          </td>
          <td class="Email">${orderInfo.EmailAddress}</td>
          </tr>
          <tr>
          <td class="Email" width="140">
          <div align="right"><strong>Order Number:</strong></div>
          </td>
          <td class="Email" width="500">
          <p>${orderInfo.SRN}</p>
          </td>
          </tr>
          <tr>
          <td class="Email">
          <div align="right"><strong>Ordered on:</strong></div>
          </td>
          <td class="Email">${orderInfo.OrderDateTime.toISOString()}</td>
          </tr>
          <tr>
          <td class="Email">
          <div align="right"><strong>Ordered by:</strong></div>
          </td>
          <td class="Email">${orderInfo.FirstName} ${orderInfo.LastName}</td>
          </tr>
          <tr>
          <td>
          <div align="right"><strong>Contact number:</strong></div>
          </td>
          <td>${orderInfo.ContactNumber}</td>
          </tr>
          <tr>
          <td class="Email">
          <div align="right"><strong>Order Status:</strong></div>
          </td>
          <td class="Email">${orderInfo.OrderStatus}</td>
          </tr>
          </tbody>
          </table>
          <table class="Email">
          <tbody>
          <tr valign="top">
            ${AddressStr}
          </tr>
          </tbody>
          </table>
          <table class="Email">
          <tbody>
          <tr>
          <th class="Email">Order Items</th>
          </tr>
          </tbody>
          </table>
          <table class="Email">
          <tbody>
          <tr>
          <td style="background: #cccccc; color: #00000; text-align: center;"><strong>Custom Label</strong></td>
          <td style="background: #cccccc; color: #00000; text-align: center;"><strong>Item</strong></td>
          <td style="background: #cccccc; color: #00000; text-align: center;"><strong>Price</strong></td>
          <td style="background: #cccccc; color: #00000; text-align: center;"><strong>Quantity</strong></td>
          </tr>
          ${ItemStr}
          </tbody>
          </table>
          <table class="Email">
          <tbody>
          <tr>
          <th class="Email">Order Totals</th>
          </tr>
          </tbody>
          </table>
          <table class="Email">
          <tbody>
          <tr>
          <td style="background: #cccccc; color: #00000; text-align: right;" width="50%"><strong>Item total price:</strong></td>
          <td class="Email" style="text-align: right;" width="50%">AU$ ${orderInfo.OrderPrice}</td>
          </tr>
          <tr>
          <td style="background: #cccccc; color: #00000; text-align: right;" width="50%"><strong>Postage:</strong></td>
          <td class="Email" style="text-align: right;" width="50%">AU$ ${orderInfo.ShippingPrice}</td>
          </tr>
          <tr>
          <td style="background: #cccccc; color: #00000; text-align: right;" width="50%"><strong>Total:</strong></td>
          <td class="Email" style="text-align: right;" width="50%">AU$ ${orderInfo.FinalPaidPrice}</td>
          </tr>
          </tbody>
          </table>
          <p>&nbsp;</p>
          </body>
          </html>`
        };
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
                res.send({code:1, msg:'Failed to send email'})
            } else {
                console.log('Email sent: ' + info.response);
                res.send({code:0,msg:'Sent email successfully'})
            }
        });
    }
})
//-----------------sendSuccEmailend-------------------
  }
}); 

module.exports = router;
