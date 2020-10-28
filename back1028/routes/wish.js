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

/* GET home page. */
router.post('/getwish/', function(req, res) {
    const data = req.body.data;
    const email = req.body.email;
    let label = ''
    for(let q =0;q<data.length;q++){
        if(data.length===1){
            label = label + `StockExtension.CustomLabel = '${data[q].wish}' `
        }
        else{
            if(q===data.length-1){
                label = label + `StockExtension.CustomLabel = '${data[q].wish}' `
            }
            else{
                label = label + `StockExtension.CustomLabel = '${data[q].wish}' or `
            }
        }  
    }
    withPrice = (level)=>{
      let price = '';
      let originPrice = '';
      let finalPrice ='';
      switch(level){
        case '0':
          price = 'XinWebPrice';
          break
        case '1':
          price = `VIPPrice1`;
          originPrice ='StockExtension.XinWebPrice';
          break
        case '2':
          price = `VIPPrice2`;
          originPrice ='StockExtension.XinWebPrice';
          break
        case '3':
          price = `VIPPrice3`;
          originPrice ='StockExtension.XinWebPrice';
          break
        case '4':
          price = `VIPPrice4`;
          originPrice ='StockExtension.XinWebPrice';
          break
        case '5':
          price = `VIPPrice5`;
          originPrice ='StockExtension.XinWebPrice';
          break
        default:
          price = 'XinWebPrice';
          break
      }
      if(originPrice!==''){
        finalPrice = `cast(stock.${price} as DECIMAL(10,2)) as ${price}
        ,cast(${originPrice} as DECIMAL(10,2)) as XinWebPrice`
      }
      else{
        finalPrice = `cast(StockExtension.${price} as DECIMAL(10,2)) as XinWebPrice `
      }
      const withEstimate = (jsonArr) =>{
        let productList = jsonArr;
        let sentence = '';
        for(let i=0;i<productList.length;i++){
            if(i===productList.length-1){
                sentence = sentence + `containersDetails.CustomLabel = '${productList[i].CustomLabel}'`
            }
            else{
                sentence = sentence + `containersDetails.CustomLabel = '${productList[i].CustomLabel}' or `
            }
        }
        if(productList.length === 0){
            res.send(productList)
        }
        else{
        var request = new Request(`select containersDetails.CustomLabel,max(ContainersFollowUp.ArrivalDate) as ArrivalDate from containersDetails inner join containersFollowUp on containersFollowUp.ContainersRN = containersDetails.ContainersRN
        where ${sentence} group by containersDetails.CustomLabel,containersDetails.SoldPerDay`,function(err,rowCounts,rows){
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
                // console.log('container',jsonArray);
                for(let j =0;j<productList.length;j++){
                    productList[j].estimateStock = 10000
                    for(let k =0;k<jsonArray.length;k++){
                        if(jsonArray[k].CustomLabel===productList[j].CustomLabel){
                            var d = new Date();
                            d.setDate(d.getDate());
                            if(parseInt((jsonArray[k].ArrivalDate-d) / (1000 * 60 * 60 * 24), 10)>=0){
                              console.log('aa',productList[j]['SoldPerday'],((jsonArray[k].ArrivalDate-d) / (1000 * 60 * 60 * 24), 10)+20);
                                productList[j].estimateStock=(parseInt((jsonArray[k].ArrivalDate-d) / (1000 * 60 * 60 * 24), 10)+20)*productList[j]['SoldPerday']
                                // productList[j].SoldPerDay=(jsonArray[k].SoldPerDay===null?0:jsonArray[k].SoldPerDay)
                            }
                        }
                    }
                }
                console.log('aaaa',jsonArr);
                res.send(jsonArr)
            }
        })}
            request.on('row',function(columns){})
            request.on('requestCompleted', function () {
            // Next SQL statement.
            });
            connection.execSql(request)
            request.on('end',()=>{
            connection.close()
            })
      }
        request = new Request(`select [D WEIGHT], stock.Stock,StockExtension.CustomLabel,StockExtension.SoldPerday,StockExtension.WebTitle, StockExtension.CATPrimary,StockExtension.CATSub,${finalPrice}
          from StockExtension inner join stock on stock.Code = StockExtension.CustomLabel 
          where ${label}
           `, function(err,rowCounts,rows) {  
            if (err) {  
                console.log(err);
              } 
            else {
                // console.log('row',rows);
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
                  rowObject['priceType'] = price;
                  jsonArray.push(rowObject);
                  } 
                  // console.log('json',jsonArray);
                  withEstimate(jsonArray)
                  // res.send(jsonArray)
      
            }
          })
          request.on('row',function(columns){})
          request.on('requestCompleted', function () {
            // Next SQL statement.
          });
          connection.execSql(request)
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
                 withPrice(jsonArray[0].CustomerLevel)
                 // console.log('a',typeof jsonArray[0].CustomerLevel);
           }
           else{
             withPrice('0')
           }
        }
     })
     request.on('row',function(columns){})
    request.on('requestCompleted', function () {
      // Next SQL statement.
    });
    connection.execSql(request)  
});
    }
});
module.exports = router;