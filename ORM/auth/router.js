const { Router } = require('express')
const { toJWT, toData } = require('./jwt')
const router = new Router()
const { User } = require('../model')
const bcrypt = require('bcrypt')

router.post('/login', (req, res) => {
  const { email, password } = req.body
  if (!email || !password) {
    res.status(400).send({
      message: 'Please provide a valid email and password'
    })
  }
  else {
    User
      .findOne({
        where: {
           email
        }
      })
      .then(entity => {
        if (!entity) {
          res.status(400).send({
            message: 'User with that name does not exist'
          })
        }
        if (bcrypt.compareSync(password, entity.password)) {
          res.json({
            jwt: toJWT({ id: entity.id }),
            id: entity.id,
            name: entity.name
          })
        }
        else {
          res.status(400).send({
            message: 'Password was incorrect'
          })
        }
      })
      .catch(err => {
        console.error(err)
        res.status(500).send({
          message: 'Something went wrong'
        })
      })
  }
})


module.exports = router