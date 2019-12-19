const express = require('express')
const session = require('express-session')
const app = express()
const fs = require('fs')
const dotenv = require('dotenv').config();

const port = 7811
const messages = []

const Sequelize = require('sequelize');

let databaseHost = process.env['BLOG_DATABASE_HOST'];
let databasePort = process.env['BLOG_DATABASE_PORT'];
let databaseDialect = process.env['BLOG_DATABASE_DIALECT'];
let databaseName = process.env['BLOG_DATABASE_NAME'];
let databaseUser = process.env['BLOG_DATABASE_USER'];
let databasePassword = process.env['BLOG_DATABASE_PASSWORD'];

const database = new Sequelize(databaseName, databaseUser, databasePassword, {
        'host': databaseHost,
        'port': databasePort,
        'dialect': databaseDialect,
        'dialectOptions': {
                'charset' : 'utf8'
        }
});

const data = database.define('Message', {
        'name': {
                'type': Sequelize.STRING,
                'allowNull': false
        },
        'content': {
                'type': Sequelize.STRING,
                'allowNull': false
        }
})


app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))
app.set('view engine', 'ejs')
app.use(session ({
        secret: 'some random secret',
        resave: false,
        saveUninitialized: true,
        cookie: { secure: false }
}))

app.use((request, response, next) => {
        if (!request.session.errors) {
                request.session.errors = []
        }

        next();
})

app.get('/', (request, response) => {
        data.findAll().then(messages => {
                response.render("index", {
                        messages: messages,
                        session : request.session
                })
        }).catch(error => {
                console.error(error);
        })
})


app.post('/entry/create', (request, response) => {
        const body = request.body
        let errors = request.session.errors

        const name = body.name
        if (!name) {
                request.session.errors.push("The name must be provided")
        }
        const message = body.message
        if (!message) {
                request.session.errors.push("The message must be provided")
        }
        if (errors.length === 0) {
                data.create({
                        'name': name,
                        'content': message
                }).catch(error => {
                        console.error(error);
                })
        }

        response.redirect('/');
})

database.sync().then(() => {
}).then(() => {
        app.listen(port, () => console.log(`The guestbook server is listening on port ${port}.`))
});