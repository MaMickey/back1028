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

router.get('/UserLevel/:email',function(req,res){
  const email = req.params.email;
  request = new Request(`select CustomerLevel from WebCustomer where EmailAddress = '${email}'`,function(err,rowCounts,rows){
     if(err){console.log(err);}
     else{
       if(rowCounts >0){
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
       else{
         res.send([])
       }
      
    }
  })
  request.on('row',function(columns){})
  request.on('requestCompleted', function () {
    // Next SQL statement.
  });
  request.on('end',()=>{
    connection.close()
  })
  connection.execSql(request)
})
router.post('/setThreshold/',function(req,res){
  const stockThreshold = req.body.inputValue;
  console.log(stockThreshold,'a');
  request = new Request(`update StockExtension set StockThreshold='${stockThreshold}' where WebOn = 'Y'`,function(err,rowCounts,rows){
     if(err){console.log(err);}
     else{
       res.send({code:0,msg:'set threshold successfully'})
    }
  })
  request.on('row',function(columns){})
  request.on('requestCompleted', function () {
    // Next SQL statement
  });
  request.on('end',()=>{
    connection.close()
  })
  connection.execSql(request)
})
router.post('/webOn', function(req, res) {
  const data = req.body;
  var sentence = '  ';
  var sentence2 = '  ';
  data.map((item,index)=>{
      let detailArr = []
      detailArr.push(item.description)
      let tempDetail = detailArr[0].replace(/""/g,"\"")
      let temp = tempDetail.split('\'').join('\'\'')
      console.log('temp',temp);
      sentence = sentence + `update StockExtension set XinWebPrice = '${item.price}', WebTitle='${item.dealtitle}',CATSub='${item.categoryid}', WebDetails='${temp}',WebOn='Y',ImageURL1='${item.imageurl_1}',ImageURL2='${item.imageurl_2}',ImageURL3='${item.imageurl_3}',ImageURL4='${item.imageurl_4}',ImageURL5='${item.imageurl_5}',ImageURL6='${item.imageurl_6}',ImageURL7='${item.imageurl_7}',ImageURL8='${item.imageurl_8}' where CustomLabel = '${item.sku}' `
     sentence2 = sentence2 + `update stock set RetailPrice = '${item.rrp}' where Code = '${item.sku}'`
     return sentence,sentence2
  })
  console.log('a',sentence);
  console.log('a',sentence2);
  updateExtension = ()=>{ 
    request = new Request(`${sentence}`
    , function(err,rowCounts,rows) {  
      if (err) {  
          console.log(err);
        res.send({code:1,msg:'upload mydeal csv file failed'})
         
        } 
      else {
          // console.log('row',rows);
        res.send({code:0,msg:'upload mydeal csv file successfully'})
      }
    })
    request.on('row',function(columns){})
    request.on('requestCompleted', function () {
      // Next SQL statement.
    });
    connection.execSql(request)
  }
    request = new Request(`${sentence2}`, function(err,rowCounts,rows) {  
      if (err) {  
          console.log(err);
          res.send({code:1,msg:'webOn failed'})
        } 
      else {
          console.log('rowhere');
          updateExtension()
      }
    })
    request.on('row',function(columns){})
    request.on('requestCompleted', function () {
      // Next SQL statement.
    });
    connection.execSql(request)
   
});


router.post('/putaway', function(req, res) {
    const data = req.body;
    console.log('data');
    console.log('data',data.length);
    var sentence = '  ';
    var sentence2 = '  ';
    data.map((item,index)=>{
        console.log('eee');
        let detailArr = []
        detailArr.push(item.OtherDetails)
        let temp = detailArr[0].replace(/""/g,"\"")
        sentence = sentence + `update StockExtension set WebTitle='${item.WebTitle}', WebDetails='${temp}',WebOn='Y' where CustomLabel = '${item.CustomLabel}' `
       sentence2 = sentence2 + `update stock set VIPPrice5 = '${item.VIPPrice5}',Department='${item.Department}', SubDepartment='${item.SubDepartment}' where Code = '${item.CustomLabel}'`
       return sentence,sentence2
    })
    // console.log('a',sentence);
    // console.log('a',sentence2);
    
    updateExtension = ()=>{
      request = new Request(`${sentence}`
      , function(err,rowCounts,rows) {  
        if (err) {  
            console.log(err);
          res.send({code:1,msg:'putaway failed'})

          } 
        else {
            // console.log('row',rows);
            res.send({code:0,msg:'putaway succ'})
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
   
    request = new Request(`${sentence2}`, function(err,rowCounts,rows) {  
      if (err) {  
          console.log(err);
          res.send({code:1,msg:'putaway failed'})
        } 
      else {
          // console.log('row',rows);
          updateExtension()
      }
    })
    request.on('row',function(columns){})
    request.on('requestCompleted', function () {
      // Next SQL statement.
    });
    connection.execSql(request)
});

router.get('/fillCatPrimary',function(req,res){
  request = new Request(`select CustomLabel, CATPrimary, CATSub into #temp1
  from StockExtension where webon = 'Y'
  
  update #temp1 set CATPrimary = ''
  
  update #temp1 
  set #temp1.CATPrimary = CAT3withFather.CATFatherRN
  from CAT3withFather
  where #temp1.CATSub = CAT3withFather.RN
  
  update StockExtension 
  set stockextension.CATPrimary = #temp1.CATPrimary
  from #temp1
  where StockExtension.CustomLabel = #temp1.CustomLabel
  
  drop table #temp1
 `,function(err,rowCounts,rows){
    if (err) {  
      console.log(err);
      res.send({code:1,msg:'fill category primary failed'})
    
    } 
   else {
     res.send({code:0,msg:'fill category primary successfully'})
}
  })
  request.on('row',function(columns){})
  request.on('requestCompleted', function () {
    // Next SQL statement.
  });
  request.on('end',()=>{
    connection.close()
  })
  connection.execSql(request)
})
    }
});
module.exports = router;