if (process.env.NODE_ENV !=='production'){
    require('dotenv').config()
}

const express = require('express')
const app = express()
const bcrypt = require('bcrypt')
const flash = require('express-flash')

const session = require('express-session')
const methodOverride = require('method-override')

const initializePassport = require('./passport-config')
const passport = require('passport')
initializePassport(
    passport, //configured
    email => users.find(user => user.email===email),
    
    id => users.find(user => user.id===id),
)
//for experimental use only. do not actually do this in production, use an actual database
const users =[]


app.set('view-engine', 'ejs')
app.use(express.urlencoded({extended: false}))
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET
    //resave: false //says should we resave our session variables, in this case, we do not want to save if nothing is changed
    //saveUninitialized: false
}))
app.use(passport.initialize())

app.use(passport.session())

app.use(methodOverride('_method'))

app.get('/index.html', checkAuthenticated, (req, res) =>{
    res.render('index.ejs', {name: req.user.name})
})

app.get('/login', checkNotAuthenticated, (req, res) =>{
    res.render('login.ejs')
})

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect:'/index.html',
    failureRedirect: '/login',
    failureFlash: true
}))

app.get('/register',checkNotAuthenticated, (req, res) =>{
    res.render('register.ejs')
})

app.post('/register',checkNotAuthenticated, async (req,res)=> {
    try{
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        users.push({
            id: Date.now().toString(),
            name: req.body.name,
            email: req.body.email,
            password:hashedPassword
        })
        res.redirect('/login')
    }catch{
        req.redirect('/register')
    }
    console.log(users)
})

app.delete('/logout',(req, res)=>{

    req.logOut()
    res.redirect('/login')
}

)

function checkAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        return next()
    }

    res.redirect('/login')
}

function checkNotAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        return res.redirect('/index.html')
    }
    next()
}
app.listen(3000)