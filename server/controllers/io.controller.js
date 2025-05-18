const Category = require('../model/category.model').model;
const User     = require('../model/user.model');
const EVENTS   = require('../public/javascripts/constante/event');

class IoController {
  #io;
  #clients;
  #idAdmin;
  #schema;
  #selectedCategory = null;

  constructor(io) {
    this.#io       = io;
    this.#clients  = new Map();
    this.#idAdmin  = null;
    this.#schema   = { fields: [], types: {}, allowedValues: {} };
    this.initSchema();
    io.on('connection', socket => this.registerSocket(socket));
  }

  async initSchema() {
    const cats = await Category.find();
    this.#schema.fields        = cats.map(c => c.name);
    this.#schema.types         = cats.reduce((acc, c) => { acc[c.name] = c.type; return acc; }, {});
    this.#schema.allowedValues = cats.reduce((acc, c) => { acc[c.name] = c.allowedValues; return acc; }, {});
  }

  broadcastSchema() {
    this.#io.emit(EVENTS.SCHEMA_UPDATE, this.#schema);
  }

  registerSocket(socket) {
    console.log(`Client connecté: ${socket.id}`);
    this.#clients.set(socket.id, { role: 'client' });

    socket.emit(EVENTS.SCHEMA, this.#schema);

    this.setupListeners(socket);
  }

  setupListeners(socket) {
    socket.on(EVENTS.ADMIN_JOIN, data => this.handleAdminJoin(socket, data));
    socket.on(EVENTS.ADD_CATEGORY, data => this.handleAddCategory(socket, data));
    socket.on(EVENTS.UPDATE_CATEGORY, data => this.handleUpdateCategory(socket, data));
    socket.on(EVENTS.DELETE_CATEGORY, data => this.handleDeleteCategory(socket, data));
    socket.on(EVENTS.SUBMIT_FORM, data => this.handleSubmitForm(socket, data));
    socket.on(EVENTS.DISCONNECT, () => this.handleDisconnect(socket));
    socket.on(EVENTS.CATEGORY_BREAKDOWN_REQUEST, data => this.handleCategoryBreakdownRequest(socket, data));
  }

  handleAdminJoin(socket, data) {
    if (this.#idAdmin !== null) {
      socket.emit(EVENTS.ADMIN_ERROR, { message: 'Admin déjà connecté' });
      socket.disconnect();
      return;
    }
    this.#idAdmin = socket.id;
    this.#clients.set(socket.id, { role: 'admin', name: data.name });
    console.log(`Admin connecté: ${data.name} (${socket.id})`);
  }

  async handleAddCategory(socket, { name, type, allowedValues }) {
    if (socket.id !== this.#idAdmin) {
      socket.emit(EVENTS.ADMIN_ERROR, { message: 'Accès refusé' });
      return;
    }
    try {
      const cat = await Category.create({ name, type, allowedValues });
      await this.initSchema();
      this.broadcastSchema();
      socket.emit(EVENTS.CATEGORY_ADDED, { category: cat });
      console.log(`Catégorie ajoutée: ${name}`);
    } catch (e) {
      socket.emit(EVENTS.CATEGORY_ERROR, { message: e.message });
    }
  }

  async handleUpdateCategory(socket, { id, name, type, allowedValues }) {
    if (socket.id !== this.#idAdmin) {
      socket.emit(EVENTS.ADMIN_ERROR, { message: 'Accès refusé' });
      return;
    }
    try {
      const cat = await Category.findByIdAndUpdate(
        id,
        { name, type, allowedValues },
        { new: true, runValidators: true }
      );
      if (!cat) throw new Error('Catégorie non trouvée');
      await this.initSchema();
      this.broadcastSchema();
      socket.emit(EVENTS.CATEGORY_UPDATED, { category: cat });
      console.log(`Catégorie mise à jour: ${id}`);
    } catch (e) {
      socket.emit(EVENTS.CATEGORY_ERROR, { message: e.message });
    }
  }

  async handleDeleteCategory(socket, { id }) {
    if (socket.id !== this.#idAdmin) {
      socket.emit(EVENTS.ADMIN_ERROR, { message: 'Accès refusé' });
      return;
    }
    try {
      await Category.findByIdAndDelete(id);
      await this.initSchema();
      this.broadcastSchema();
      socket.emit(EVENTS.CATEGORY_DELETED, { id });
      console.log(`Catégorie supprimée: ${id}`);
    } catch (e) {
      socket.emit(EVENTS.CATEGORY_ERROR, { message: e.message });
    }
  }

  async handleSubmitForm(socket, data) {
    try {
      const user = await User.create(data.response);
      socket.emit(EVENTS.SUBMIT_SUCCESS, { user });

      if (this.#idAdmin) {
        // Mise à jour du compteur
        const count = await User.countDocuments();
        this.#io.to(this.#idAdmin).emit(EVENTS.UPDATE_COUNT, { count });

        // 🔁 Boucle sur toutes les catégories du schéma
        for (const category of this.#schema.fields) {
          const users = await User.find();
          const breakdown = {};

          users.forEach(u => {
            const val = u[category];
            if (val) {
              breakdown[val] = (breakdown[val] || 0) + 1;
            }
          });

          // Envoi à l’admin du breakdown pour cette catégorie
          this.#io.to(this.#idAdmin).emit(EVENTS.UPDATE_BREAKDOWN, { category, breakdown });
        }
      }

      console.log(`Formulaire soumis par ${socket.id}`);
    } catch (e) {
      socket.emit(EVENTS.SUBMIT_ERROR, { message: e.message });
    }
  }

  handleDisconnect(socket) {
    console.log(`Client déconnecté: ${socket.id}`);
    if (socket.id === this.#idAdmin) {
      this.#idAdmin = null;
      console.log('Admin déconnecté');
    }
    this.#clients.delete(socket.id);
  }

  async handleCategoryBreakdownRequest(socket, { category }) {
    try {
      this.#selectedCategory = category;
      const users = await User.find();
      const breakdown = {};

      users.forEach(user => {
        const answer = user[category];
        if (answer) {
          breakdown[answer] = (breakdown[answer] || 0) + 1;
        }
      });

      socket.emit(EVENTS.UPDATE_BREAKDOWN, { breakdown });
    } catch (e) {
      socket.emit(EVENTS.CATEGORY_ERROR, { message: e.message });
    }
  }
}

module.exports = IoController;
