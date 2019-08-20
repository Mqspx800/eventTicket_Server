const { Ticket, Event, Comment, User } = require('./model')
const { Router } = require('express')
const router = new Router()
const moment = require('moment')
const auth = require('./auth/middleware')

function ticketRouterFac(updateStream) {
  router.post('/ticket', auth, async (req, res) => {
    try {
      const { price, description, userId, eventId, picture, stock } = req.body
      const event = await Event.findByPk(eventId)
      if (!event) res.status(422).send('Event not found!')
      else if (price && description) {
        const ticket = await Ticket.create({ price: parseInt(price), description, picture, userId, eventId, stock })
        res.status(200).json({ ticket })
        updateStream()
      }
    } catch (err) {
      console.error(err)
      res.status(500).send()
    }
  })

  router.put('/ticket/:id', auth, async (req, res) => {
    try {
      const { price, description, eventId, picture } = req.body
      const { user } = req
      const ticket = await Ticket.findOne({ where: { id: req.params.id, eventId } })
      console.log('user.id', user.id, 'userId', ticket.userId)
      if (user.id != ticket.userId) {
        res.status(404).send({ message: 'you are not authrized to make changes on this ticket' }) // check owner
      } else {
        if (ticket) {
          await ticket.update({ price: parseInt(price), description, picture, eventId })
          res.json({ ticket })
          updateStream()
        } else {
          res.status(422).send('Event or ticket is not found')
        }
      }
    } catch (err) {
      console.error(err)
      res.status(500).send
    }
  })

  router.buy('/ticket/buy/:id', auth, async (req, res) => {
    try {
      const { userId, number } = req.body
      const ticket = await Ticket.findByPk(req.params.id)
      if (ticket.stock - parseInt(number) < 0) { res.json({ message: 'not enough stock' }) }
      else if (ticket.stock - parseInt(number) === 0) { ticket.destroy({ where: { id: ticket.id } }) }
      else {
        ticket.update({ stock: stock -= parseInt(number) })
      }
    } catch (err) {
      console.error(err)
      res.status(500).send()
    }
  })

  router.get('/tickets', async (req, res) => {
    try {
      const { eventId } = req.body
      const tickets = await Ticket.findAll({
        where: eventId
      })
      if (tickets) {
        res.json({ tickets })
      } else {
        res.send('no tickets for this event')
      }
    } catch (err) {
      console.error(err)
      res.status(500).send()
    }
  })

  router.get('/ticket/:id', async (req, res) => {
    try {
      const ticket = await Ticket.findByPk(req.params.id,
        { include: [{ model: Comment, required: false }] })
      if (ticket) {
        res.json({ ticket })
      } else {
        res.status(404).send('ticket not found')
      }
    } catch (err) {
      console.error(err)
      res.status(500).send()
    }
  })

  return router
}

async function calculateFlaudRisk(ticketId) {
  let flaudRisk = 0
  const tickets = await Ticket.findAll({ include: { model: Comment, required: false } })
  const ticket = tickets.find((ticket) => ticket.id === ticketId)
  const adveragePrice = tickets.filter(tic => tic.eventId === ticket.eventId)
    .reduce((acc, ticket) => {
      acc += ticket.price
      return acc
    }, 0) / tickets.length

  if (tickets.filter(tic => tic.userId === ticket.userId).length === 1) flaudRisk += 10
  console.log('Risk after check Only', flaudRisk)
  const priceDiff = (parseFloat(ticket.price) - parseFloat(adveragePrice)) / parseFloat(adveragePrice).toFixed(2) * 100
  if (priceDiff < 0) flaudRisk -= priceDiff
  else flaudRisk -= Math.min(priceDiff, 10)
  console.log('Risk after check price diff', flaudRisk, "price diff", priceDiff)
  if (moment(ticket.createdAt).hour() >= 9 && moment(ticket.createdAt).hour() <= 17) {
    flaudRisk -= 10
  }
  else flaudRisk += 10
  console.log('Risk after check office hour', flaudRisk, 'hour', moment(ticket.createdAt).hour(),
    'condition', (moment(ticket.createdAt).hour() >= 9 && moment(ticket.createdAt).hour() <= 17))
  if (ticket.comments.length > 3) flaudRisk += 5
  console.log('Risk after check comment', flaudRisk)
  flaudRisk = Math.min(95, flaudRisk)
  flaudRisk = Math.max(5, flaudRisk)
  return flaudRisk
}

module.exports = { ticketRouterFac, calculateFlaudRisk }