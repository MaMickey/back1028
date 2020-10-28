var express = require('express');
var router = express.Router();
var Request = require('tedious').Request; 
var Connection = require('tedious').Connection;  
var config = require('../config')
var connection = new Connection(config);  
    connection.on('connect', function(err) {  
        // If no error, then good to proceed.
    if(err){console.log(err);}
    else{

    router.get('/change/:postcode',function(req,res){
      const postcode = req.params.postcode;
      let jsonArray = []
      var rowArr = [];
      var rowObject= {};
      request = new Request(`select SubName from HBAllCouriers where PostCode = '${postcode}'`,function(err,rowCounts,rows){
          if(err){
            console.log(err);
          }
          if(rows.length === 0 ){
            res.send({code:1,msg:'postcode does not exist'})
          }
          else{
            for(var i=0; i < rowCounts; i++)
            {
            var singleRowData = rows[i]; 
            for(var j =0; j < singleRowData.length; j++)
              {
                var tempColName = singleRowData[j].metadata.colName;
                var tempColData = singleRowData[j].value;
                rowArr.push(tempColData);
              }
              rowObject[tempColName] = rowArr
            
            } 
            res.send(rowObject);
          }})
          request.on('row',function(columns){})
          request.on('requestCompleted', function () {
            // Next SQL statement.
          });
          connection.execSql(request)
          request.on('end',()=>{
            connection.close()
          })
    })

    router.get('/postcodeByRN/:RN',function(req,res){
      console.log('e',req.params.RN);
      const RN = req.params.RN;
      let jsonArray = []
      var rowArr = [];
      var rowObject= {};
      getPostcode =(postcode)=>{
     
        request = new Request(`select SubName from HBAllCouriers where PostCode = '${postcode}'`,function(err,rowCounts,rows){
            if(err){
              console.log(err);
            }
            if(rows.length === 0 ){
              res.send({code:1,msg:'postcode does not exist'})
            }
            else{
              for(var i=0; i < rowCounts; i++)
              {
              var singleRowData = rows[i]; 
              for(var j =0; j < singleRowData.length; j++)
                {
                  var tempColName = singleRowData[j].metadata.colName;
                  var tempColData = singleRowData[j].value;
                  rowArr.push(tempColData);
                }
                rowObject[tempColName] = rowArr
              
              } 
              res.send(rowObject);
            }})
            request.on('row',function(columns){})
            request.on('requestCompleted', function () {
              // Next SQL statement.
            });
            connection.execSql(request)
            request.on('end',()=>{
              connection.close()
            })
            
          }
    
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
                  getPostcode(jsonArray[0].Postcode)
                  // console.log('a',typeof jsonArray[0].CustomerLevel);
            }
            else{
            res.send({code:1,msg:'postcode does not exist'})
            }
          }
        })
      request.on('row',function(columns){})
        request.on('requestCompleted', function () {
          // Next SQL statement.
        });
          connection.execSql(request)
    })


router.get('/postcode/:email',function(req,res){
  console.log('e',req.params.email);
  const email = req.params.email;
  let jsonArray = []
  var rowArr = [];
  var rowObject= {};
  getPostcode =(postcode)=>{
 
    request = new Request(`select SubName from HBAllCouriers where PostCode = '${postcode}'`,function(err,rowCounts,rows){
        if(err){
          console.log(err);
        }
        if(rows.length === 0 ){
          res.send({code:1,msg:'postcode does not exist'})
        }
        else{
          for(var i=0; i < rowCounts; i++)
          {
          var singleRowData = rows[i]; 
          for(var j =0; j < singleRowData.length; j++)
            {
              var tempColName = singleRowData[j].metadata.colName;
              var tempColData = singleRowData[j].value;
              rowArr.push(tempColData);
            }
            rowObject[tempColName] = rowArr
          
          } 
          res.send(rowObject);
        }})
        request.on('row',function(columns){})
        request.on('requestCompleted', function () {
          // Next SQL statement.
        });
        connection.execSql(request)
        request.on('end',()=>{
          connection.close()
        })
      }

  request = new Request(`select * from WebCustomer where EmailAddress = '${email}'`,function(err,rowCounts,rows){
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
              getPostcode(jsonArray[0].shipToPostCode)
              // console.log('a',typeof jsonArray[0].CustomerLevel);
        }
        else{
        res.send({code:1,msg:'postcode does not exist'})
        }
      }
    })
  request.on('row',function(columns){})
    request.on('requestCompleted', function () {
      // Next SQL statement.
    });
      connection.execSql(request)
})
// router.post('/login',function(req,res){
//   const email = req.body.email
//   const password = req.body.password
//   req.sql(`select * from WebCustomer where EmailAddress = '${email}' and UserPassword= '${password}' for json path`) 
//   .fail(function(ex, res) { 
//     res.statusCode = 500;   
//     res.write(ex.message);
//     res.end();
// }).into(res)
// })


    }
}); 
module.exports = router;




