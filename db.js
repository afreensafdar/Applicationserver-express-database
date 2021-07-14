const { Sequelize } = require('sequelize'); //Q: Why is this Sequelize capitalized? it's a class
const path = require('path'); //a node native module 

//Q: What are we creating down below? Creating database sequelize
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, 'db.sqlite'), //quick way to get the path for our db
    // joining sqlite to directory path
    //_dirname- path to directory folder
});

//Q: Why are we exporting lowercase sequelize?
module.exports = {sequelize}; //as we created database using lowercase sequelize
