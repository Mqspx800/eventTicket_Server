const Sequelize = require('sequelize')
const db = require('../db')


const Event = db.define('event',{
  name:{type:Sequelize.STRING, unique:true},
  description:Sequelize.STRING,
  picture:Sequelize.STRING,
  startDate:Sequelize.DATE,
  endDate:Sequelize.DATE
})

const Ticket = db.define('ticket',{
  price:Sequelize.INTEGER,
  description:Sequelize.STRING,
  picture:Sequelize.STRING
})

const User = db.define('user',{
  name:Sequelize.STRING,
  password:Sequelize.STRING,
  email:Sequelize.STRING
})

const Comment = db.define('comment',{
  text:Sequelize.STRING
})

Ticket.belongsTo(Event)
Event.hasMany(Ticket)
Ticket.belongsTo(User)
User.hasMany(Ticket)
User.hasMany(Comment)
Comment.belongsTo(User)
Comment.belongsTo(Ticket)
Ticket.hasMany(Comment)

module.exports = {Event,Ticket,User,Comment}