var express = require('express');
var router = express.Router();
var Request = require('tedious').Request; 
var Connection = require('tedious').Connection;  
var config = require('../config')
var connection = new Connection(config);  
    connection.on('connect', function(err) {  
        // If no error, then good to proceed.
        if(err){
          console.log(err);
        }
        else{
    
    
    router.post('/products/:keyword/:page/:sort/',function(req,res){
      const keyword = req.params.keyword;
      // if(keyword.slice(0,16))
      const page = req.params.page;
      console.log(page)
      const email = req.body.email;
      const vipChecked = req.body.vipChecked;
      const sort = req.params.sort;
      let tempSort = '';
      let tempSort2 = '';
      const withEstimate = (jsonArr) =>{
        let productList = jsonArr[0];
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
               
                for(let j =0;j<productList.length;j++){
                    productList[j].estimateStock = 10000
                    for(let k =0;k<jsonArray.length;k++){
                        if(jsonArray[k].CustomLabel===productList[j].CustomLabel){
                            var d = new Date();
                            d.setDate(d.getDate());
                            if(parseInt((jsonArray[k].ArrivalDate-d) / (1000 * 60 * 60 * 24), 10)>=0){
                                productList[j].estimateStock=(parseInt((jsonArray[k].ArrivalDate-d) / (1000 * 60 * 60 * 24), 10)+20)*parseFloat(productList[j]['SoldPerday'])
                                // productList[j].SoldPerDay=(jsonArray[k].SoldPerDay===null?0:jsonArray[k].SoldPerDay)
                            }
                        }
                    }
                }
                if(vipChecked===true){
                  jsonArr[0] = productList.filter((item,index)=>{
                    return item.Stock > item.estimateStock
                  })
                  jsonArr[1][0].productAmount = jsonArr[0].length
                }
                if(jsonArr[0].length===0){
                  res.send([])
                }
                else{
                  res.send(jsonArr)
                }
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
      const getProduct = (amount,level,cat,finalArr)=>{
        var jsonArray = [[],[],[],[]];
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
        if(sort === 'default'){
          tempSort = 'StockExtension.WebTitle'
          tempSort2 = `StockExtension.WebTitle`
        }
        else{
          if(sort==='ASC'){
            tempSort = `StockExtension.XinWebPrice ${sort}`
            tempSort2 = `MyRowNumber ASC`
          }
          if(sort==='DESC'){
            tempSort = `StockExtension.XinWebPrice ${sort}`
            tempSort2 = `MyRowNumber ASC`
          }
        }
        let searchMethod = '';
        let sentence = '';
        if(keyword.slice(0,17)==='searchByCategory-'){
          for(let i =0;i<finalArr.length;i++){
            if(finalArr.length-1 === i){
              sentence = sentence + `CATSub = '${finalArr[i]}'`;
            }else{
              sentence = sentence + `CATSub = '${finalArr[i]}' or `;
            }
          }
          searchMethod = ` ${sentence}`
          // searchMethod = `CATPrimary = '${cat}'`
        }
        else{
          searchMethod = `[WebTitle] LIKE '%${keyword}%'`
        }
        let wheresql = ''
        if(vipChecked === false){
          wheresql = `where (MyRowNumber>=${(parseInt(page)-1)*20+1} and MyRowNumber<${(parseInt(page)-1)*20+1+20})`
        }
        request = new Request(`WITH Results as(
          select [D WEIGHT], stock.Stock-StockExtension.StockFro as Stock,StockExtension.CustomLabel,StockExtension.SoldPerday,StockExtension.WebTitle, StockExtension.CATPrimary,StockExtension.CATSub,${finalPrice},ROW_NUMBER() OVER (ORDER BY ${tempSort} ) AS MyRowNumber
          from StockExtension inner join stock on stock.Code = StockExtension.CustomLabel 
          where (${searchMethod}) and WebOn = 'Y' and (stock.Stock-StockExtension.StockFro) > StockExtension.StockThreshold and StockExtension.XinWebPrice > 0 ) 
          select * from Results ${wheresql}
           `, function(err,rowCounts,rows) {  
        if (err) {  
            console.log(err);
          } 
          else{
           console.log('here4');

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
            jsonArray[0].push(rowObject);
            } 
        //This line will print the array of JSON object.
            jsonArray[1].push({productAmount:amount})
            jsonArray[2].push({page:page})
            jsonArray[3].push({priceType:price})
            withEstimate(jsonArray)
            // res.send(jsonArray); 
          }
           
      })
      request.on('row',function(columns){})
      request.on('requestCompleted', function () {
        // Next SQL statement.
      });
      connection.execSql(request)
        } 
       const withPrice = (level,cat,finalArr) =>{
          let searchMethod = '';
          let sentence = ''; 
          if(keyword.slice(0,17)==='searchByCategory-'){
            for(let i =0;i<finalArr.length;i++){
              if(finalArr.length-1 === i){
                sentence = sentence + `CATSub = '${finalArr[i]}'`;
              }else{
                sentence = sentence + `CATSub = '${finalArr[i]}' or `;
              }
            }
            searchMethod = ` ${sentence}`
          }
          else{
            searchMethod = `[WebTitle] LIKE '%${keyword}%'`
          }
          request = new Request(`select count(CustomLabel) from (StockExtension inner join stock on stock.Code = StockExtension.CustomLabel) where (${searchMethod}) and WebOn = 'Y' and (stock.Stock-StockExtension.StockFro) > StockExtension.StockThreshold and StockExtension.XinWebPrice > 0 `,function(err,rowCounts,rows){
                  if (err) {  
                    console.log(err);
                  }
           console.log('here3',rows[0][0].value);
                  
                  if(rows[0][0].value!==0&&rows[0][0].value!=='0'){
                    getProduct(rows[0][0].value,level,cat,finalArr)
                  }
                  if(rows[0][0].value===0||rows[0][0].value==='0'){
                    res.send([])
                  }
                })
                request.on('row',function(columns){})
                request.on('requestCompleted', function () {
                  // Next SQL statement.
                });
                  connection.execSql(request)
       }
      withPrimaryRN = (level,tempRN) =>{
        request = new Request(`select RN from CAT3withFather where CATFatherRN = '${tempRN}'`,function(err,rowCounts,rows){
          if(err){
            console.log(err);
          }else{
           console.log('here2');

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
                   finalArr = []
                   jsonArray.map((item,index)=>{
                    finalArr.push(item.RN)
                   })
                  withPrice(level,tempRN,finalArr)
             }
             else{
              //  withPrice(level,'0')
              res.send([]);
             }
          }
       })
       request.on('row',function(columns){})
       request.on('requestCompleted', function () {
         // Next SQL statement.
       });
         connection.execSql(request)
      }
      withCategory = (level)=>{
        request = new Request(`select RN from CAT3withFather where CATNAME = '${keyword.slice(17,keyword.length)}'`,function(err,rowCounts,rows){
          if(err){
            console.log(err);
          }else{
           console.log('here2');

             if(rows.length > 0 ){
               console.log(
                `select RN from CAT3withFather where CATNAME = '${keyword.slice(17,keyword.length)}'`
               );
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
                   withPrimaryRN(level,jsonArray[0].RN)
                  //  withPrice(level,jsonArray[0].RN)
             }
          }
       })
       request.on('row',function(columns){})
       request.on('requestCompleted', function () {
         // Next SQL statement.
       });
         connection.execSql(request)
      }
      request = new Request(`select CustomerLevel from WebCustomer where EmailAddress = '${email}'`,function(err,rowCounts,rows){
         if(err){
           console.log(err);
         }else{
           console.log('here1');
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
                  if(keyword.slice(0,17)==='searchByCategory-'){
                      withCategory(jsonArray[0].CustomerLevel)
                  }else{
                    withPrice(jsonArray[0].CustomerLevel)
                  }
            }
            else{
              if(keyword.slice(0,17)==='searchByCategory-'){
                withCategory('0')
               }else{
                withPrice('0')
               }
            }
         }
      })
      request.on('row',function(columns){})
      request.on('requestCompleted', function () {
        // Next SQL statement.
      });
        connection.execSql(request)
    })



  
  
  router.post('/detail/:id',function(req,res){
      const id = req.params.id;
      const email = req.body.email;
      let price = '';
      findFather = (cat,tempArray)=>{
        request = new Request(`select CATNAME as CATPrimary from CAT3withFather where RN='${tempArray[0].CATFatherRN}'  `, function(err,rowCounts,rows) {  
          if (err) {  
              console.log(err);
            }  
          if(rowCounts===0){
            cat[0]['CATSub'] = tempArray[0].CATSub
            res.send(cat)
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
              cat[0]['CATPrimary'] = jsonArray[0].CATPrimary
              cat[0]['CATSub'] = tempArray[0].CATSub
               res.send(cat)
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
      withCate = (cat)=>{
        // let catprimary = cat[0].CATPrimary ===null?1000:cat[0].CATPrimary
        let catsub = cat[0].CATSub === null?1000:cat[0].CATSub
        // select CATNAME as CATPrimary from CAT3withFather where RN = '${catprimary}' 
        request = new Request(`select CATNAME as CATSub,CATFatherRN from CAT3withFather where RN='${catsub}'  `, function(err,rowCounts,rows) {  
        if (err) {  
            console.log(err);
          }  
        if(rowCounts===0){
          res.send(cat)
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
            findFather(cat,jsonArray);
            // if(jsonArray.length === 1 ){
            //   jsonArray[0].CATPrimary?cat[0]['CATPrimary'] = jsonArray[0].CATPrimary:null
            //   jsonArray[0].CATSub?cat[0]['CATSub'] = jsonArray[0].CATSub:null
            // }else{
            //   cat[0]['CATPrimary'] = jsonArray[0].CATPrimary
            //   cat[0]['CATSub'] = jsonArray[1].CATSub
            // }
          // res.send(cat)
        }
            })
            request.on('row',function(columns){})
            request.on('requestCompleted', function () {
              // Next SQL statement.
            });
            connection.execSql(request)
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
        request = new Request(`select containersDetails.CustomLabel,max(ContainersFollowUp.ArrivalDate) as ArrivalDate,containersDetails.SoldPerDay from containersDetails inner join containersFollowUp on containersFollowUp.ContainersRN = containersDetails.ContainersRN
        where ${sentence} group by containersDetails.CustomLabel,containersDetails.SoldPerDay`,function(err,rowCounts,rows){
            if(err) console.log(err);
            else{
              if(productList.length === 0){
                res.send(productList)
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
                // console.log('container',jsonArray);
                for(let j =0;j<productList.length;j++){
                    productList[j].estimateStock = 10000
                    for(let k =0;k<jsonArray.length;k++){
                        if(jsonArray[k].CustomLabel===productList[j].CustomLabel){
                            var d = new Date();
                            d.setDate(d.getDate());
                            if(parseInt((jsonArray[k].ArrivalDate-d) / (1000 * 60 * 60 * 24), 10)>=0){
                                productList[j].estimateStock=(parseInt((jsonArray[k].ArrivalDate-d) / (1000 * 60 * 60 * 24), 10)+20)*parseFloat(productList[j]['SoldPerday'])
                                // productList[j].SoldPerDay=(jsonArray[k].SoldPerDay===null?0:jsonArray[k].SoldPerDay)
                            }
                        }
                    }
                }
                withCate(productList)
            }}
        })
            request.on('row',function(columns){})
            request.on('requestCompleted', function () {
            // Next SQL statement.
            });
            connection.execSql(request)
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
        // if(originPrice!==''){
        //   finalPrice = `stock.${price},${originPrice}`
        // }
        // else{
        //   finalPrice = `StockExtension.${price}`
        // }
        if(originPrice!==''){
          finalPrice = `cast(stock.${price} as DECIMAL(10,2)) as ${price}
          ,cast(${originPrice} as DECIMAL(10,2)) as XinWebPrice`
        }
        else{
          finalPrice = `cast(StockExtension.${price} as DECIMAL(10,2)) as XinWebPrice `
        }
      var jsonArray = [];
      // console.log(`select StockExtension.CustomLabel,[D WEIGHT],images.BLOBData,StockExtension.SoldPerday, StockExtension.WebTitle,${finalPrice},StockExtension.WebDetails,stock.Stock-StockExtension.StockFro as Stock,StockExtension.CATPrimary,StockExtension.CATSub  
      // from (StockExtension inner join stock on stock.Code = StockExtension.CustomLabel) inner join images on StockExtension.CustomLabel=images.CustomLabel
      // where StockExtension.CustomLabel='${id}' and WebOn = 'Y' and (stock.Stock-StockExtension.StockFro) > StockExtension.StockThreshold and StockExtension.XinWebPrice > 0`)
      request = new Request(`select StockExtension.CustomLabel,[D WEIGHT],StockExtension.SoldPerday, StockExtension.WebTitle,${finalPrice},StockExtension.WebDetails,stock.Stock-StockExtension.StockFro as Stock,StockExtension.CATPrimary,StockExtension.CATSub  
      from (StockExtension inner join stock on stock.Code = StockExtension.CustomLabel)
      where StockExtension.CustomLabel='${id}' and WebOn = 'Y' and (stock.Stock-StockExtension.StockFro) > StockExtension.StockThreshold and StockExtension.XinWebPrice > 0
      select BLOBData from images where CustomLabel = '${id}'
      `, function(err,rowCounts,rows) {  
      if (err) {  
          console.log(err);
        } 
      if(rowCounts ===0){
        res.send([]);
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
            rowObject['priceType'] = price;
          jsonArray.push(rowObject);
          } 
          console.log(jsonArray,'jsonArray')
      //This line will print the array of JSON object.
      withEstimate(jsonArray)
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
      } 
      ); 

  router.post('/postage/:postcode',function(req,res){
    const cart = req.body;
    let totalWeight = 0;
    let tempPrice = 0;
   
    for(let i = 0;i<cart.length;i++){
      tempPrice = tempPrice+ cart[i].itemPrice * cart[i].quantity
      totalWeight = totalWeight+ cart[i]['D WEIGHT'] *cart[i].quantity
    }
    const postcode = req.params.postcode;
    // console.log(`select [D WEIGHT],Code from stock where Code in (${cartTempInfo})`);
    request = new Request(`select top 1 HunterBasicCharge,HunterMinCharge,HunterRate from HBAllCouriers where PostCode = ${postcode}`, function(err,rowCounts,rows) { 
        var jsonArray = []
        if(err){console.log(err);}
        else{
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
          if(jsonArray[0].HunterRate <= 0.23){
            res.send({postage:0,finalPrice:(0+tempPrice).toFixed(2)})
          }else{
            let discountHunterRater = jsonArray[0].HunterRate - 0.23
            let TempostPrice = jsonArray[0].HunterBasicCharge + discountHunterRater *totalWeight
            if(TempostPrice > jsonArray[0].HunterMinCharge){
              TempostPrice = parseInt(TempostPrice/5)*5+5
              res.send({postage:TempostPrice,finalPrice:(TempostPrice+tempPrice).toFixed(2)})
            }
            else{
              let FinalMinCharge  = parseInt(jsonArray[0].HunterMinCharge/5)*5+5
              res.send({postage:FinalMinCharge,finalPrice:(jsonArray[0].HunterMinCharge+tempPrice).toFixed(2)})
            }
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
  }
}); 
// connection.close();
module.exports = router;
