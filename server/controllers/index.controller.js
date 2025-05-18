const { sendFile } = require('../util/util.js');

const home = (_, res) => sendFile(res, 'index.html');
const openAccess = (_, res) => sendFile(res, 'accesLibre.html');
const protectedAccess = (_, res) => sendFile(res, 'html/admin.html');
const game = (_, res) => sendFile(res, 'html/game.html');
const prenezTest = (_, res) => sendFile(res, 'html/prenezTest.html'); 
const informationGenerales = (_, res) => sendFile(res, 'html/informationGenerales.html'); 
const supportTechnique = (_, res) => sendFile(res, 'html/supportTechnique.html'); 
const lesSientifiques = (_, res) => sendFile(res, 'html/lesSientifiques.html'); 
const users = (_, res) => sendFile(res, 'html/users.html'); 
const words = (_, res) => sendFile(res, 'html/words.html'); 
const form = (_, res) => sendFile(res, 'html/form.html');

module.exports = {home,openAccess,protectedAccess,game,prenezTest,informationGenerales,supportTechnique,lesSientifiques,users,words,form}; 

