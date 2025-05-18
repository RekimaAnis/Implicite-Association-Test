const Words = require('./../../../server/model/word.model').model;

jest.mock('./../../../server/model/word.model', () => ({
  model: {
    find: jest.fn(),
    create: jest.fn(),
    findByIdAndDelete: jest.fn(),
    findByIdAndUpdate: jest.fn()
  }
}));

const controller = require('./../../../server/controllers/word.controller');

describe('Word Controller', () => {
  let req, res;

  beforeEach(() => {
    req = { params: {}, body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      end: jest.fn()
    };
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should return all words', async () => {
      const fakeWords = [{ mot: 'test' }];
      Words.find.mockResolvedValue(fakeWords);

      await controller.list({}, res);

      expect(Words.find).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(fakeWords);
    });

    it('should handle errors', async () => {
      Words.find.mockRejectedValue(new Error('db error'));

      await controller.list({}, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'fetch words error' });
    });
  });

  describe('create', () => {
    it('should create a new word', async () => {
      req.body = { mot: 'bonjour', categorie: 'salutation' };
      const created = { _id: '1', mot: 'bonjour', categorie: 'salutation' };
      Words.create.mockResolvedValue(created);

      await controller.create(req, res);

      expect(Words.create).toHaveBeenCalledWith({ mot: 'bonjour', categorie: 'salutation' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(created);
    });

    it('should handle creation errors', async () => {
      req.body = { mot: 'bonjour' };
      Words.create.mockRejectedValue(new Error('create error'));

      await controller.create(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'create word error' });
    });
  });

  describe('delete', () => {
    it('should delete a word', async () => {
      req.params = { wordId: '123' };
      Words.findByIdAndDelete.mockResolvedValue();

      await controller.delete(req, res);

      expect(Words.findByIdAndDelete).toHaveBeenCalledWith('123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.end).toHaveBeenCalledWith(null);
    });

    it('should handle deletion errors', async () => {
      req.params = { wordId: '123' };
      Words.findByIdAndDelete.mockRejectedValue(new Error('delete error'));

      await controller.delete(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'delete word error' });
    });
  });

  describe('modify', () => {
    it('should update a word', async () => {
      req.params = { wordId: '456' };
      req.body = { mot: 'salut', categorie: 'greeting' };
      const updated = { _id: '456', mot: 'salut', categorie: 'greeting' };
      Words.findByIdAndUpdate.mockResolvedValue(updated);

      await controller.modify(req, res);

      expect(Words.findByIdAndUpdate)
        .toHaveBeenCalledWith('456', { mot: 'salut', categorie: 'greeting' }, { new: true, runValidators: true });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(updated);
    });

    it('should return 404 if word not found', async () => {
      req.params = { wordId: '456' };
      req.body = { mot: 'salut', categorie: 'greeting' };
      Words.findByIdAndUpdate.mockResolvedValue(null);

      await controller.modify(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Mot non trouvé' });
    });

    it('should handle update errors', async () => {
      req.params = { wordId: '456' };
      req.body = { mot: 'salut' };
      Words.findByIdAndUpdate.mockRejectedValue(new Error('validation error'));

      await controller.modify(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'validation error' });
    });
  });
});
