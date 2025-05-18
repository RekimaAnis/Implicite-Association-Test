const Words = require('./../model/word.model').model; 

/**
 * renvoie la lisye de tout les mots
 * @param {*} _ pas utiliser
 * @param {*} res 
 */
module.exports.list = 
    async (_,res) => {
        try {
            const allWords = await Words.find(); 
            console.log(`=> words : ${allWords}`); 
            res.status(200).json(allWords); 
        } catch (error) {
            console.error('=> error while retrieving words'); 
            res.status(500).json({error : 'fetch words error'}); 
        }
    }

/**
 * créer un nouveau mot 
 * @param {*} req nouveau mot créer
 * @param {*} res 
 * @param {*} _ pas utiliser
 */
module.exports.create = 
    async (req,res,_) => {
        const newWordData = {...req.body}; 
        try {
            console.log(`${newWordData} in createWord()`); 
            const createdWord = await Words.create(newWordData); 
            res.status(200).json(createdWord); 
        } catch (error) {
            console.error('=> error while creating word');
            res.status(500).json({error : 'create word error'}); 
        }
    }

/**
 * supprime un mot
 * @param {*} req 
 * @param {*} res 
 */
module.exports.delete = 
    async (req,res) => {
        const wordId = req.params.wordId; 
        try {
            await Words.findByIdAndDelete(wordId); 
            console.log(`=> word ${wordId} deleted`); 
            res.status(200).end(null); 
        } catch (error) {
            console.error(`=> error while deleting word with ID ${wordId}`); 
            res.status(500).json({error : 'delete word error'}); 
        }
    }

/**
 * modifie un mot existant
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
module.exports.modify = 
    async (req,res) => {
        const wordData = {...req.body}; 
        const wordId = req.params.userId; 
        try {
            const updated = await Words.findByIdAndUpdate(
                req.params.wordId,
                {mot : req.body.mot, categorie : req.body.categorie},
                {new: true, runValidators: true}
            );
            if(!updated){
                return res.status(404).json({error: 'Mot non trouvé'});
            }
            return res.status(200).json(updated);
        }
        catch(err){
            console.error(err.stack);
            return res.status(500).json({error: err.message})
        }
    }