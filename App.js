const express = require('express')
const path = require('path')
const exphbs = require('express-handlebars')
const methodOverride = require('method-override')
const flash = require('connect-flash')
const session = require('express-session')
const bodyParser = require('body-parser')
const passport = require('passport')
const mongoose = require('mongoose')

const app = express()

// load routes
const ideas = require('./routes/ideas')
const users = require('./routes/users')

// passport config
require('./config/passport')(passport)

// connect to mongoose
mongoose.connect('mongodb://localhost/vidjot', {
  useNewUrlParser: true
})
  .then(() => console.log('MongoDB Connected!'))
  .catch(error => console.log(error))

// handlebars middleware
app.engine('handlebars', exphbs({defaultLayout: 'main'}))
app.set('view engine', 'handlebars')

// body parser middleware
app.use(bodyParser.urlencoded({ extended: false}))
app.use(bodyParser.json())

// static folder
app.use(express.static(path.join(__dirname, 'public')))

// methodOverride middleware (for put requests)
app.use(methodOverride('_method'))

// express session middleware
app.use(session({
  secret: 'donkey',
  resave: true,
  saveUninitialized: true
}))

// connect flash
app.use(flash())

// global variables
app.use(function(req ,res, next) {
  res.locals.success_message = req.flash('success_message')
  res.locals.error_message = req.flash('error_message')
  res.locals.error = req.flash('error')
  next()
})

// index route
app.get('/', (req, res) => {
  const title = "Welcome"
  res.render('index', {
    title: title
  })
})

// about route
app.get('/about', (req, res) => {
  res.render('about')
})

// use routes
app.use('/ideas', ideas)
app.use('/users', users)

const port = 5000
app.listen(port, () => {
  console.log(`Server started on  port ${port}`)
})
