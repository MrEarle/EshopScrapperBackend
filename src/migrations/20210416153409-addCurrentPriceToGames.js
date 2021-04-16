'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    const currPriceCol = queryInterface.addColumn(
      'Watchlists',
      'currentPrice',
      { type: Sequelize.DataTypes.INTEGER }
    )

    const lastPriceCheck = queryInterface.addColumn(
      'Watchlists',
      'priceUpdatedAt',
      { type: Sequelize.DataTypes.DATEONLY }
    )

    return Promise.all([currPriceCol, lastPriceCheck])
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    const currPriceCol = queryInterface.removeColumn(
      'Watchlists',
      'currentPrice',
    )

    const lastPriceCheck = queryInterface.removeColumn(
      'Watchlists',
      'priceUpdatedAt',
    )
    return Promise.all([currPriceCol, lastPriceCheck])
  }
};
