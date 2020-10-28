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

router.post('/estimateValue/',function(req,res){
    let productList = req.body;
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
    var request = new Request(`select containersDetails.CustomLabel,max(ContainersFollowUp.ArrivalDate) as ArrivalDate,containersDetails.SoldPerDay from containersDetails inner join containersFollowUp on containersFollowUp.ContainersRN = containersDetails.ContainersRN
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
                for(let k =0;k<jsonArray.length;k++){
                    if(jsonArray[k].CustomLabel===productList[j].CustomLabel){
                        var d = new Date();
                        d.setDate(d.getDate());
                        if(parseInt((jsonArray[k].ArrivalDate-d) / (1000 * 60 * 60 * 24), 10)>=0){
                            productList[j].estimateDay=parseInt((jsonArray[k].ArrivalDate-d) / (1000 * 60 * 60 * 24), 10)+20
                            productList[j].SoldPerDay=(jsonArray[k].SoldPerDay===null?0:jsonArray[k].SoldPerDay)
                        }   
                    }
                }
            }
            res.send(productList)
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
    })
    }
});
module.exports = router;
