const { Ticket, Event, Comment, User } = require('./model')
const { Router } = require('express')
const router = new Router()

router.post('/ticket', async (req, res) => {
  try {
    const { price, description, userId, eventId, picture } = req.body
    const event = await Event.findByPk(eventId)
    if (!event) res.status(422).send('Event not found!')
    else if (price && description) {
      const ticket = await Ticket.create({ price:parseInt(price), description, picture, userId, eventId })
      res.status(200).json({ ticket })
    }
  } catch (err) {
    console.error(err)
    res.status(500).send()
  }
})

router.put('/ticket/:id', async (req, res) => {
  try {
    const { price, description, eventId, picture } = req.body
    const ticket = await Ticket.findOne({ where: { id: req.params.id, eventId } })
    if (ticket) {
      await ticket.update({ price: parseInt(price), description, picture, eventId })
      res.json({ ticket })
    } else {
      res.status(422).send('Event or ticket is not found')
    }
  } catch (err) {
    console.error(err)
    res.status(500).send
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

//
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


module.exports = router