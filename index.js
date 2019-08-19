const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const userRouter = require('./ORM/userRouter')
const eventRouter = require('./ORM/eventRouter')
const ticketRouter = require('./ORM/ticketRouter')
const commentRouter = require('./ORM/commentRouter')
const sse = require('json-sse')

const port = process.env.PORT||5000
const app = express()

const corsMiddleWare = cors()
const jsonParser = bodyParser.json()

app.use(corsMiddleWare)
app.use(jsonParser)
app.use(userRouter)
app.use(eventRouter)
app.use(ticketRouter)
app.use(commentRouter)


app.listen(port,()=>console.log(`server listening on port ${port}`))
