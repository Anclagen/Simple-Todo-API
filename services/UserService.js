class UserService {
  constructor(db) {
    this.client = db.sequelize;
    this.User = db.User;
  }

  async getOneEmail(email) {
    return this.User.findOne({
      where: { email },
    });
  }

  async getOneId(id) {
    return this.User.findOne({
      where: { id },
    });
  }

  async create(name, email, encryptedPassword, salt) {
    return this.User.create({
      name,
      email,
      encryptedPassword,
      salt,
    });
  }
}

module.exports = UserService;
