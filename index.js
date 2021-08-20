require('dotenv').config({ path: '../.env' });
const express = require("express");
const session = require('express-session');
const MongoStore = require('connect-mongodb-session')(session);
const mongoose = require('mongoose');
const MONGODB_URI = process.env.MONGODB_URI;
const SECRET = process.env.SECRET;
const PORT = process.env.PORT || 3000;
const SESSION_MAX_AGE = 3600000;
const Handlebars = require('handlebars');
const bcrypt = require('bcryptjs');
const csrf = require('csurf');
const exphbs = require('express-handlebars');
const {allowInsecurePrototypeAccess} = require('@handlebars/allow-prototype-access');
const path = require('path');
const s3Routes = require('./routes/s3_routes');
const adminRoutes = require('./routes/admin_routes');
const authRoutes = require('./routes/auth_routes');
const userRoutes = require('./routes/user_routes');
const app = express();
const server = require('http').createServer(app);
const wss = require('./wss').wss; 

const hbs = exphbs.create({
    defaultLayout: 'main',
    extname: 'hbs',
    helpers: require('./helpers/handlebars'),
    handlebars: allowInsecurePrototypeAccess(Handlebars)
});

const varMiddleware = require('./middleware/variables')
const store = new MongoStore({
    collection: 'sessions',
    uri: MONGODB_URI
});
const sessionParser = session({
  saveUninitialized: false,
  secret: SECRET,
  resave: false,
  cookie: {maxAge: SESSION_MAX_AGE},
  store
});
app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', 'views');
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static(path.resolve(__dirname, 'social')));
app.use(sessionParser);
app.use(csrf());
app.use(varMiddleware);
app.use(s3Routes);
app.use(adminRoutes);
app.use(authRoutes);
app.use(userRoutes);

server.on('upgrade', function (request, socket, head) {
  console.log('Parsing session from request...');
  sessionParser(request, {}, () => {
    if (!request.session.user_id) {
      console.log('Non authorized session');
      socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
      socket.destroy();
      return;
    } else {
      console.log(`new ws connetction by user_id: ${request.session.user_id}`);
    }
    console.log('Session is parsed!');
    wss.handleUpgrade(request, socket, head, function (ws) {
      wss.emit('connection', ws, request);
    });
  });
});

async function start () {
    try {
        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useFindAndModify: false,
            useUnifiedTopology: true,
            useCreateIndex: true
        })
        server.listen(PORT, () => {
            console.log(`server has been started on the PORT: ${PORT}...`)
        })
        /* server.listen(4000, () => {
          console.log(`server has been started on the PORT: 4000...`)
      }); */        
    }
    catch (e) {
        console.log(e)
    }
};

start();

module.exports = wss