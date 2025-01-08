class TodoService {
  constructor(db) {
    this.client = db.sequelize;
    this.Todo = db.Todo;
    this.Category = db.Category;
    this.Status = db.Status;
  }

  async create(name, email, encryptedPassword, salt) {
    return this.Todo.create({
      name,
      email,
      encryptedPassword,
      salt,
    });
  }

  async findAll() {
    return this.Todo.findAll();
  }

  async findOne(id) {
    return this.Todo.findByPk(id);
  }

  async findAllByCategory(id) {
    return this.Todo.findAll({ where: { CategoryId: id } });
  }

  async update(id, name) {
    return this.Todo.update(
      { name },
      {
        where: { id },
      }
    );
  }

  async delete(id) {
    return this.Todo.destroy({
      where: { id },
    });
  }
}

module.exports = TodoService;
