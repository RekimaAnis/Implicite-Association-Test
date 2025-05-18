const mongoose = require('mongoose');

const localURI = require('../config/db.config').DB_URI;
const dbURI =  process.env.MONGODB_CONNECT_URI || localURI;
const dbConnection = mongoose.createConnection(dbURI);


module.exports = dbConnection;


dbConnection.on('connected',
  () => console.log(`db.controller.js : connected to ${dbURI}`)
);
dbConnection.on('disconnected',
  () => console.log(`db.controller.js : disconnected from ${dbURI}`)
);
dbConnection.on('error',
  err => console.log(`db.controller.js : connection error ${err} `)
);



const shutdown = async msg => {
  await dbConnection.close();
  console.log(` Mongoose shutdown : ${msg}`);
  process.exit(0);
}


const readline = require('readline');
if (process.platform === 'win32') {
    readline
      .createInterface({
        input: process.stdin,
        output: process.stdout
      })
      .on('SIGINT', function() {
        process.emit('SIGINT');
      })
  };


process.on('SIGINT', () => shutdown('application ends') );
process.on('SIGTERM', () =>  shutdown('SIGTERM received') );
