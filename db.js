const Sequelize = require('sequelize')
const baseURL = process.env.DATABASE_URL || 'postgres://postgres:secret@localhost:5432/postgres'

const db = new Sequelize(baseURL)

db.sync({force:false})
.then(_=>console.log('Database is up and running'))

module.exports = db
