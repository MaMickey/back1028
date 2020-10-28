var express = require('express');
var router = express.Router();
var Request = require('tedious').Request; 
var Connection = require('tedious').Connection;  
var config = require('../config');
var connection = new Connection(config);  

    connection.on('connect', function(err) {  
        // If no error, then good to proceed.
    if(err){console.log(err);}
    else{
      router.post('/productImages/',function(req,res){
        const label = req.body;
        let searchLabel = ''
        if(label.length>1){
          label.map((item,index)=>{
            if(index === label.length-1){
            searchLabel = searchLabel + `'${item}'`
            }
            else{
              searchLabel = searchLabel + `'${item}'`+' or CustomLabel ='
            }
          })
        }
        else{
          label.map((item,index)=>{
            searchLabel = `'${item}'`
          })
        }
        request = new Request(`select BLOBData,CustomLabel from images where CustomLabel = ${searchLabel}
           `, function(err,rowCounts,rows) {  
        if (err) {  
            console.log(err);
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
            jsonArray.map((item,index)=>{
              let base64String = Buffer.from(item.BLOBData).toString('base64')
              item.BLOBData = `data:image/jpeg;base64,${base64String}`
                      })
        //This line will print the array of JSON object.
            res.send(jsonArray); 
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
router.post('/cartimages/',function(req,res){
    const label = req.body.data;
    let tempArr= ['zzz111111']
    let searchLabel = ''
    if(label.length>1){
      label.map((item,index)=>{
        if(index === label.length-1){
        searchLabel = searchLabel + `'${item}'`
        }
        else{
          searchLabel = searchLabel + `'${item}'`+' or CustomLabel ='
        }
      })
    }
    if(label.length===1){
      label.map((item,index)=>{
        searchLabel = `'${item}'`
      })
    }
    if(label.length===0){
      searchLabel = `'${tempArr[0]}'`
    }
    // console.log('label:',searchLabel);
    request = new Request(`select BLOBData,CustomLabel from images where CustomLabel = ${searchLabel}
       `, function(err,rowCounts,rows) {  
    if (err) {  
        console.log(err);
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
    //This line will print the array of JSON object.
        res.send(jsonArray); 
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
  router.post('/checkoutCartimages/',function(req,res){
    const label = req.body.data;
    let searchLabel = ''
    if(label.length>1){
      label.map((item,index)=>{
        if(index === label.length-1){
        searchLabel = searchLabel + `'${item.cart}'`
        }
        else{
          searchLabel = searchLabel + `'${item.cart}'`+' or CustomLabel ='
        }
      })
    }
    else{
      label.map((item,index)=>{
        searchLabel = `'${item.cart}'`
      })
    }
    // console.log('label:',searchLabel);
    request = new Request(`select BLOBData,CustomLabel from images where CustomLabel = ${searchLabel}
       `, function(err,rowCounts,rows) {  
    if (err) {  
        console.log(err);
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
    //This line will print the array of JSON object.
        res.send(jsonArray); 
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
  router.post('/wishimages/',function(req,res){
    const label = req.body.data;
    let tempArr= ['zzz111111']
    let searchLabel = ''
    if(label.length>1){
      label.map((item,index)=>{
        if(index === label.length-1){
        searchLabel = searchLabel + `'${item.wish}'`
        }
        else{
          searchLabel = searchLabel + `'${item.wish}'`+' or CustomLabel ='
        }
      })
    }
    if(label.length===1){
      label.map((item,index)=>{
        searchLabel = `'${item.wish}'`
      })
    }
    if(label.length===0){
      searchLabel = `'${tempArr[0]}'`
    }
    request = new Request(`select BLOBData,CustomLabel from images where CustomLabel = ${searchLabel}
       `, function(err,rowCounts,rows) {  
    if (err) {  
        console.log(err);
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
    //This line will print the array of JSON object.
        res.send(jsonArray); 
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
    }
});
module.exports = router;
