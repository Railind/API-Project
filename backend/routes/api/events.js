const express = require('express');
const { Op, Sequelize } = require('sequelize');
const bcrypt = require('bcryptjs');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

const { setTokenCookie, restoreUser, requireAuth } = require('../../utils/auth');
const { Group, Venue, Event, EventImage, Attendance, User, Membership } = require('../../db/models');
const { url } = require('inspector');

const router = express.Router();

//Get all details of an event by id ✔️
router.get('/:eventId', async (req, res) => {
    let { eventId } = req.params
    let event = await Event.findByPk(req.params.eventId, {
        attributes: {
            exclude: ['createdAt', 'updatedAt'], // Exclude createdAt and updatedAt
        },
        include: [{
            model: EventImage,
            attributes: ['id', 'url', 'preview'],
        }, {
            model: Group,
            attributes: ['id', 'name', 'private', 'city', 'state'],
        }, {
            model: Venue,
            attributes: ['id', 'address', 'city', 'state', 'lat', 'lng'],
        }, {
            model: Attendance,
            attributes: ['eventId', 'userId']
        }]
        ,

        where: { eventId: eventId }
    });

    if (!event) {
        return res.status(404).json({ message: "Event couldn't be found" });
    }
    event.numAttending = event.Attendances.length

    event =
    {
        id: event.id,
        groupId: event.groupId,
        venueId: event.venueId,
        name: event.name,
        description: event.description,
        type: event.type,
        capacity: event.capacity,
        price: event.price,
        startDate: event.startDate,
        endDate: event.endDate,
        numAttending: event.numAttending,
        Group: event.Group,
        Venue: event.Venue,
        EventImages: event.EventImages
    }


    return res.status(200).json(event);
});


//Get all Events ✔️
router.get('/', async (req, res) => {
    const events = await Event.findAll({
        attributes: {
            exclude: ['createdAt', 'updatedAt', 'price', 'capacity', 'description'], // Exclude createdAt and updatedAt
        },
        include: [{
            model: EventImage,
            attributes: ['url', 'preview'],
        }, {
            model: Group,
            attributes: ['id', 'name', 'city', 'state'],
        }, {
            model: Venue,
            attributes: ['id', 'city', 'state'],
        }, {
            model: Attendance,
            attributes: ['eventId', 'userId']
        }]
    });
    let eventsList = [];
    events.forEach(event => {
        eventsList.push(event.toJSON())
    })
    let count = 0;
    eventsList.forEach(event => {
        console.log(event.EventImages)
        event.numAttending = event.Attendances.length
        if (event.EventImages.length) {
            for (let i = 0; i < event.EventImages.length; i++) {
                count++;
                if (event.EventImages[i].preview === true) {
                    event.previewImage = event.EventImages[i].url;
                }
            }
        }
        delete event.EventImages
        delete event.Attendances
    })




    eventsList = eventsList.map((event) => {
        const {
            id,
            groupId,
            venueId,
            name,
            type,
            startDate,
            endDate,
            numAttending,
            previewImage,
            ...rest
        } = event;

        return {
            id,
            groupId,
            venueId,
            name,
            type,
            startDate,
            endDate,
            numAttending,
            previewImage,
            ...rest,
        };
    });

    return res.json({ Events: eventsList });
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

//Update specified event ✔️ ❌ NEEDS BODY VALIDATION
router.put('/:eventId', requireAuth, async (req, res) => {
    const { eventId } = req.params
    const { user } = req
    const { name, type, capacity, price, description, startDate, endDate, venueId } = req.body;


    const venue = await Venue.findByPk(venueId)
    if (!venue) {
        res.status(404)
        return res.json({
            message: "Venue couldn't be found"
        })
    }

    const event = await Event.findByPk(eventId)
    if (!event) {
        return res.status(404).json({ message: "Event couldn't be found" });
    }
    console.log(event.toJSON())
    const eventList = event.toJSON()
    const group = await Group.findByPk(event.groupId, {
        include: {
            model: Membership
        }
    })
    console.log(group.toJSON())

    const cohostCheck = await User.findByPk(user.id, {
        include: {
            model: Membership,
            where: {
                groupId: eventList.groupId,
                status: 'co-host'
            }
        }
    })
    if (user.id === group.organizerId || cohostCheck !== null) {

        await event.update({ name, type, capacity, price, description, startDate, endDate, venueId });

        let updatedEvent = {
            id: event.id,
            groupId: event.groupId,
            venueId: event.venueId,
            name: event.name,
            type: event.type,
            capacity: event.capacity,
            price: event.price,
            description: event.description,
            startDate: event.startDate,
            endDate: event.endDate,
        }

        res.status(200).json(
            updatedEvent
        );

    }
    else {
        return res.status(403).json({ message: "Forbidden" })
    }

});

// IMAGES
// ----------------------------------------

//Add an image to an event by Id ✔️ ❌ NEEDS BODY VALIDATION
router.post('/:eventId/images', requireAuth, async (req, res) => {
    const { eventId } = req.params
    const { user } = req
    const event = await Event.findByPk(eventId)
    if (!event) {
        return res.status(404).json({ message: "Event couldn't be found" });
    }

    const eventList = event.toJSON()
    const group = await Group.findByPk(eventList.groupId, {
        include: {
            model: Membership
        }
    })

    const cohostCheck = await User.findByPk(user.id, {
        include: {
            model: Membership,
            where: {
                groupId: eventList.groupId,
                status: 'co-host'
            }
        }
    })
    const attendeeCheck = await User.findByPk(user.id, {
        include: {
            model: Membership,
            where: {
                groupId: eventList.groupId,
                status: 'attending'
            }
        }
    })
    if (user.id === group.organizerId || cohostCheck !== null || attendeeCheck !== null) {

        const { url, preview } = req.body

        const eventImage = await EventImage.create({ url, preview, eventId })

        const newImage = {
            id: eventImage.id,
            url: eventImage.url,
            preview: eventImage.preview
        }

        return res.json(newImage)
    }
    else {
        return res.status(403).json({ message: "Forbidden" })
    }
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
