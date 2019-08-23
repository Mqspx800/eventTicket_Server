const { User } = require('./model')
const { Router } = require('express')
const router = new Router()
const bcrypt = require('bcrypt')
const Sequelize = require('sequelize')
const {toJWT}=require('../ORM/auth/jwt')

router.post('/user', async (req, res) => {
  try {
    let = { name, email, password } = req.body
    password = bcrypt.hashSync(password, 10)
    const userExist = await User.findOne({
      where: Sequelize.or(
        { name },
        { email }
      )
    })
    if (userExist)
      res.status(405).send({ message: 'Either the name or email has been taken' })
    else {
      const user = await User.create({ name, email, password })
      res.json({
        jwt: toJWT({ id: user.id }),
        id: user.id,
        name: user.name
      })
    }
  } catch (err) {
    console.error(err)
    res.status(400).send()
  }
})

router.get('/user/:id', async (req, res) => {
  const user = await User.findByPk(req.params.id)
  if (user)
    res.json({ user })
  else res.status(400).send(`user with id ${req.params.id} not found`)
})

router.get('/users', (req, res, next) => {
  User.findAll()
    .then(users => {
      res.json({ users })
        .catch(err => {
          next(err)
        })
    })
})

module.exports = router
