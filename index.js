var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');

var app = express();
var expressValidator = require('express-validator')

var amqp = require('amqplib/callback_api');

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

// Body Parser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
// Express Validator Middleware
app.use(expressValidator());

// Global Variables
app.use(function (req, res, next) {
    res.locals.errors = null;
    next();
})

app.get('/', function (req, res) {
    // var title = 'Customers'
    res.render('index', {
        title: 'Customers'
    });
})

app.post('/users/add', function (req, res) {
    req.checkBody('first_name', 'First Name is required').notEmpty();
    req.checkBody('birthday', 'Birthday is required').notEmpty();
    req.checkBody('email', 'Email is required').notEmpty();
    req.checkBody('cell', 'Mobile is required').notEmpty();
    req.checkBody('password', 'Password is required').notEmpty();

    var errors = req.validationErrors();

    if (errors) {
        res.render('index', {
            title: 'Customers',
            errors: errors
        });
        console.log(errors)
    }
    else {
        console.log('Success');
        var newUser = {
            firstName: req.body.first_name,
            birthday: req.body.birthday,
            email: req.body.email,
            cell: req.body.cell,
            password: req.body.password
        }
        var q = 'q'
        var url = process.env.CLOUDAMQP_URL || "amqp://spbdyewq:0PfDzWG1GiXAe5pNVv4u6WPdl9qF60cf@eagle.rmq.cloudamqp.com/spbdyewq";
        var open = require('amqplib').connect(url);
        open.then(function (conn) {
            var ok = conn.createChannel();
            ok = ok.then(function (ch) {
                ch.assertQueue(q);
                ch.sendToQueue(q, new Buffer(JSON.stringify(newUser)))
            });
            return ok;
        }).then(null, console.warn);
        console.log(newUser)

        // Consumer
    }
})

app.listen(process.env.PORT || 3000, function () {
    // console.log("Server started on port 3000")
})