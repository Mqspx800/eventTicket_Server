const { Comment } = require('./model')
const { Router } = require('express')
const router = new Router()
const auth = require('./auth/middleware')



function commentRouterFactory(updateStream) {

  router.post('/comment',auth, async (req, res) => {
    const { text, userId, ticketId } = req.body
    console.log(req.body)
    if (!text || text === '') res.status(422).send('not allow to post empty comment')
    if (userId) {
      const comment = await Comment.create({ text, userId: parseInt(userId),ticketId: parseInt(ticketId) })
      res.json({ comment })
      updateStream()
    } else {
      res.status(422).send('Please login before you try to comment')
    }
  })
  return router
}

module.exports = commentRouterFactory