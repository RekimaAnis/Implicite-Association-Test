const jwt = require('jsonwebtoken');
const secret = require('../config/secret'); 
const jwtConfig = require('../config/jwt.config');
exports.login = (req, res) => {
  const { login, password } = req.body;

  // Vérifie avec les identifiants fixes
  if (login === secret.user && password === secret.password) {
    // Génère un token JWT avec le login
    const token = jwt.sign({ login }, jwtConfig.SECRET_TOKEN, {
      expiresIn: '1h' // expire dans 1 heure
    });

    // Envoie le token dans un cookie sécurisé
    res.cookie('token', token, {
      httpOnly: true,
      sameSite: 'strict',
      maxAge: 3600000 
    });

    return res.status(200).json({ message: 'Connexion réussie' });
  }

  // Si identifiants incorrects
  return res.status(401).json({ message: 'Identifiants incorrects' });
};
