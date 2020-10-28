module.exports = {
    authentication: {
      options: {
        userName: "Jackie", // update me
        password: "Testtest001" // update me
      },
      type: "default"
    },
    server: "xinsportssql1.database.windows.net", // update me
    options: {
      database: "AddressTest", //update me
      encrypt: true,
      packetSize:32768,
      rowCollectionOnRequestCompletion: true,
      validateBulkLoadParameters:true
    }
  }


  // return (dispatch)=>{
  //   let myArr =  data.map((item,index)=>{
  //       return {address: item}
  //   })
  //   console.log(myArr);
  //   let promises = [];
  //   myArr.forEach((item,index)=>{
  //       const temp = item.address;
  //       promises.push(axios.post(`${baseUrl}admin/putaway/`,[temp]))
  //   })
  //   Promise.all(promises).then(function(res){
  //       const result = res.data;
  //       const action = {
  //           type:constants.PUTAWAY_SUCC,
  //           result
  //       }
  //       dispatch(action)
  //   })
        
  //   }





  