const express=require("express");
const app = require("express")();
const server = require("http").createServer(app);
const port = process.env.PORT || 3000;



const session = require("express-session");
const bodyParser = require("body-parser");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
var alert = require('alert')
var UserController = require('./controllers/UserController')

var multer  = require('multer')
var upload = multer({ dest: 'uploads/' })

const ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn;
const ensureLoggedOut = require('connect-ensure-login').ensureLoggedOut;

const sessionMiddleware = session({ secret: "changeit", resave: false, saveUninitialized: false });
app.use(sessionMiddleware);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(passport.initialize());
app.use(passport.session());

app.use( express.static("views"));
app.use('/uploads', express.static('uploads'));


const mongoose = require('mongoose');
const { Int32 } = require("mongodb");
mongoose.connect('mongodb://ER:ER123@cluster0-shard-00-00.2iigr.mongodb.net:27017,cluster0-shard-00-01.2iigr.mongodb.net:27017,cluster0-shard-00-02.2iigr.mongodb.net:27017/test?authSource=admin&replicaSet=atlas-wlvhze-shard-0&readPreference=primary&appname=MongoDB%20Compass&ssl=true', {useNewUrlParser: true, useUnifiedTopology: true});
var bikes = require('./controllers/BikesController');
var reserva = require('./controllers/ReservaController');
const res = require("express/lib/response");
const { redirect } = require("express/lib/response");

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    console.log('Connected!');
});

//Set the schema
const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    imagem: String
});

const reservaSchema = new mongoose.Schema({
    UserID: String,
    bikeID: String,
    bikeModel: String,
    inicio: String,
    fim: String
})

const bikeSchema = new mongoose.Schema({
    modelo: String,
    Reservada: Boolean
})


//Set the behaviour
userSchema.methods.verifyPassword = function (password) {
    return password === this.password;
}

//Compile the schema into a model
const User = mongoose.model('User', userSchema);
const Reserva= mongoose.model('reserva', reservaSchema);
const Bikes = mongoose.model('bikes', bikeSchema);



passport.use(new LocalStrategy(function(username, password, done) {
    User.findOne({ username: username }, function (err, user) {
        if (err) { return done(err); }
        if (!user) { return done(null, false); }
        if (!user.verifyPassword(password)) { return done(null, false); }
        return done(null, user);
    });
}));


app.get("/", (req, res) => {
    res.render("index.ejs");
});

app.get("/login", (req,res) => {
    const isAuthenticated = !! req.user;
    if (isAuthenticated) {
        
        return res.redirect('/logout');
    }else{
        return res.render('login.ejs');
       
    }
});

app.get("/logout", (req, res) => {
    res.render("logout.ejs");
});

app.get("/Reservas", (req,res) => {

    res.render('Reservas.ejs');

});
var idbike="";
var idbike2="";
var iduser="";
var inicio2="";
var horas2="";
var modelobike=""
app.post("/Agendar", ensureLoggedIn('/login'), (req,res) => {
    modelobike= req.body.modelo;
    var resu="";
    
    bikes.getBike(db,req.body._id, req.body.modelo, function(result){
        //console.log(result);
        try {
            resu=result[0]._id;
            idbike=resu;
            idbike2=result[0].bikeID;
            iduser=req.user.username;
            //console.log(req.body.modelo);
            return res.render('Agendar.ejs');
        } catch (error) {
            alert("no bike available");
            return res.render('index.ejs');
            
        }
    });  
     
    
});
var datafim="";

app.post("/pagar", ensureLoggedIn('/login'), (req,res) => {
    horas2=req.body.duracao;
    inicio2=req.body.inicio + " " + req.body.hora;
    var date = new Date(inicio2);
    date.setTime(date.getTime() + (horas2 * 60 * 60 * 1000));
    datafim=date.toString();
    //console.log("horas",horas2);    
    //console.log("fim data",date.toString());
    res.render('pagar.ejs');
});


app.get("/Informacao",(req,res) => {

    res.render('Informacao.ejs');

});

app.get("/register", ensureLoggedOut('/'), (req, res) => {
    res.render("register.ejs");
});


app.post("/login", ensureLoggedOut('/'),passport.authenticate("local", {
        successRedirect: "/",
        failureRedirect: "/",
    })
);




app.post("/register", ensureLoggedOut('/'), upload.single('imagemPerfil') ,function(req,res){
    //New User in the DB
    UserController.UsernameTaken(db, req, function(result) {
        if(result.length !==0) {
            res.redirect('register')
            alert("O username introduzido já está em uso!");
        }else {
            if (req.file === undefined) {
                const instance = new User({username: req.body.username, password: req.body.password, imagem: null,});
                instance.save(function (err, instance) {
                    if (err) return console.error(err);

                    //Let's redirect to the login post which has auth
                    res.redirect(307, '/login');
                });
            } else {
                const instance = new User({
                    username: req.body.username,
                    password: req.body.password,
                    imagem: req.file.filename,
                });
                instance.save(function (err, instance) {
                    if (err) return console.error(err);

                    //Let's redirect to the login post which has auth
                    res.redirect(307, '/login');
                });
            }
        }
    })
});

app.post("/complete", ensureLoggedIn('/'),(req, res)=>{
    res.render('completo.ejs')
    var final;
    final= datafim.split(":00 GMT");
    const instance =  new Reserva({UserID: iduser, bikeID: idbike, bikeModel: modelobike, inicio:inicio2,fim:final[0],});
    instance.save(function (err, instance) {
        if (err) return console.error(err);

    });
    Bikes.findOneAndUpdate({ _id:idbike  }, { Reservada: true }, function(err,result ) {
    });
})

app.post("/logout", ensureLoggedIn('/'), (req, res) => {
    console.log(`logout ${req.session.id}`);
    const socketId = req.session.socketId;
    if (socketId && io.of("/").sockets.get(socketId)) {
        console.log(`forcefully closing socket ${socketId}`);
        io.of("/").sockets.get(socketId).disconnect(true);
    }
    req.logout();
    res.cookie("connect.sid", "", { expires: new Date() });
    res.redirect("/");
});


app.post("/Reservas", ensureLoggedIn('/'), function(req,res) {
    res.render('Reservas.ejs'); 
})
var myReservas;
app.get("/minhasreservas",ensureLoggedIn('/login'), function(req,res) {
    var resu="";
    reserva.getReserva(db,req.body._id, req.user.username, function(result){
        
        myReservas=result;
        //console.log(myReservas);
        try {
            resu=result[0]._id;
            idbike2=result[0].bikeID;
            idbike=resu;
            iduser=req.user.id;
            return res.render('minhasreservas.ejs'); 
           
        } catch (error) {
            alert("Não tem reservas");
            return res.render('index.ejs');
            
        }

    });  
    
})
app.post("/minhasreservas",ensureLoggedIn('/login'), function(req,res) {
    
    Reserva.findByIdAndDelete({_id:idbike}, function (err, docs) {
        if (err){
            console.log(err)
        }
        else{
            console.log("Deleted Reserva : ", docs);  
        }
    });
    Bikes.findByIdAndUpdate({_id:idbike2},{Reservada:false},{new:true}, function (err, docs) {
        if (err){
            console.log(err)
        }
        else{
            console.log("updated bike : ", docs);
        }
    });
    res.render('index.ejs');
    
}) 
    




passport.serializeUser((user, cb) => {
    console.log(`serializeUser ${user.id}`);
    cb(null, user.id);
});

passport.deserializeUser((id, cb) => {
    //console.log(`deserializeUser ${id}`);
    User.findById(id, function (err, user) {
        if (err) { return cb(err); }
        cb(null, user);
    });
});

const io = require('socket.io')(server);

// convert a connect middleware to a Socket.IO middleware
const wrap = middleware => (socket, next) => middleware(socket.request, {}, next);

io.use(wrap(sessionMiddleware));
io.use(wrap(passport.initialize()));
io.use(wrap(passport.session()));

io.use((socket, next) => {
    if (socket.request.user) {
        next();
    } else {
        next(new Error('unauthorized'))
    }
});

io.on('connect', (socket) => {
    console.log(`new connection ${socket.id}`);
    socket.on('whoami', (cb) => {
        cb(socket.request.user.username);
    });

    const session = socket.request.session;
    //console.log(`saving sid ${socket.id} in session ${session.id}`);
    session.socketId = socket.id;
    session.save();


    socket.on('myreservas', (cb) => {
        reserva.VerReserva(db,socket,function (result){
            cb(result);
            //console.log("res SOCKET",result[0].UserID);
                       
        })
      
    });
});

server.listen(port, () => {
    console.log(`application is running at: http://localhost:${port}`);
});