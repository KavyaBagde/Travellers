module.exports.isLogin = (req , res , next)=>{
    if(!req.isAuthenticated()){
    req.session.RedirectUrl = req.originalUrl;
    req.flash("error" , "Please login first !");
    return res.redirect("/login");
  }
  next();
}

module.exports.saveRedirectUrl = (req ,res ,next) =>{
  if(req.session.RedirectUrl){
    res.locals.RedirectUrl = req.session.RedirectUrl;
  }
  next();
}