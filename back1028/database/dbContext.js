var Request = require('tedious').Request;
var connection = require('./connect');
function queryDatabase() {
    console.log("Reading rows from the Table...");
    // Read top 10 rows from table
    const request = new Request(
      `SELECT TOP 10 *
       FROM stock`,
      (err, rowCount) => {
        if (err) {
          console.error(err.message);
        } else {
          console.log(`${rowCount} row(s) returned`);
  
        }
      }
    );
    request.on('row', function (columns) {
        utility.buildRow(columns, data);
    });
    request.on('doneInProc', function (rowCount, more, rows) {
        dataset.push(data);
        data = [];
    });
  //   request.on("row", columns => {
  //     columns.forEach(column => {
  //       console.log("%s\t%s", column.metadata.colName, column.value);
  //     });
  //   });
    connection.execSql(request);
  }  
module.exports = {
    get: queryDatabase 
};