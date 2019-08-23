const { Event, Ticket } = require('./model')
const { Router } = require('express')
const moment = require('moment')
const router = new Router()
const { Op } = require('sequelize')
const auth = require('./auth/middleware')

router.post('/event', auth, async (req, res) => {
  try {
    const { name, description, picture, startDate, endDate } = req.body
    const eventAlreadyExist = await Event.findOne({ where: { name: name } })
    if (!moment(endDate).isValid()) res.status(422).send({ message: 'the date you send is not in correct format' }) //check date format
    else if (moment(endDate).diff(moment()) < 0 || moment(endDate).diff(moment(startDate)) < 0) { //event close? or start date is later than end date
      res.status(422).send({ message: 'Please choose the correct start and end date for event' })
    }
    else if (eventAlreadyExist) {
      res.status(422).send({ message: 'The event is already exist' }) //check unique name of event
    }
    else if (name && description && startDate) {
      const event = await Event.create({
        name,
        description,
        picture,
        startDate: moment(startDate),
        endDate: moment(endDate)
      })
      res.json({ event })
    }
  } catch (err) {
    console.error(err)
    res.status(500).send()
  }
})

router.get('/events', async (req, res) => {
  const { offset } = req.query
  const events = await Event.findAndCountAll({
    where: {
      endDate: {
        [Op.gte]: moment().local().startOf('day')
      }
    },
    limit: 9,
    offset: offset || 0
  })
  res.json(events)
})

router.get('/event/:id', async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id, { include: [{ model: Ticket }] })
    if (!event) res.status(404).send({ message: 'Event not found' })
    else (res.status(200).json(event))
  } catch (err) {
    res.status(500).send()
    console.error(err)
  }
})

router.put('/event/:id', auth, async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id)
    const { name, description, picture, startDate, endDate } = req.body
    if (!moment(endDate).isValid())
      res.status(422).send({ message: 'the date you send is not in correct format' })
    else if (moment(endDate).diff(moment()) < 0 || moment(endDate).diff(moment(startDate)) < 0) {
      res.status(422).send({ message: 'Please choose the correct start and end date for event' })
    }
    else {
      await event.update({
        name,
        description,
        picture,
        startDate: moment(startDate),
        endDate: moment(endDate)
      })
      res.json({ event })
    }
  } catch (err) {
    res.status(500).send()
    console.error(err)
  }
})


module.exports = router

