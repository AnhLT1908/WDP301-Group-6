const mongoose = require('mongoose');

const ConnectDB = async () =>{
    try{
        const conn = await mongoose.connect(process.env.MONGODB_URL);
        console.log('App connected successfully');
        console.log(`Database Connected: ${conn.connection.host}`);
        console.log('MongoDB connecting successfully');
    }catch(err){
        console.log(err);
    }
}
module.exports = ConnectDB;