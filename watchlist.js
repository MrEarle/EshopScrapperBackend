module.exports = (sequelize, DataTypes) => {
  const watchlist = sequelize.define('watchlist', {
    url: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      validate: {
        isUrl: { msg: 'Url ingresado es invalido' },
        notEmpty: { msg: 'Debes incluir url' },
      },
    },
  }, {});
  return watchlist;
};