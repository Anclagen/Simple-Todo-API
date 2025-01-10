class CategoryService {
  constructor(db) {
    this.client = db.sequelize;
    this.Category = db.Category;
    this.User = db.User;
  }

  async create(name, id) {
    return this.Category.create({
      name,
      UserId: id,
    });
  }

  async findAll() {
    return this.Category.findAll();
  }

  async findAllByUser(id) {
    return this.Category.findAll({ where: { UserId: id } });
  }

  async findOne(id) {
    return this.Category.findOne({ where: { id } });
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
