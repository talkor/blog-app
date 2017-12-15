var express = require("express");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var bodyParser = require("body-parser");
var methodOverride = require("method-override");
var expressSanitizer = require("express-sanitizer");
var app = express();

//App config
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public")); 
app.use(methodOverride("_method"));
app.use(expressSanitizer());
app.set("view engine", "ejs");
mongoose.connect("mongodb://localhost/blog");


//Mongoose model config
var blogSchema = new mongoose.Schema({
    title: String,
    image: String,
    body: String,
    created: {type: Date, default: Date.now}
});
var Blog = mongoose.model("Blog", blogSchema);


//Routes

app.get("/", function(req, res) {
   res.redirect("/blogs"); 
});

//INDEX route
app.get("/blogs", function(req, res) {
    Blog.find({}, function(err, blogs) {
        if (err)
            console.log(err);
        else
            res.render("index", {blogs: blogs});
    });
});

//NEW route
app.get("/blogs/new", function(req, res) {
    res.render("new");
});

//CREATE route
app.post("/blogs/", function(req, res) {
    //Sanitize HTML from user to prevent using Script tags
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.create(req.body.blog, function(err, newBlog) {
        if (err) 
            res.render("new");
        else
            res.redirect("/blogs");
   });
});

//SHOW route
app.get("/blogs/:id", function(req, res) {
    Blog.findById(req.params.id, function(err, foundBlog) {
        if (err) 
            res.redirect("/blogs");
        else
            res.render("show", {blog: foundBlog});
        
    });
});

//EDIT route
app.get("/blogs/:id/edit", function(req, res) {
    Blog.findById(req.params.id, function(err, foundBlog) {
        if (err) 
            res.redirect("/blogs");
        else 
            res.render("edit", {blog: foundBlog});
    });
});

//UPDATE route
app.put("/blogs/:id", function(req, res) {
    //Sanitize HTML from user to prevent using Script tags
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, foundBlog) {
        if (err) 
            res.redirect("/blogs");
        else 
            res.redirect("/blogs/" + req.params.id);
    });
});

//DELETE route
app.delete("/blogs/:id", function(req, res) {
   Blog.findByIdAndRemove(req.params.id, function(err) {
        if (err)
            res.redirect("/blogs");
        else
            res.redirect("/blogs");
   });
});

app.listen(process.env.PORT, process.env.IP, function() {
    console.log("Server has started");
});
