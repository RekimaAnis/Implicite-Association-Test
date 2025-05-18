const Users = require('./../model/user.model').model;
const Category = require('./../model/category.model').model;

/**
 * list all users from the dB 
 * uses fetch 
 */
module.exports.list = async (_, res) => {
  try {
    const allUsers = await Users.find();
    console.log(`=> users : ${allUsers}`);
    res.status(200).json(allUsers);
  } catch (error) {
    console.error('=> error while retrieving users');
    res.status(500).json({ error: 'fetch users error' });
  }
};

/**
 * create a new user using request parameters 
 * @param {Request} req - the request of the server
 * @param {Response} res -the response sent back to server 
 */
module.exports.create = async (req, res) => {
  const newUserData = { ...req.body };
  try {
    console.log(`${newUserData} in createUser()`);
    const createdUser = await Users.create(newUserData);
    res.status(200).json(createdUser);
  } catch (error) {
    console.error('=> error while creating user');
    res.status(500).json({ error: 'create user error' });
  }
};

/**
 * remove user using ID passed through request parameters
 * @param {Request} req - the request of the server
 * @param {Response} res -the response sent back to server 
 */
module.exports.delete = async (req, res) => {
  const userId = req.params.userId;
  try {
    await Users.findByIdAndDelete(userId);
    console.log(`=> user ${userId} deleted`);
    res.sendStatus(204);
  } catch (error) {
    console.error(`=> error while deleting user with ID ${userId}`);
    res.status(500).json({ error: 'delete user error' });
  }
};

/**
 * modify user using ID passed through request parameters 
 * @param {Request} req - the request of the server
 * @param {Response} res -the response sent back to server 
 */
module.exports.modify = async (req, res) => {
  const userData = { ...req.body };
  const userId = req.params.userId;
  try {
    const user = await Users.findByIdAndUpdate(
      userId,
      userData,
      { new: true }
    );
    console.log(`=> user with ID ${userId} modified`);
    res.status(200).json(user);
  } catch (error) {
    console.error(`=> error while updating user with ID ${userId}`);
    res.status(500).json({ error: 'update user error' });
  }
};

/**
 * create a category in the Category dB using request parameters 
 * name - name of the category (ex : age)
 * type - type of the category (ex : Int) 
 * allowedValues - list of user-selectable values 
 * @param {Request} req - the request of the server 
 * @param {Response} res -the response sent back to server 
 */
module.exports.categoryCreate = async (req, res) => {
  try {
    const { name, type, allowedValues = [] } = req.body;
    const cat = await Category.create({ name, type, allowedValues });
    res.status(201).json(cat);
  } catch (e) {
    console.error('=> error while creating category', e);
    res.status(400).json({ error: e.message });
  }
};
/**
 * list all categories in the Category dB 
 * @param {Request} req - the request of the server
 * @param {Response} res -the response sent back to server 
 */
module.exports.categoryList = async (req, res) => {
  try {
    const cats = await Category.find();
    res.status(200).json(cats);
  } catch (e) {
    console.error('=> error fetching categories', e);
    res.status(500).json({ error: e.message });
  }
};
/**
 * update existing category using ID passed through request parameters 
 * @param {Request} req - the request of the server
 * @param {Response} res -the response sent back to server 
 */
module.exports.categoryUpdate = async (req, res) => {
  try {
    const { name, type, allowedValues } = req.body;
    const updateData = { name, type };
    if (Array.isArray(allowedValues)) {
      updateData.allowedValues = allowedValues;
    }
    const cat = await Category.findByIdAndUpdate(
      req.params.categoryId,
      updateData,
      { new: true, runValidators: true }
    );
    if (!cat) return res.status(404).json({ error: 'Catégorie non trouvée' });
    res.status(200).json(cat);
  } catch (e) {
    console.error('=> error while updating category', e);
    res.status(400).json({ error: e.message });
  }
};

/**
 * delete category using ID passed through request parameters
 * @param {Request} req - the request of the server
 * @param {Response} res - the response sent back to server 
 */
module.exports.categoryDelete = async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.categoryId);
    console.log(`=> category ${req.params.categoryId} deleted`);
    res.sendStatus(204);
  } catch (e) {
    console.error('=> error while deleting category', e);
    res.status(500).json({ error: e.message });
  }
};
/**
 * send differents objects
 * fields - the categories names 
 * 
 * @param {Request} req - the request of the server
 * @param {Response} res -the response sent back to server 
 */
module.exports.schema = async (req, res) => {
  try {
    const staticPaths = Object.keys(Users.schema.paths)
      .filter(p => !['_id', '__v'].includes(p));

    const cats = await Category.find();
    const dynamicNames = cats.map(c => c.name);

    const fields = staticPaths.concat(dynamicNames);

    const types = {};
    staticPaths.forEach(p => {
      const inst = Users.schema.paths[p].instance === 'Array'
        ? Users.schema.paths[p].caster.instance
        : Users.schema.paths[p].instance;
      types[p] = inst;
    });
    cats.forEach(c => {
      types[c.name] = c.type;
    });

    const allowedValues = cats.reduce((obj, c) => {
      obj[c.name] = c.allowedValues;
      return obj;
    }, {});

    res.status(200).json({ fields, types, allowedValues });
  } catch (e) {
    console.error('=> error building schema', e);
    res.status(500).json({ error: e.message });
  }
};
/**
 * create
 * @param {Request} req - the request of the server
 * @param {Response} res -the response sent back to server 
 */
module.exports.breakdown = async(req, res) =>{
  const category = req.query.category;
  if (!category) return res.status(400).json({ error: 'Catégorie requise' });

  try {
    const users = await Users.find();
    const breakdown = {};

    users.forEach(user => {
      const value = user[category];
      if (value) {
        breakdown[value] = (breakdown[value] || 0) + 1;
      }
    });

    res.json({ breakdown });
  } catch (e) {
    console.error("Erreur breakdown :", e);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

/**
 * create
 * @param {Request} req - the request of the server
 * @param {Response} res -the response sent back to server 
 */
module.exports.reset = async (req, res) => {
  try {
    await Users.deleteMany({});
    console.log('✅ Tous les utilisateurs ont été supprimés');
    res.status(200).json({ message: 'Tous les utilisateurs ont été supprimés' });
  } catch (e) {
    console.error('❌ Erreur lors de la suppression des utilisateurs', e);
    res.status(500).json({ error: 'Erreur lors de la réinitialisation des utilisateurs' });
  }
};