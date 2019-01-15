const express = require('express')
const exphbs = require('express-handlebars')
const methodOverride = require('method-override')
const flash = require('connect-flash')
const session = require('express-session')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')

const app = express()

// connect to mongoose
mongoose.connect('mongodb://localhost/vidjot', {
  useNewUrlParser: true
})
  .then(() => console.log('MongoDB Connected!'))
  .catch(error => console.log(error))

// load idea model
require('./models/Idea')
const Idea = mongoose.model('ideas')

// handlebars middleware
app.engine('handlebars', exphbs({defaultLayout: 'main'}))
app.set('view engine', 'handlebars')

// body parser middleware
app.use(bodyParser.urlencoded({ extended: false}))
app.use(bodyParser.json())

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

// idea index page route
app.get('/ideas', (req, res) => {
  Idea.find({})
    .sort({date: 'descending'})
    .then(ideas => {
      res.render('ideas/index', {
        ideas: ideas
      })
    })
})

// add idea form route
app.get('/ideas/add', (req, res) => {
  res.render('ideas/add')
})

// edit idea form route
app.get('/ideas/edit/:id', (req, res) => {
  Idea.findOne({
    _id: req.params.id
  })
  .then(idea => {
    res.render('ideas/edit', {
      idea: idea
    })
  })
})

// process form submission
app.post('/ideas', (req, res) => {
  let errors = []
  if(!req.body.title){
    errors.push({text: 'Please add a title'})
  }
  if(!req.body.details){
    errors.push({text: 'Please add some details'})
  }
  if(errors.length > 0) {
    res.render('ideas/add', {
      errors: errors,
      title: req.body.title,
      details: req.body.details
    })
  } else {
    const newUser = {
      title: req.body.title,
      details: req.body.details
    }
    new Idea(newUser)
      .save()
      .then(idea => {
        req.flash('success_message', 'Video idea saved!')
        res.redirect('/ideas')
      })
  }
})

// process edit form submission
app.put('/ideas/:id', (req, res) => {
  Idea.findOne({
    _id: req.params.id
  })
  .then(idea => {
    idea.title = req.body.title
    idea.details = req.body.details

    idea.save()
      .then(idea => {
        req.flash('success_message', 'Video idea updated!')
        res.redirect('/ideas');
      })
  })
})

// process delete idea
app.delete('/ideas/:id', (req, res) => {
  Idea.deleteOne({_id: req.params.id})
    .then(() => {
      req.flash('success_message', 'Video idea removed!')
      res.redirect('/ideas')
    })
})


const port = 5000
app.listen(port, () => {
  console.log(`Server started on  port ${port}`)
})
