const express = require('express');
const { Op, Sequelize } = require('sequelize');
const bcrypt = require('bcryptjs');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

const { setTokenCookie, restoreUser, requireAuth } = require('../../utils/auth');
const { Group, Venue, Event, EventImage, Attendance } = require('../../db/models');
const { url } = require('inspector');

const router = express.Router();

//Get all details of an event by id
router.get('/:eventId', async (req, res) => {
    let event = await Event.findByPk(req.params.eventId);
    if (!event) {
        return res.status(404).json({ error: 'Event not found' });
    }


    return res.json(event);
});


//Get all Events
router.get('/', requireAuth, async (req, res) => {
    const events = await Event.findAll({
        include: [{
            model: EventImage,
            where: {
                preview: true
            },
            limit: 1,
            attributes: ['url'],
        }, {
            model: Group,
            attributes: ['id', 'name', 'city', 'state'],
        }, {
            model: Venue,
            attributes: ['id', 'city', 'state'],
        }]
    });


    return res.json({ "Events": events });
});

//Creates and returns a new event for a group specified by its id
router.post('/:groupId/venues', requireAuth, async (req, res) => {
    const { groupId } = req.params
    const group = await Group.findByPk(groupId)
    if (!group) {
        return res.status(404).json({ message: "Group couldn't be found" });
    }
    res.status(200)
    const { address, city, state, lat, lng } = req.body;
    const venue = await Venue.create({ groupId, address, lat, lng, city, state });

    const newVenue = {
        id: venue.id,
        groupId: groupId,
        address: venue.address,
        lat: venue.lat,
        lng: venue.lng,
        city: venue.city,
        state: venue.state
    };

    return res.json(newVenue);
});

//Update specified event
router.put('/:eventId', requireAuth, async (req, res) => {
    try {
        const { user } = req
        const { name, about, type, private, city, state } = req.body;

        let updatedEvent = await Event.findByPk(req.params.groupId);
        if (user.id !== updatedEvent.organizerId || user.id !== test) {
            console.error({ error: 'User does not own current group.' });
            res.status(500).json({ error: 'User does not own current group.' });
        }

        if (!updatedEvent) {
            return res.status(404).json({ error: 'Event not found' });
        }

        updatedEvent.name = name || updatedEvent.name;
        updatedEvent.about = about || updatedEvent.about;
        updatedEvent.type = type || updatedEvent.type;
        updatedEvent.private = private || updatedEvent.private;
        updatedEvent.city = city || updatedEvent.city;
        updatedEvent.state = state || updatedEvent.state;
        updatedEvent.updatedAt = new Date();

        await updatedEvent.save();
        ``
        res.status(200).json({
            group: updatedGroup
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
);

// IMAGES
// ----------------------------------------

router.post('/:eventId/images', requireAuth, async (req, res) => {
    const { eventId } = req.params
    const event = await Event.findByPk(eventId)
    if (!event) {
        return res.status(404).json({ message: "Event couldn't be found" });
    }

    const { url, preview } = req.body

    const eventImage = await EventImage.create({ id, url, preview })

    const newImage = {
        id: eventImage.id,
        url: eventImage.url,
        preview: eventImage.preview
    }

    return res.json(newImage)
})


// ATTENDEES
// -----------------------------------------
//Get all attendees of an event by eventId
router.get('/:eventId/attendees', async (req, res) => {
    const { eventId } = req.params
    const attendances = await Attendance.findAll({
        where: { id: eventId }
    })

    res.json(attendances)
})

//Request to attend an event by Event's id
router.post('/:eventId/attendance', requireAuth, async (req, res) => {
    const { eventId } = req.params
    const attendances = await Attendance.findAll({
        where: { id: eventId }
    })

    res.json(attendances)
})


//Change the status of an attendance for an event specified by id
router.put('/:eventId/attendance', requireAuth, async (req, res) => {
    const { eventId } = req.params
    const attendances = await Attendance.findAll({
        where: { id: eventId }
    })

    res.json(attendances)
})


//Delete attendance for an event specified by id
router.delete('/:eventId/attendance', requireAuth, async (req, res) => {
    const { eventId } = req.params
    const attendances = await Attendance.findAll({
        where: { id: eventId }
    })

    res.json(attendances)
})



module.exports = router;
