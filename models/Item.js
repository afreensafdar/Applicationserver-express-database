const {sequelize} = require('../db');
const { DataTypes, Model } = require('sequelize');

class Item extends Model {}

Item.init({
  name: DataTypes.STRING,
  image: DataTypes.STRING,
  price: DataTypes.DECIMAL(5,2),
  vegetarian: DataTypes.BOOLEAN
}, {
  sequelize,
  timestamps: false
})

module.exports = {Item};
