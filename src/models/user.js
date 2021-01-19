const bcrypt = require('bcrypt')

const PASSWORD_SALT = 10

async function buildPasswordHash(instance) {
  if (instance.changed('password')) {
    const hash = await bcrypt.hash(instance.password, PASSWORD_SALT)
    instance.set('password', hash)
  }
}

const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      User.belongsToMany(models.Watchlist, { through: models.Subscription })
    }

    checkPassword(password) {
      return bcrypt.compare(password, this.password)
    }
  }
  User.init(
    {
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: { msg: 'Debes ingresar un email válido' },
          notEmpty: { msg: 'Debes ingresar una dirección de correo' },
        },
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: { args: 'uniqueUsername', msg: 'El nombre se usuario ya está ocupado' },
        validate: {
          notEmpty: { msg: 'Debes indicar un nombre de usuario' },
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: { msg: 'Debes ingresar una contraseña' },
          len: { args: [6], msg: 'Debes ingresar una contraseña de largo 6' },
        },
      },
    },
    {
      hooks: {
        beforeUpdate: buildPasswordHash,
        beforeCreate: buildPasswordHash,
      },
      sequelize,
      modelName: 'User',
    }
  )
  return User
}
