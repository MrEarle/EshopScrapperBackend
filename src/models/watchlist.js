'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class Watchlist extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Watchlist.belongsToMany(models.User, { through: models.Subscription })
    }
  }
  Watchlist.init(
    {
      gameId: {
        type: DataTypes.INTEGER,
        unique: true,
        allowNull: false,
      },
      url: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
        validate: {
          isUrl: { msg: 'Url ingresado es invalido' },
          notEmpty: { msg: 'Debes incluir url' },
        },
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: { msg: 'Debes incluir un nombre' },
        },
      },
      currentPrice: {
        type: DataTypes.INTEGER,
      },
      priceUpdatedAt: {
        type: DataTypes.DATEONLY,
      }
    },
    {
      sequelize,
      modelName: 'Watchlist',
      indexes: [{ unique: true, fields: ['gameId'] }],
    }
  )
  return Watchlist
}
