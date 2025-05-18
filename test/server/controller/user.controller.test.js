const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');

jest.mock('../../../server/controllers/db.controller', () => {
  return {
    model: jest.fn(() => ({
      find: jest.fn(),
      deleteMany: jest.fn(),
    })),
    on: jest.fn(),
    close: jest.fn(),
  };
});

jest.mock('../../../server/model/user.model', () => {
  const deleteMany = jest.fn();
  return {
    model: {
      deleteMany,
    }
  };
});


const userController = require('../../../server/controllers/user.controller');
const User = require('../../../server/model/user.model').model; 


const app = express();
app.use(express.json());
app.delete('/user/reset', userController.reset);


describe('User Controller - reset()', () => {
  afterAll(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('doit supprimer tous les utilisateurs et retourner un message', async () => {
    User.deleteMany.mockResolvedValueOnce({});

    const res = await request(app).delete('/user/reset');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: 'Tous les utilisateurs ont été supprimés'
    });
  });

  it('retourne une erreur serveur si la suppression échoue', async () => {
    User.deleteMany.mockRejectedValueOnce(new Error('Problème Mongo'));

    const res = await request(app).delete('/user/reset');

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error');
  });
});
