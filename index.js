// console.log('hello');


var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');

var app = express();
var expressValidator = require('express-validator')

// var logger = function(req,res,next){
//     console.log('Logging..')
//     next()
// }

// app.use(logger)

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))


// Body Parser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));


// Express Validator Middleware
app.use(expressValidator()); 


// Global Variables
app.use(function(req,res,next){
    res.locals.errors = null;
    next();
})

app.get('/',function(req,res){
    // var title = 'Customers'
    res.render('index', {
        title: 'Customers'
    });
})


app.post('/users/add',function(req,res){
    req.checkBody('first_name', 'First Name is required').notEmpty();
    req.checkBody('last_name', 'Last Name is required').notEmpty();
    req.checkBody('email', 'Email is required').notEmpty();

    var errors = req.validationErrors();

    if (errors){
        res.render('index', {
            title: 'Customers',
            errors: errors
        });
        console.log(errors)
    }
    else {
        console.log('Success');
        var newUser = {
            firstName : req.body.first_name,
            lastName : req.body.last_name,
            email : req.body.email
        }
        console.log(newUser)
    }
    
})

app.listen(3000, function(){
    console.log("Server started on port 3000")
})