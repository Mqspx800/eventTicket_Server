const { User } = require('../model')
const { toData } = require('./jwt')

function auth(req, res, next) {
  const auth = req.headers.authorization && req.headers.authorization.split(' ')
  console.log('email', req.headers.authorization)
  if (auth && auth[0] === 'Bearer' && auth[1]) {
    try {
      const data = toData(auth[1])
      User
        .findByPk(data.id)
        .then(user => {
          if (!user) return next('User does not exist')
          req.user = user
          next()
        })
        .catch(next)
    }
    catch (error) {
      res.status(400).send({
        message: `Error ${error.name}: ${error.message}`,
      })
    }
  }
  else {
    res.status(401).send({
      message: 'Please login before performing this action'
    })
  }
}

// async function authWithTicketOwner(req, res, next) {
//   const auth = req.headers.authorization && req.headers.authorization.split(' ')
//   if (auth && auth[0] === 'Bearer' && auth[1]) {
//     try {
//       const data = toData(auth[1])
//       const user = await User.findByPk(data.id)
//       if (!user) return next('User not exist')
//       if (data.id != req.body.userId)
//         return next('You are not authrized to perform this action')
//       req.user = user
//       next()
      // User
      //   .findByPk(data.id)
      //   .then(user => {
      //     if (!user) return next('User does not exist')
      //     req.user = user
      //     next()
      //   })
      //   .catch(next)
//     }
//     catch (error) {
//       res.status(400).send({
//         message: `Error ${error.name}: ${error.message}`
//       })
//     }
//   }
//   else {
//     res.status(401).send({
//       message: 'This action require login before executing'
//     })
//   }
// }

module.exports =  auth 