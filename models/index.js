const {sequelize} = require('../db')
const {Restaurant} = require('./Restaurant')
const {Menu} = require('./Menu')
const {Item} = require('./Item')

//associations - What are they? Relationship between tables with foreign key defined
Menu.belongsTo(Restaurant) //Q: What will .belongsTo provide Menu? foreign key in Menu
Restaurant.hasMany(Menu)

Item.belongsTo(Menu)
Menu.hasMany(Item) // what does hasMany provide for us? providing foreign key in Item

module.exports = { Restaurant, Menu, Item } //exporting models w/ associations 
