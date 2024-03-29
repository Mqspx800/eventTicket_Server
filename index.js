const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const userRouter = require('./ORM/userRouter')
const eventRouter = require('./ORM/eventRouter')
const { ticketRouterFac, calculateFlaudRisk } = require('./ORM/ticketRouter')
const commentRouterFac = require('./ORM/commentRouter')
const { Ticket, Comment, User } = require('./ORM/model')
const authRouter = require('./ORM/auth/router')

const sse = require('json-sse')

const port = process.env.PORT || 5000
const app = express()

const stream = new sse()


const corsMiddleWare = cors()
const jsonParser = bodyParser.json()

app.use(corsMiddleWare)
app.use(jsonParser)


let streamId = -1
app.get(
  '/stream/:id',
  async (request, response) => {
    streamId = request.params.id
    const ticket = await Ticket.findByPk(request.params.id,
      { include: [{ model: Comment, required: false, include:{model:User,attributes:['name']} }, { model: User }] })
    const flaudRisk = await calculateFlaudRisk(ticket.id)
    const data = JSON.stringify({ ticket, flaudRisk })
    stream.updateInit(data)
    stream.init(request, response)
  }
)

const updateStream = async () => {
  const ticket = await Ticket.findByPk(streamId,
    { include: [{ model: Comment, required: false, include:{model:User,attributes:['name']} }, { model: User }] })
  const flaudRisk = await calculateFlaudRisk(ticket.id)
  const data = JSON.stringify({ ticket, flaudRisk })
  console.log('updateStream running')
  stream.updateInit(data)
  stream.send(data)
}

const ticketRouter = ticketRouterFac(updateStream)
const commentRouter = commentRouterFac(updateStream)

app.use(userRouter)
app.use(authRouter)
app.use(eventRouter)
app.use(ticketRouter)
app.use(commentRouter)

app.listen(port, () => console.log(`server listening on port ${port}`))
