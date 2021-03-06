const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const { ensureAuthenticated } = require('../helpers/auth')

// load idea model
require('../models/Idea')
const Idea = mongoose.model('ideas')

// idea index page route
router.get('/', ensureAuthenticated, (req, res) => {
  Idea.find({user: req.user.id})
    .sort({date: 'descending'})
    .then(ideas => {
      res.render('ideas/index', {
        ideas: ideas
      })
    })
})

// add idea form route
router.get('/add', ensureAuthenticated, (req, res) => {
  res.render('ideas/add')
})

// edit idea form route
router.get('/edit/:id', ensureAuthenticated, (req, res) => {
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
router.post('/', ensureAuthenticated, (req, res) => {
  let errors = []
  if(!req.body.title){
    errors.push({text: 'Please add a title'})
  }
  if(!req.body.details){
    errors.push({text: 'Please add some details'})
  }
  if(errors.length > 0) {
    res.render('/add', {
      errors: errors,
      title: req.body.title,
      details: req.body.details
    })
  } else {
    const newUser = {
      title: req.body.title,
      details: req.body.details,
      user: req.user.id
    }
    new Idea(newUser)
      .save()
      .then(idea => {
        req.flash('success_message', 'Idea saved!')
        res.redirect('/ideas')
      })
  }
})

// process edit form submission
router.put('/:id', ensureAuthenticated, (req, res) => {
  Idea.findOne({
    _id: req.params.id
  })
  .then(idea => {
    idea.title = req.body.title
    idea.details = req.body.details

    idea.save()
      .then(idea => {
        req.flash('success_message', 'Idea updated!')
        res.redirect('/ideas');
      })
  })
})

// process delete idea
router.delete('/:id', ensureAuthenticated, (req, res) => {
  Idea.deleteOne({_id: req.params.id})
    .then(() => {
      req.flash('success_message', 'Idea removed!')
      res.redirect('/ideas')
    })
})

module.exports = router
