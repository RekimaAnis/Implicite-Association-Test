const express = require('express'); 
const router = express.Router(); 

const wordController = require('./../controllers/word.controller');

router.get('/', wordController.list); 
router.post('/', wordController.create);
router.delete('/:wordId', wordController.delete); 
router.patch('/:wordId', wordController.modify); 

module.exports = router; 