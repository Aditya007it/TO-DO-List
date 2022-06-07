const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require("mongoose");
const _ = require("lodash");
const username = encodeURIComponent("Aditya-Kumar");
const password = encodeURIComponent("Aditya@123");

const app = express();



// use ejs templating
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));


//connect out database with mongoose...
mongoose.connect(`mongodb+srv://${username}:${password}@cluster0.safnd.mongodb.net/todolistDB`,{useNewUrlParser: true});

// database schema..
const todolistSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    }
});
// model
const Item = mongoose.model("item", todolistSchema);

// insert documents
const item1 = new Item({
    name: "welcome to todolist Buy food"
});
const item2 = new Item({
    name: "welcome to todolist cook food"
});
const item3 = new Item({
    name: "welcome to todolist eat food"
});

const defaultItems = [item1, item2, item3];

// Schema for different dynamic route...
const listSchema = new mongoose.Schema({
    name: String,
    items: [todolistSchema]
});

const List = mongoose.model("list", listSchema)

// route for home page
app.get('/', (req, res) => {
    // insert document if array is empty, otherwise not insert..
    Item.find((err, result) => {
        if (result.length === 0) {
            Item.insertMany(defaultItems, (err) => {
                if (err) {
                    console.log(err);
                }
                else {
                    console.log("succesfully inserted");
                }
            });
            res.redirect("/");
        } else {
            res.render("list", { kindDay: "Today", newListItem: result });
        }

    })

});

app.get("/:customeListName", (req, res) => {
    const customeListName = _.capitalize(req.params.customeListName);
    List.findOne({ name: customeListName }, function (err, foundList) {
        if (!err) {
            if (!foundList) {
                // create new list
                const list = new List({
                    name: customeListName,
                    items: defaultItems
                });
                list.save();
                res.redirect("/" + customeListName);
            }
            else {
                // show existing list
                res.render("list", { kindDay: foundList.name, newListItem: foundList.items });
            }
        }
    })


    // res.render("list", { kindDay: "workList", newListItem: workItem });
});


// post data for home page
app.post("/", (req, res) => {
    const itemName = req.body.newItem;
    const listName = req.body.list;
    //run insert command
    const item = new Item({
        name: itemName
    });
    if (listName === "Today") {
        // and then save the data in database
        item.save();

        // then redirect to the /home route for the rendering the item on the screen..
        res.redirect("/");
    } else {
        List.findOne({ name: listName }, function (err, foundList) {
            if (err) {
                console.log(err);
            }
            else {

                foundList.items.push(item);
                foundList.save();
                res.redirect("/" + listName);
            }
        })
    }

});


// Delete the document from the home page....
app.post("/delete", (req, res) => {
    const checkedItemID = req.body.checkbox;
    const listName = req.body.listName;

    if (listName == 'Today') {

        // find id and remove that document
        Item.findByIdAndRemove(checkedItemID, function (err) {
            if (err) {
                console.log(err);
            } else {
                console.log("Item is deleted succesfully");
                res.redirect("/");
            }
        })

    }else{

        List.findOneAndUpdate({name: listName},{$pull: {items: {_id: checkedItemID}}},function(err,result){
            if(err){
                console.log(err);
            }else{
                res.redirect("/" + listName);
            }
        });        

    }

})




//route for dynamic web pages....



let port = process.env.port;
if(port == null || port == ""){
    port = 3000;
}

app.listen(port, () => console.log(`Server listening on port ${port}!`))