const { Op } = require("sequelize");
class TodoService {
  constructor(db) {
    this.client = db.sequelize;
    this.Todo = db.Todo;
    this.Category = db.Category;
    this.Status = db.Status;
  }

  async create(name, description, StatusId, CategoryId, UserId) {
    return this.Todo.create({
      name,
      description,
      StatusId,
      CategoryId,
      UserId,
    });
  }

  async findAll() {
    return this.Todo.findAll();
  }

  async findOne(id) {
    return this.Todo.findByPk(id);
  }

  async findAllByUser(id, deleted = false) {
    const statusCondition = deleted ? {} : { status: { [Op.ne]: "Deleted" } };
    return this.Todo.findAll({
      where: { UserId: id },
      include: [{ model: this.Category }, { model: this.Status, where: statusCondition }],
    });
  }

  async findAllDeletedByUser(id) {
    return this.Todo.findAll({
      where: { UserId: id },
      include: [{ model: this.Category }, { model: this.Status, where: { status: "Deleted" } }],
    });
  }

  async findAllByCategory(id) {
    return this.Todo.findAll({ where: { CategoryId: id } });
  }

  async findAllStatuses() {
    return this.Status.findAll();
  }

  async findOneStatus(id) {
    return this.Status.findByPk(id);
  }

  async update(id, args) {
    return this.Todo.update(
      { ...args },
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
