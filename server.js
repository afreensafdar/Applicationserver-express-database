const express = require("express");
const { check, validationResult } = require('express-validator'); //Express Validator
const path = require('path'); //a node native module
const {Restaurant,Menu,Item} = require('./models/index');

const app = express();
const port = 3000;

//Q: What does express.static help us do? it's for static files 
//Q: What do you think path.join helps us do?  _dirname is the path of directory 
app.use(express.static(path.join(__dirname, 'public')))

// Add this boilerplate middleware to successfully use req.body
//Express can read JSON and URL encoded request bodies.
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

//will add routes
// 1)client makes a request -> request URL -> URL -> http request -> http response

//will add routes
app.get('/', (req, res) => {
	res.send('hello world')
})

app.get('/items', async (req, res) => {
//goes into the database and looks for all Items
    const allItems = await Item.findAll()
    //server will respond with all the items found in the database
    res.json(allItems)
})

app.get('/menus', async (req, res) => {
    const allMenus = await Menu.findAll()
    res.json(allMenus)
})

app.get('/randomItem', async (req, res) => {
    const randomNum = Math.floor(Math.random() * 3)
    const randomItem = await Item.findByPk(randomNum)
    res.json(randomItem)
})

app.get('/restaurants', async (req, res) => {
    const allRestaurants = await Restaurant.findAll()
    res.json(allRestaurants)
})
//client makes a request to the webserver
// app.get('/flipcoin', (req, res) => {
//     //define a function that returns heads or tails
//     const coinflip = !Math.floor(Math.random() * 2) ? 'Heads' : 'Tails' // 1 -> heads truthy : 0 ->tails bc falsy
//    //server is returning a response
//     res.send(coinflip)
// })

app.get("/flipcoin", (request, response) => {
    const randomNumber = Math.floor(Math.random() * 2);
    if(randomNumber === 1){
        response.send("heads");
    }else{
        response.send("tails");
    }
})

//Route Params
//GET restaurants/:id
/** req.params is an object
    *this params object contains any URL parameters we state in this route's path (eg id)
    *Access its values just as any obj property/key
    *we can then find the restaurants with that id 
    *and send the user as response.
    */

app.get('/restaurants/:id', async (req, res) => {
    let restaurant = await Restaurant.findByPk(req.params.id, {include :Menu});
	res.json({restaurant})
})

    //eager loading! We can nest include blocks, to fetch associations of associations restuarant-menu-item
    app.get('/restaurants/:id', async (req, res) => {
    const restaurant = await Restaurant.findByPk(req.params.id, {include : {
        model : Menu,
        include: Item
    }});
    res.json({ restaurant })
})


app.get('/menus/:id', async (req, res) => {
	let menu = await Menu.findByPk(req.params.id,{include :Item});
	res.json({menu})
})

//Get Menu by name, using WHERE

app.get('/menus/name/:title', async (req, res) => {
    //General querying with association using include
    const menu = await Menu.findAll({
        where: {
            title : req.params.title 
        }
    })
    res.json({ menu })
})

app.get('/:message/', (req, res) => {
    res.send(`<h1>req.params.message is ${req.params.message}`);
})

//whatever we add after : becomes a key on req.params
app.get('/:message1/:message2', (req, res) => {
    res.send(`<h1>req.params.message1 is ${req.params.message1} 
    </h1> <h2>req.params.message2 is ${req.params.message2} </h2>`);
})

//REST+CRUD
//testing on postman

// Add new restaurant
// app.post('/restaurants', async (req, res) => {
// 	let newRestaurant = await Restaurant.create(req.body);
// 	res.send('Restaurant Created Successfully!')
// })

// app.post('/restaurants', (req, res) => {    
//     console.log(req.body);
//     // use the data in req.body to add a new restaurant to the database
//     res.sendStatus(201);
// })


//Express-Validator
//add validation to your route, to escape any HTML characters in the restaurant name field.
app.post('/restaurants', [
    check('name')
    .not()
    .isEmpty().withMessage("name cannot be empty")
    .trim()
    .escape()
    .isLength({max :20 }).withMessage('Name must be maximum 20 chars long')
    .isAlpha().withMessage("Name must be only Alphabetical chars")
    .isWhitelisted(["L","S","M","G"]),

    check('location')
    .not()
    .isEmpty().withMessage("location cannot be empty")
    .trim()
    .escape()
    .isLength({min:3}).withMessage("Location must be atleast 3 chars"),

    check('cuisine')
    .not()
    .isEmpty().withMessage("cuisine cannot be empty")
    ], async (req, res) => {
    const errors = validationResult(req)
    console.log("errors",errors)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    } else {
        let newRestaurant=await Restaurant.create(req.body);
        res.send("Restaurant Created")
    }
})

// Delete a restaurant

app.delete('/restaurants/:id', async (req, res) => {
	await Restaurant.destroy({
		where : {id : req.params.id} // Destory a restaurant where this object matches
	})
	res.send("Restaurant Deleted!!")
})

// Update a restaurant-put 
//in postman app s.elect body-raw and json
//or body -x-www-form-urlended and enter key-values
app.put("/restaurants/:id", async (req, res) => {
	let updated = await Restaurant.update(req.body, {
		where : {id : req.params.id} // Update a restaurant where the id matches, based on req.body
	})
	res.send("Restaurant Updated!!")
})

//put is update all the model or entity properties completely whereas patch is to update a particular property like only name

// Update a restaurant-patch
app.patch("/restaurants/:id", async (req, res) => {
	let updated = await Restaurant.update(req.body, {
		where : {id : req.params.id} // Update a restaurant where the id matches, based on req.body
	})
	res.send("Restaurant Updated Successfully!!")
})

//Menu -postman crud operations

// app.post('/menus', async (req, res) => {
// 	let newMenu = await Menu.create(req.body);
// 	res.send('Menu added Successfully!')
// })

//Express-Validator for Menu
//add validation to your route.
app.post('/menus', [
    check('title')
    .not()
    .isString()
    .isEmpty().withMessage("title cannot be empty")
    .trim()
    .escape()
    .isLength({max :20 }).withMessage('title must be maximum 20 chars long')
    .isAlpha().withMessage("title must be only Alphabetical chars"),

    check('RestaurantId')
    .isLength({max:10}).withMessage("Id must be maximum 30 chars")
    .not()
    .isEmpty().withMessage("Id cannot be empty")
    .isNumeric().withMessage("Must be a number")
    .isWhitelisted(["1","2","3","4"])
    .blacklist('@','#', '\\')
    

    ], async (req, res) => {
    const errors = validationResult(req)
    console.log("errors",errors)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    } else {
        let newMenu=await Menu.create(req.body);
        res.send("Menu Created")
    }
})

app.delete('/menus/:id', async (req, res) => {
	await Menu.destroy({
		where : {id : req.params.id} // Destory a menu where this object matches
	})
	res.send("Menu Deleted!!")
})

app.put("/menus/:id", async (req, res) => {
	let updatedMenu = await Menu.update(req.body, {
		where : {id : req.params.id} // Update a menu where the id matches, based on req.body
	})
	res.send("Menu Updated!!")
})

app.patch("/menus/:id", async (req, res) => {
	let updatedMenu1 = await Menu.update(req.body, {
		where : {id : req.params.id} // Update a menu where the id matches, based on req.body
	})
	res.send("Menu Updated Successfully!!")
})

//Item crud operations

// app.post('/items', async (req, res) => {
// 	let newItem = await Item.create(req.body);
// 	res.send('Item added Successfully!')
// })

//Express-Validator for Menu
//add validation to your route, to escape any HTML characters in the restaurant name field.
app.post('/items', [
    check('name')
    .not()
    .isEmpty().withMessage("`name cannot be empty")
    .isLength({max :20 }).withMessage('name must be maximum 20 chars long'),

    check('image')
    .not()
    .isEmpty().withMessage("name cannot be empty")
    .isURL({ require_protocol: true }).withMessage("invalid url"),

    check('price')
    .not()
    .isEmpty().withMessage("price cannot be empty")
    .isFloat().withMessage("must be a valid price")
    .isLength({max:3}).withMessage("Id must be maximum 3 chars"),

    check('vegetarian')
    .not()
    .isEmpty().withMessage("Cannot be empty")
    .isBoolean(),

    check('MenuId')
    .not()
    .isEmpty().withMessage("Id cannot be empty")
    .isNumeric().withMessage("Must be a number")
    .isLength({max:5}).withMessage("Id must be maximum 5 chars")


    ], async (req, res) => {
    const errors = validationResult(req)
    console.log("errors",errors)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    } else {
        let newItem=await Item.create(req.body);
        res.send("Item Created")
    }
})

app.delete('/items/:id', async (req, res) => {
	await Item.destroy({
		where : {id : req.params.id} // Destory an item where this object matches
	})
	res.send("Oh! Item Deleted!!")
})

app.put("/items/:id", async (req, res) => {
	let updatedItem = await Item.update(req.body, {
		where : {id : req.params.id} // Update an item entity complelety where the id matches, based on req.body
	})
	res.send("Item Updated Successfully!!")
})

app.patch("/items/:id", async (req, res) => {
	let updatedItem1 = await Item.update(req.body, {
		where : {id : req.params.id} // Update an item particular property where the id matches, based on req.body
	})
	res.send("Item Updated Successfully!!")
})


//Q: What will our server be doing? listen to client request based on port 3000 created.
app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});



//to run seed.js npm run seed  package json have "seed": "node seed"
//to start server npm start   as package-json have "start":"node server.js"
//to stop server ctrl+c
//to run express-validator npm install express-validator or npm install --save express-validator and import express-validator
//always start the server to test on postman app 
    