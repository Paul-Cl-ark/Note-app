module.exports = {
  ensureAuthenticated: function(req, res, next) {
    if (req.isAuthenticated()) {
      return next ()
    }
    req.flash('error_message', 'Please log in or register')
    res.redirect('/users/login')
  }
}
