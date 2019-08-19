const { User } = require('./model')
const { Router } = require('express')
const router = new Router()
const bcrypt = require('bcrypt')

router.post('/user', async (req, res) => {
  try {
    let = { name, email, password } = req.body
    password = bcrypt.hashSync(password, 10)
    const users = await User.findAll({ attributes: [name, email] })
    if (users.some(u => u.name === name) || users.some(u.email === email))
      res.status(405).send('Either the name or email has been taken')
    else {
      const newUser = await User.create({ name, email, password })
      res.json({ newUser })
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