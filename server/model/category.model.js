const mongoose = require('mongoose');


const categorySchema = new mongoose.Schema({
   name : {
      type : String,
      required : true
   },
   type : {
    type : String,
    required : true,
    enum: ['String', 'Number']
   },
   allowedValues:{
      type: [String],
      default:[]
   }
});



module.exports = categorySchema;

const dbConnection = require('../controllers/db.controller');
const Category = dbConnection.model('Category',categorySchema,'category');

module.exports.model = Category;
