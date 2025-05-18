const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({}, { strict: false });


module.exports = userSchema;

const dbConnection = require('../controllers/db.controller');
const User = dbConnection.model('User',userSchema,'user');

module.exports.model = User;
