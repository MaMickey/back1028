var express = require('express');
var router = express.Router();
var Request = require('tedious').Request; 
var Connection = require('tedious').Connection; 
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var config = require('../config')
var md5 = require('md5')
var connection = new Connection(config);  
    connection.on('connect', function(err) {  
        // If no error, then good to proceed.
    if(err){console.log(err);}
    else{

      // `INSERT into WebCustomer ("EmailAddress","FirstName","LastName","UserPassword","PostToAddress1","PostToAddress2","PostToCity","PostToState","PostCode","ContactNumber","CustomerLevel","CustomerTotalAmount") VALUES('${email}','${Fname}','${Lname}','${password}','${address}','${Oaddress?Oaddress:''}','${city}','${state}','${postcode}','${Pnumber}','0','0')`


router.post('/register', function (req, res) {
  const {Fname,Lname, email, Pnumber, address, Oaddress, city, state, postcode, country,password,Repassword} = req.body;
  var jsonArray = [];
  const callRegister = (value)=>{
    // let addressid = parseInt(id)+1
    let IntlargestCustomerID = parseInt(value.substring(1))
    let newlargestCustomerID = 'X' + String(IntlargestCustomerID + 1)
    request = new Request(`INSERT into WebCustomerAddress ("Email","AddressType","FirstName","LastName","Address1","Address2","City","State","Postcode","ContactNumber","WebCustomerID") VALUES('${email}','R','${Fname}','${Lname}','${address}','${Oaddress?Oaddress:''}','${city}','${state}','${postcode}','${Pnumber}','${newlargestCustomerID}')  
    INSERT into WebCustomer ("EmailAddress","FirstName","LastName","UserPassword","CustomerLevel","CustomerTotalAmount","WebCustomerID") VALUES('${email}','${Fname}','${Lname}','${password}','0','0', '${newlargestCustomerID}')
    `, function(err) {  
      if (err) {  
          console.log(err);
        }
      else{
        res.send({code:0,userInfo:[req.body]})
      }  
      });  
      request.on('row', function(columns) { 
      });  
      request.on('requestCompleted', function () {
        // Next SQL statement.
      });
      connection.execSql(request);  
      request.on('end',()=>{
        connection.close()
      })
  }

  // INSERT into WebCustomerAddress ("Email","AddressType","FirstName","LastName","Address1","Address2","City","State","Postcode","ContactNumber") VALUES('${email}','R','${Fname}','${Lname}','${address}','${Oaddress?Oaddress:''}','${city}','${state}','${postcode}','${Pnumber}')  
  // INSERT into WebCustomer ("EmailAddress","FirstName","LastName","UserPassword","CustomerLevel","CustomerTotalAmount") VALUES('${email}','${Fname}','${Lname}','${password}','0','0')

  const updateVIPuser = (vipUser)=>{
    const {EmailAddress} = vipUser[0]
    request = new Request(`update WebCustomer set FirstName='${Fname}',LastName='${Lname}',UserPassword='${password}' where EmailAddress = '${EmailAddress}'
    update WebCustomerAddress set FirstName = '${Fname}',LastName='${Lname}',Address1='${address}',Address2='${Oaddress?Oaddress:''}',City='${city}',State='${state}',Postcode='${postcode}',ContactNumber='${Pnumber}' where WebCustomerID = '${vipUser[0].WebCustomerID}'
    `, function(err) {  
      if (err) {  
          console.log(err);
        }
      else{
        res.send({code:0,userInfo:[req.body]})
      }  
      });  
      request.on('row', function(columns) { 
      });  
      request.on('requestCompleted', function () {
        // Next SQL statement.
      });
      connection.execSql(request);  
      request.on('end',()=>{
        connection.close()
      })
  }

  //start here to find the largest customerid
  const findLargestCustomerID = ()=>{
    request = new Request(`
    select * from WebCustomer where WebCustomerID = (select max(WebCustomerID) from WebCustomer)
    `, function(err,rowCounts,rows) {  
      if (err) {  
          console.log(err);
        }
      else{
        // res.send({code:0,userInfo:[req.body]})
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
        let largestCustomerID = jsonArray[0].WebCustomerID
        callRegister(largestCustomerID)
      }  
      });  
      request.on('row', function(columns) { 
      });  
      request.on('requestCompleted', function () {
        // Next SQL statement.
      });
      connection.execSql(request);  
  }
  //end here finish the finding

  request = new Request(`select * from WebCustomer where EmailAddress = '${email}'`, function(err,rowCounts,rows) {  
  if (err) {  
      console.log(err);
    }
  if(rowCounts === 0 ){
      findLargestCustomerID()
  } 
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
        if(jsonArray[0].UserPassword==='0a113ef6b61820daa5611c870ed8d5ee'){
            updateVIPuser(jsonArray)
        }else{
            res.send({code:1,msg:'email address already be registed'})
        }
  }
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
  //This line will print the array of JSON object.
  // res.send(jsonArray);  
  
  
})
request.on('row',function(columns){})
request.on('requestCompleted', function () {
  // Next SQL statement.
});
connection.execSql(request)
} 
); 

router.post('/login',function(req,res){
  const {email,password} = req.body
  request = new Request(`select * from WebCustomer where EmailAddress = '${email}' and UserPassword= '${password}'`, function(err,rowCounts,rows) {  
  if (err) {  
      console.log(err);
    }
  if(rowCounts === 0 ){
      res.send({code:1,msg:'password or username wrong'})
  } 
  else{
    var jsonArray = [];
    for(var i=0; i < rowCounts; i++)
      {
      var singleRowData = rows[i]; 
      // var colName = ['RN','Email','Fname','Lname','password','address','OAddress','city','state','postcode','Pnumber','CustomerLevel','CustomerTotalAmount']
      var colName = ['RN','Email','Fname','Lname','password','CustomerLevel','CustomerTotalAmount']
      var rowObject= {};
      for(var j =0; j < singleRowData.length; j++)
        {
          // var tempColName = singleRowData[j].metadata.colName;
          var tempColName = colName[j]
          var tempColData = singleRowData[j].value;
          // console.log('test',singleRowData[j].metadata.colName,singleRowData[j].value);
          rowObject[tempColName] = tempColData;
        }
      jsonArray.push(rowObject);
      } 
    res.send({code:0,userInfo:jsonArray})
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


router.post('/resetForgetPwd',function(req,res){
    let email = req.body.email
    let emailCode = req.body.emailCode;
    let md5key = md5(emailCode)
    request = new Request(`update WebCustomer set UserPassword = '${md5key}' where EmailAddress = '${email}'
    `,function(err,rowCounts,rows){
        if(err){
          console.log(err);
        }
        else{
          res.send({code:0,msg:'change password successfully'})
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

//start from here is my coede
router.post('/forgetpwd', function(req,res){
  const theEmail = req.body.theEmail;
  console.log(`select * from WebCustomer where EmailAddress = '${theEmail}'`);
  request = new Request(`select * from WebCustomer where EmailAddress = '${theEmail}'`, function(err,rowCounts,rows) {  
    if (err) {  
        console.log(err);
      }
    if(rowCounts === 0 ){
        res.send({code:1,msg:'Email does not exist'})
    }else{
        var transporter = nodemailer.createTransport(smtpTransport({
        host: 'cpanel-003-syd.hostingww.com',
        port: 587,
        auth: {
            user: 'admin@xinsports.com.au',
            pass: 'Testtest001'
        }
    }));
    
        let randomString = function() {
          chars = '23456789abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ'
          var result = '';
          for (var i = 7; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];
          return result;
          }
        let key = randomString()
        var mailOptions = {
          from: 'admin@xinsports.com.au',
          to: theEmail,
          subject: 'Reset Password',
          html:
          `<table class="Email">
          <tbody>
          <tr>
          <td class="Email">
          <p>Hello,</p>
          <p>We received a request to reset the password associated with this email address. If you made this request, please follow the instructions below.</p>
          <p>If you did not request to have your password reset, you can safely ignore this email. We assure you that your customer account is safe.</p>
          <p><strong>Please enter this verification code on our website to continue.</strong></p>
          <h3 style="background: #5499c7; color: #fff; width: 100%; line-height: 30px; height: 30px; text-align: center; border-style: soild; border-width: 2px; border-radius: 4px;">${key}</h3>
          <p>Once you have entered the verification code, we will give you instructions for resetting your password.</p>
          <p><strong>Thank you for visiting Xinsports!</strong><br /> <strong>xinsports.com.au</strong></p>
          <p>&nbsp;</p>
          </td>
          </tr>
          </tbody>
          </table>`
        };
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                //alert('error')
                console.log(error);
                res.send({code:2, msg:'Failed to send email'})
            } else {
                console.log('Email sent: ' + info.response);
                res.send({code:0,'key':key,msg:'Sent email successfully'})
            }
        });
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
router.post('/setNewEmail',function(req,res){
  const oldEmail = req.body.oldEmail;
  const loginEmail = req.body.loginEmail;
  updateEmail = (oldEmail)=>{
      request = new Request(`update WebCustomer set EmailAddress = '${oldEmail}' where EmailAddress = '${loginEmail}'`,function(err,rowCounts,rows){
        if(err){console.log(err);
          res.send({code:1,msg:'update fail'})
        }
        else{
          res.send({code:0,msg:'update successfully'})
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
    request = new Request(`select * from  WebCustomer where EmailAddress = '${oldEmail}'`,function(err,rowCounts,rows){
      if(err){console.log(err)
      }
      if(rowCounts===1){
        res.send({code:1,msg:'email already registed'})
      }
      else{
        updateEmail(oldEmail)
      }
      })
      request.on('row',function(columns){})
      request.on('requestCompleted', function () {
      // Next SQL statement.
      });
      connection.execSql(request)
})

//------------change email function start from here is my coede-------------
router.post('/changeEmail', function(req,res){
  const oldEmail = req.body.oldEmail;
  request = new Request(`select * from WebCustomer where EmailAddress = '${oldEmail}'`, function(err,rowCounts,rows) {  
    if (err) {  
        console.log(err);
      }
    if(rowCounts !== 0){
      res.send({code:2,msg:"this email already exist, please change another email"})
    }
    else{
        var transporter = nodemailer.createTransport(smtpTransport({
        host: 'cpanel-003-syd.hostingww.com',
        port: 587,
        auth: {
            user: 'admin@xinsports.com.au',
            pass: 'Testtest001'
        }
    }));
        let randomString = function() {
          chars = '23456789abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ'
          var result = '';
          for (var i = 7; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];
          return result;
          }
        let key = randomString()
        var mailOptions = {
          from: 'admin@xinsports.com.au',
          to: oldEmail,
          subject: 'Change Account Email',
          // 
          html:
          `<table class="Email">
          <tbody>
          <tr>
          <td class="Email">
          <p>Hello,</p>
          <p>We received a request to change your Xinsports' account email to this new email address. If you made this request, please follow the instructions below.</p>
          <p>If you did not request to change your account email, you can safely ignore this email. We assure you that your customer account is safe.</p>
          <p><strong>Please enter this verification code on our website to continue.</strong></p>
          <h3 style="background: #5499c7; color: #fff; width: 100%; line-height: 30px; height: 30px; text-align: center; border-style: soild; border-width: 2px; border-radius: 4px;">${key}</h3>
          <p>Once you have entered the verification code, you can confirm your change to this new email.</p>
          <p>We kindly remind you that all your account information and order history will be transfered to your new account email. You can login with your new email address and old password after completing the change.</p>
          <p><strong>Thank you for visiting Xinsports!</strong><br /> <strong>xinsports.com.au</strong></p>
          <p>&nbsp;</p>
          </td>
          </tr>
          </tbody>
          </table>`
        };
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                //alert('error')
                console.log(error);
                res.send({code:1, msg:'Failed to send email'})
            } else {
                console.log('Email sent: ' + info.response);
                res.send({code:0,'key':key,msg:'Sent email successfully'})
            }
        });
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
//-------change email function end here is my code--------------



router.post('/changePassword',function(req,res){
  const {email,newpwd,oldpwd} = req.body;
  console.log(req.body,'a');
  changePwd = ()=>{
    request = new Request(`update WebCustomer set UserPassword = '${newpwd}' where EmailAddress = '${email}'
    `,function(err,rowCounts,rows){
        if(err){
          console.log(err);
        }
        else{
          res.send({code:0,msg:''})
          // console.log('aa',rows);
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
  request = new Request(`select UserPassword from WebCustomer where EmailAddress = '${email}'
  `,function(err,rowCounts,rows){
      if(err){
        console.log(err);
      }
      else{
        if(rows[0][0].value === oldpwd){
            changePwd()
        }
        else{
          res.send({code:1,msg:`Current password doesn't correct!`})
        }
        // console.log('aa',rows);
      }
      
  })
  request.on('row',function(columns){})
    request.on('requestCompleted', function () {
      // Next SQL statement.
    });
      connection.execSql(request)
})
router.get('/getWebCustomerAddress/:email',function(req,res){
  const email = req.params.email;
  console.log(email,'test');
  getAddress = (IDArr)=>{
      request = new Request(`select * from WebCustomerAddress where WebCustomerID = '${IDArr[0].WebCustomerID}'`,function(err,rowCounts,rows){
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
                  res.send(jsonArray)
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
                getAddress(jsonArray)
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

router.get('/getUserAddress/:email',function(req,res){
  const email = req.params.email;
  getAddress = (customerIDArr)=>{
    console.log(customerIDArr);
      request = new Request(`select * from WebCustomerAddress where WebCustomerID = '${customerIDArr[0].WebCustomerID}' order by RN`,function(err,rowCounts,rows){
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
                res.send(jsonArray)
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
                getAddress(jsonArray)
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

router.get('/getWebCustomerEditAddress/:RN',function(req,res){
  const RN = req.params.RN;
  request = new Request(`select * from WebCustomerAddress where RN = '${RN}'`,function(err,rowCounts,rows){
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
             res.send(jsonArray)
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
    request.on('end',()=>{
      connection.close()
    })
})

router.put('/editAddress/:RN',function(req,res){
   const formValue = req.body;
   const {Fname,Lname,Pnumber,address,Oaddress,postcode,state,city} = formValue;
   const RN = req.params.RN;
   console.log(formValue,'a');
   console.log(RN,'RN');
   let request = new Request(`update WebCustomerAddress set FirstName ='${Fname}',LastName ='${Lname}',Address1='${address}',Address2='${Oaddress}',City='${city}',Postcode='${postcode}',State='${state}',ContactNumber='${Pnumber}' where RN = ${RN}`,function(err,rowCounts,rows){
        if(err){console.log(err);}
        else{
          res.send({code:0,msg:'update successfully'})
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

router.post('/addPostAddress/:email',function(req,res){
  const formValue = req.body;
  const email = req.params.email;
  const {Fname,Lname,Pnumber,address,Oaddress,postcode,state,city} = formValue;
  console.log(formValue,'aaa');
  addAddress = (IDArr)=>{
    request = new Request(`INSERT into WebCustomerAddress ("Email","AddressType","FirstName","LastName","Address1","Address2","City","State","Postcode","ContactNumber","WebCustomerID") values ('${email}','P','${Fname}','${Lname}','${address}','${Oaddress}','${city}','${state}','${postcode}','${Pnumber}','${IDArr[0].WebCustomerID}')`,function(err,rowCounts,rows){
    if(err){
      console.log(err);
    }else{
        res.send([])
            // console.log('a',typeof jsonArray[0].CustomerLevel);
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
              addAddress(jsonArray)
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

router.delete('/delUserAddress/:RN',function(req,res){
    const RN = req.params.RN;
    var request = new Request(`delete from WebCustomerAddress where RN = '${RN}'`,function(err){
      if(err){
        console.log(err);
      }
      else{
        res.send({code:0,msg:'delete successfull'})
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



//------------------vip progreess start-------------------
router.get('/getVIPdata/:email',function(req,res){
  const email = req.params.email;
  getVipData = (customerIDArr)=>{
      var y = new Date().getFullYear()
      request = new Request(`select OrderPrice from WebOrderHead where WebCustomerID = '${customerIDArr[0].WebCustomerID}' and OrderStatus != 'Unpaid' and ${y} = (select YEAR(OrderDateTime) as Year) order by RN`,function(err,rowCounts,rows){
        if(err){
          console.log(err);
        }else{
          if(rows.length > 0 ){
            jsonArray=[]
            let vipConsumption = 0
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
                vipConsumption += rowObject.OrderPrice
                }
                jsonArray.push({"vipConsumption": vipConsumption, "customerLevel":customerIDArr[0].customerLevel})
                res.send(jsonArray)
          }
          else{
              res.send([{"vipConsumption": 0, "customerLevel":customerIDArr[0].customerLevel}])
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
      }
      request = new Request(`select WebCustomerID, customerLevel from WebCustomer where EmailAddress = '${email} '`,function(err,rowCounts,rows){
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
                getVipData(jsonArray)
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
//------------------vip progreess end---------------------

    }
}); 

module.exports = router;




