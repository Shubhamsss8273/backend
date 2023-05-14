require('dotenv').config()
const express = require('express');
const app = express();
const connectToDb = require('./dbconnection.js');
const port = process.env.PORT;
const msg = require('./routes/message.js')
const session = require('express-session');
const mongoStore = require('connect-mongo');
const auth = require('./routes/auth.js');
const passport = require('passport');
const cors = require('cors');
const notebook = require('./routes/notebook.js');
const admin = require('./routes/admin.js');

// To connect to the DB
connectToDb();

// For cors configuration:
const corsOptions = {
    origin: 'http://localhost:3000',
    credentials: true,
}

app.use(cors(corsOptions));
app.use(express.json());

// To create a session store in DB
const sessionStorage = mongoStore.create({
    mongoUrl: process.env.MONGO_URL,
    dbName: process.env.DB_NAME,
    autoRemove: 'native',
    ttl: 24 * 60
})

// To use session in our app
app.use(session({
    name: 'SSID',
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 8 * 24 * 60 * 60 * 1000 },
    // To store session in DB
    store: sessionStorage
}))


// To intitialize the passport for whole application
app.use(passport.initialize());
// To use the express session for storing the user 
app.use(passport.session());
app.use('/api/message', msg);
app.use('/api/auth', auth);
app.use('/api/notebook', notebook);
app.use('/api/admin', admin);

// Non existing Route Handler
app.get('/*', (req, res) => {
    res.status(404).json({ error: 'The requested route is not found' });
})

//Error Handling middleware
app.use((err, req, res, next) => {
    res.status(500).json({ error: "Uh Oh! Some error occurred" });
    console.log(err)
})

app.listen(port);