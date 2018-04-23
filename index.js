const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const expressValidator = require('express-validator');

const amqp = require('amqplib');

// Global Variables
app.use(function (req, res, next) {
  res.locals.errors = null;
  next();
});

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Body Parser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Express Validator Middleware
app.use(expressValidator());

// Page Load Handler
app.get('/', function (req, res) {
  res.render('index', {
    title: 'Customers',
  });
});


const q = 'UserRegistrationQueue2';
const url = (process.env.CLOUDAMQP_URL || 'amqp://spbdyewq:0PfDzWG1GiXAe5pNVv4u6WPdl9qF60cf@eagle.rmq.cloudamqp.com/spbdyewqT') + '?heartbeat=20';
// url += + '?heartbeat=20';

// Form Submit Handler
app.post('/users/add', function (req, res) {
  req.checkBody('first_name', 'First Name is required').notEmpty();
  req.checkBody('birthday', 'Birthday is required').notEmpty();
  req.checkBody('email', 'Email is required').notEmpty();
  req.checkBody('cell', 'Mobile is required').notEmpty();
  req.checkBody('password', 'Password is required').notEmpty();

  const errors = req.validationErrors();

  if (errors) {
    res.render('index', {
      title: 'Customers',
      errors: errors,
    });
  }
  else {
    console.log('Success for form validation');
    const newUser = {
      firstName: req.body.first_name,
      birthday: req.body.birthday,
      email: req.body.email,
      cell: req.body.cell,
      password: req.body.password,
    };

    amqp.connect(url).then(function (conn) {
      return conn.createChannel().then(function (ch) {
        const ok = ch.assertQueue(q);
        return ok.then(function () {
          ch.sendToQueue(q, Buffer.from(JSON.stringify(newUser)));
          return ch.close();
        }).catch(function (error) {
          // console.log('error123');
          res.render('error', {
            title: 'Customers',
            errors: error,
          });
        });
      }).finally(function () {
        conn.close();
        res.render('added');
      });
    }).catch(function (error) {
      // console.log('error345');
      // console.log(error);
      res.render('error', {
        title: 'Customers',
        errors: error,
      });
    });
  }
});

app.listen(process.env.PORT || 3000, function () {
  // console.log('Server started on port 3000')
});
