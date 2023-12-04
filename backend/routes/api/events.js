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


//Delete an event by ID ✔️
router.delete('/:eventId', requireAuth, async (req, res) => {
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
    if (user.id === group.organizerId || cohostCheck !== null) {
        await event.destroy();

        return res.status(200).json({ message: 'Successfully deleted' })
    }
    else {
        return res.status(403).json({ message: "Forbidden" })
    }
})



//Get all Events ✔️
router.get('/', async (req, res) => {
    let { page, size, name, type, startDate } = req.query

    page = parseInt(page) || 1
    size = parseInt(size) || 20

    if (name) name = name.replace(/"/g, "")
    if (type) type = type.replace(/"/g, "")


    let filters = {
        where: {
            name: {
                [Op.substring]: name
            },
            type,
            startDate: { [Op.substring]: startDate }
        },
        limit: size,
        offset: size * (page - 1)
    }
    if (!name) delete filters.where.name
    if (!type) delete filters.where.type
    if (!startDate) delete filters.where.startDate
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
        }], ...filters
    });
    let eventsList = [];
    events.forEach(event => {
        eventsList.push(event.toJSON())
    })
    let count = 0;
    eventsList.forEach(event => {

        event.numAttending = event.Attendances.length
        event.previewImage = "No preiview Image given"

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
    const eventList = event.toJSON()
    const group = await Group.findByPk(event.groupId, {
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
//Get all attendees of an event by eventId ✔️
router.get('/:eventId/attendees', async (req, res) => {
    const { eventId } = req.params
    const { user } = req
    const event = await Event.findByPk(eventId)
    if (!event) {
        return res.status(404).json({ message: "Event couldn't be found" });
    }

    const eventList = event.toJSON()
    const group = await Group.findByPk(event.groupId, {
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


    if (user.id === group.organizerId || cohostCheck !== null) {

        // ---
        const attendances = await Attendance.findAll({
            where: { eventId: eventId },
            include: [{
                model: User,
                attributes: ['id', 'firstName', 'lastName']
            }]
        });


        const attendanceList = attendances.map(member => ({
            id: member.User.id,
            firstName: member.User.firstName,
            lastName: member.User.lastName,
            Membership: {
                status: member.status
            }
        }))
        return res.status(200).json({ Attendees: attendanceList });




    }
    //IF USER ISNT HOST/CO-HOST
    else {
        const attendances = await Attendance.findAll({
            where: { eventId: eventId, status: ['attending', 'waitlist'] },
            include: [{
                model: User,
                attributes: ['id', 'firstName', 'lastName']
            }]
        });


        const attendanceList = attendances.map(member => ({
            id: member.User.id,
            firstName: member.User.firstName,
            lastName: member.User.lastName,
            Membership: {
                status: member.status
            }
        }))
        return res.status(200).json({ Attendees: attendanceList });


    }


    // ---


}
)


//Request to attend an event by Event's id ✔️
router.post('/:eventId/attendance', requireAuth, async (req, res) => {
    const { eventId } = req.params
    const { user } = req
    const event = await Event.findByPk(eventId)
    if (!event) {
        return res.status(404).json({ message: "Event couldn't be found" });
    }

    const membershipStatus = await User.findByPk(user.id, {
        include: {
            model: Membership,
            where: {
                groupId: event.groupId,
                id: user.id
            }
        }
    });

    if (membershipStatus !== null) {
        const attendanceStatus = await Attendance.findOne({
            where: { eventId: eventId, userId: user.id }
        });

        if (!attendanceStatus) {
            const newMember = await Attendance.create({
                eventId: eventId,
                userId: user.id,
                status: 'pending'
            })
            let currMember = newMember.toJSON()
            return res.json({
                userId: currMember.userId,
                status: currMember.status
            })
        }
        else if (attendanceStatus.toJSON().status === 'pending') {
            res.status(400).json({ message: 'Attendance has alread been requested' })
        }
        else if (attendanceStatus.toJSON().status !== 'pending') {
            res.status(400).json({ message: 'User is already an attendee of the event' })
        }
    }
    else {
        return res.status(403).json({ message: "Forbidden" })
    }
})

// change status of attendances for an event by ID ✔️ ❌ NEEDS BODY VALIDATION
router.put('/:eventId/attendance', requireAuth, async (req, res) => {
    const { eventId } = req.params;
    const { userId, status } = req.body;
    const { user } = req;

    if (status === 'pending') {
        return res.status(400).json({ message: "Cannot change an attendance status to pending" });
    }

    const event = await Event.findByPk(eventId);
    if (!event) {
        return res.status(404).json({ message: "Event couldn't be found" });
    }

    const group = await Group.findByPk(event.groupId);

    const userAttendance = await Attendance.findOne({
        where: {
            eventId: eventId,
            userId: userId
        }
    });

    if (!userAttendance) {
        return res.status(404).json({ message: "Attendance between the user and the event does not exist" });
    }

    const userCheck = await User.findByPk(userId);
    if (!userCheck) {
        return res.status(404).json({ message: "User couldn't be found" });
    }

    const cohostCheck = await User.findByPk(user.id, {
        include: {
            model: Membership,
            where: {
                groupId: event.groupId,
                status: 'co-host'
            }
        }
    });

    if (group && (user.id === group.organizerId || cohostCheck !== null)) {
        await userAttendance.update({ status: status });

        const newBody = {
            id: userAttendance.id,
            eventId: userAttendance.eventId,
            userId: userAttendance.userId,
            status: userAttendance.status
        };
        console.log(newBody);
        return res.status(200).json(newBody);
    } else {
        return res.status(403).json({ message: "Forbidden" });
    }
})


//Delete attendance for an event specified by id ✔️
router.delete('/:eventId/attendance', requireAuth, async (req, res) => {
    const { eventId } = req.params
    const { userId } = req.body
    const { user } = req

    const event = await Event.findByPk(eventId)
    if (!event) {
        return res.status(404).json({ message: "Event couldn't be found" });
    }


    const group = await Group.findByPk(event.groupId);

    const userAttendance = await Attendance.findOne({
        where: {
            eventId: eventId,
            userId: userId
        }
    });

    if (!userAttendance) {
        return res.status(404).json({ message: "Attendance between the user and the event does not exist" });
    }

    const userCheck = await User.findByPk(userId);
    if (!userCheck) {
        return res.status(404).json({ message: "User couldn't be found" });
    }

    if (user.id === group.organizerId || user.id !== memberId) {
        await userAttendance.destroy()

        return res.json({
            message: "Successfully deleted membership from group"
        })

    }
    else {
        res.status(403).json({ message: 'Forbidden' })
    }
})



module.exports = router;
