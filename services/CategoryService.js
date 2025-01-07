class CategoryService {
  constructor(db) {
    this.client = db.sequelize;
    this.Category = db.Category;
    this.User = db.User;
  }

  async create(name, userId) {
    return this.Category.create({
      name,
      userId,
    });
  }

  async findAll() {
    return this.Category.findAll();
  }

  async findOne(id) {
    return this.Category.findByPk(id);
  }

  async update(id, name) {
    return this.Category.update(
      { name },
      {
        where: { id },
      }
    );
  }

  async delete(id) {
    return this.Category.destroy({
      where: { id },
    });
  }
}

module.exports = CategoryService;
