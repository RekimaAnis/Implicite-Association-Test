const mongoose = require('mongoose');


const wordSchema = new mongoose.Schema({
   mot : {
      type : String,
      required : true
   },
   categorie : {
    type : String,
    required : true
   }
});



module.exports = wordSchema;

const dbConnection = require('../controllers/db.controller');
const Word = dbConnection.model('Word',wordSchema,'word');

module.exports.model = Word;
