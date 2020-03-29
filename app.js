//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const mongoose = require("mongoose");
const _=require("lodash");
mongoose.connect("mongodb+srv://Kamal:Happy123@cluster0-jof5b.mongodb.net/todoListDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false
});
const itemSchema = {
  name: String
}
const Item = mongoose.model("Item", itemSchema);
const item1 = new Item({
  name: "Welcome to my todoList App"
});
const item2 = new Item({
  name: "Make as many customised lists as you want"
});
const item3 = new Item({
  name: "Hit Enter or click + to add item"
})
const defaultItems = [item1, item2, item3];
const listSchema = {
  name: String,
  items: [itemSchema]
};
const List = mongoose.model("List", listSchema);


app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));
app.set("view engine", "ejs");
app.get("/", function(req, res) {
  Item.find({}, function(err, foundItem) {
    //console.log(foundItem);
  if(!err){
    if (foundItem.length == 0) {
      Item.insertMany(defaultItems, function(err) {
        if (!err) {
          console.log("Successfully inserted the defaults items in the Database");
          res.redirect("/");
        }
      });
    }
    else {
      res.render("list", {
        listTitle: "Today",
        newListItems: foundItem
      });
    }
  }
  });
});
app.get('/:customListName', function(req, res) {
  const customListName = _.capitalize(req.params.customListName);
  List.findOne({
    name: customListName
  }, function(err, foundList) {
    if (!err) {
      if (!foundList) {
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/"+customListName);
      } else {
        console.log(foundList.items);
        res.render("list", {
          listTitle: foundList.name,
          newListItems: foundList.items
        });
      }
    }
  });
});
app.post('/', function(req, res) {
  console.log('post /');
  const itemName = req.body.newItem;
  const listName=req.body.list;

    const item = new Item({
      name:itemName
    });
    if(listName==="Today"){
      item.save();
      res.redirect("/");
    }
    else{
      List.findOne({name:listName},function(err,foundList){
        foundList.items.push(item);
        foundList.save();
        res.redirect("/"+listName);
      });
    }
});

app.post('/delete', function(req, res) {
  console.log('post/delete');
  const checkedItemID = req.body.checkbox;
  const listName=req.body.listName;
  if(listName=="Today"){
    Item.findByIdAndRemove(checkedItemID, function(err) {
      if (!err) {
        console.log("Successfully deleed the item with id=" + checkedItemID);
        res.redirect("/");
      } else {
        console.log(err);
      }
    });
  }
  else{
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemID}}},function(err,foundList){
      if(!err){
        res.redirect('/'+listName);
      }
    });
  }
});

app.get('/about', function(req, res) {
  res.render("about");
});
let port=process.env.PORT;
if(port==null||port==""){
  port=3000;
}
app.listen(port, function() {
  console.log("Listening on port 3000");
});
