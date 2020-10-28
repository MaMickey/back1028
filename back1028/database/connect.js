const { Connection, Request } = require("tedious");

// Create connection to database
const config = {
  authentication: {
    options: {
      userName: "Jackie", // update me
      password: "Testtest001" // update me
    },
    type: "default"
  },
  server: "xinsportssql1.database.windows.net", // update me
  options: {
    database: "Address", //update me
    encrypt: true
  }
};

const connection = new Connection(config);
connection.on('connect', function (err) {
    if (err) {
        console.log(err);
    } else {
        // console.log('Connected');
    }
});
module.exports = connection;