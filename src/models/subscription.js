'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class Subscription extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Subscription.belongsTo(models.User)
      Subscription.belongsTo(models.Watchlist)
    }
  }
  Subscription.init(
    {
      UserId: DataTypes.INTEGER,
      WatchlistId: DataTypes.INTEGER,
      maxPrice: {
        type: DataTypes.INTEGER,
        allowNull: false,
        min: 0,
      },
    },
    {
      sequelize,
      modelName: 'Subscription',
    }
  )

  return Subscription
}
