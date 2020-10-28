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
router.get('/bestpostage/:id', function(req, res) {
    const postguid = req.params.id;
    request = new Request(`select OrderGuid,PostCode,HunterWeight,[Buyer City] from HBOrderHead where OrderGuid = '${postguid}'`, function(err,rowCounts,rows) {  
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
    request.on('end',()=>{
      connection.close()
    })
});
    }
});
module.exports = router;