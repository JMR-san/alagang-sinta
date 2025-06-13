const express = require('express')
    app = express()

    const db = require('./db')
    userRoutes = require('../controllers/userController')

    app.use('/api/users', userRoutes)


db.query("SELECT 1")
.then( () => {
    console.log('debugger.connection succeeded.')
    app.listen(5500,
        () => console.log('server start at 5500'))
    })
.catch(err=>console.log('db connection failed. \n' + err))

