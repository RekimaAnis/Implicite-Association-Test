const Word = require('../model/word.model').model;
const User = require('../model/user.model').model;

const list = async(req, res) => {
    try{
        const words = await Word.find();
        res.status(200).json(words);
    }
    catch(err){
        res.status(500).json({ error: err.message });
    }
}

const create = async(req, res) => {
    try{
        const { mot, categorie } = req.body;
        if (!mot || !categorie) {
          return res.status(400).json({ error: 'mot et categorie sont requis' });
        }
        const newWord = new Word({ mot, categorie });
        await newWord.save();
        res.status(201).json(newWord);
    }
    catch(err){
        res.status(500).json({ error: err.message });
    }
}

const remove = async (req, res) => {
    try {
      const { wordId } = req.params;
      const deleted = await Word.findByIdAndDelete(wordId);
      if (!deleted) {
        return res.status(404).json({ error: 'Mot non trouvé' });
      }
      res.status(200).json({ message: 'Mot supprimé', word: deleted });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
};

const modify = async (req, res) => {
    try {
      const { wordId } = req.params;
      const updates = {};
      if (req.body.mot !== undefined) updates.mot = req.body.mot;
      if (req.body.categorie !== undefined) updates.categorie = req.body.categorie;
      if (Object.keys(updates).length === 0) {
        return res.status(400).json({ error: 'Aucune donnée à mettre à jour' });
      }
      const updated = await Word.findByIdAndUpdate(
        wordId,
        { $set: updates },
        { new: true, runValidators: true }
      );
      if (!updated) {
        return res.status(404).json({ error: 'Mot non trouvé' });
      }
      res.status(200).json(updated);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
};

module.exports.list = list;
module.exports.create = create;
module.exports.remove =  remove;
module.exports.modify = modify;

