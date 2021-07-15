const express = require("express");
const path = require('path'); //a node native module
const {Restaurant,Menu,Item} = require('./models/index');

const app = express();
const port = 3000;

//Q: What does express.static help us do? it's for static files 
//Q: What do you think path.join helps us do?  _dirname is the path of directory 
app.use(express.static(path.join(__dirname, 'public')))

// Add this boilerplate middleware to successfully use req.body
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

    //eager loading! We can nest include blocks, to fetch associations of associations
    // const restaurant = await Restaurant.findByPk(req.params.id, {include : {
    //     model : Menu,
    //     include: Item
    // }});
    // res.json({ restaurant })


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
app.post('/restaurants', async (req, res) => {
	let newRestaurant = await Restaurant.create(req.body);
	res.send('Restaurant Created Successfully!')
})

// Delete a restaurant

app.delete('/restaurants/:id', async (req, res) => {
	await Restaurant.destroy({
		where : {id : req.params.id} // Destory a restaurant where this object matches
	})
	res.send("Restaurant Deleted!!")
})

// Update a restaurant
app.put("/restaurants/:id", async (req, res) => {
	let updated = await Restaurant.update(req.body, {
		where : {id : req.params.id} // Update a restaurant where the id matches, based on req.body
	})
	res.send("Restaurant Updated!!")
})


//Q: What will our server be doing? listen to client request based on port 3000 created.
app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
