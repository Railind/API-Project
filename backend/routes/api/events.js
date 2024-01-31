const express = require('express');
const { Op, Sequelize } = require('sequelize');
const bcrypt = require('bcryptjs');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

const { setTokenCookie, restoreUser, requireAuth } = require('../../utils/auth');
const { Group, Venue, Event, EventImage, Attendance, User, Membership } = require('../../db/models');
const { url } = require('inspector');

const router = express.Router();



let validateParams = [
    check('page')
        .optional()
        .custom((value) => {
            if (value < 1) {
                throw new Error("Page must be greater than or equal to 1")
            }
            if (value > 10) {
                throw new Error("Page must be less than or equal to 10")
            }
            return value
        }),
    check('size')
        .optional()
        .custom((value) => {
            if (value < 1) throw new Error("Size must be greater than or equal to 1")
            return value
        }),
    check('name')
        .optional()
        .custom((value) => {
            // V we want this only if we care if the string is technically empty?
            // if (value.length < 1) return false
            if (typeof value !== 'string') throw new Error('Name must be a string')
            if (typeof value === 'string') return true
        })
        .withMessage('Name must be a string'),
    check('type')
        .optional()
        .custom((value) => {
            if (value.includes('Online') || value.includes('In person')) return true
        })
        .withMessage("Type must be 'Online' or 'In person'"),
    check('startDate')
        .optional()
        .isISO8601({
            options: {
                format: 'YYYY/MM/DD h:m'
            }
        })
        .withMessage("Start date must be a valid datetime"),
    handleValidationErrors,
]


const validateEvents = [
    check('name')
        .exists({ checkFalsy: true })
        .isLength({ min: 5, max: 255 })
        .withMessage('Name must be at least 5 characters'),
    check('type')
        .exists({ checkFalsy: true })
        .isIn(['Online', 'In person'])
        .withMessage("Type must be 'Online' or 'In person"),
    check('capacity')
        .exists()
        .isInt()
        .withMessage("Capacity must be an integer"),
    check('price')
        .exists({ checkFalsy: true })
        .isNumeric()
        .custom((value) => {
            if (isNaN(value) || value < 0) {
                throw new Error('Price is invalid');
            }
            let numString = value.toString()
            if (numString.includes('.')) {
                let splitVal = numString.split('.')
                if (splitVal[1].length > 2) {
                    {
                        throw new Error('Price is invalid');
                    }
                }
            }
            return true
        }),
    check('description')
        .exists({ checkFalsy: true })
        .isLength({ min: 5 })
        .withMessage('Description is required'),
    check('startDate')
        .exists({ checkFalsy: true })
        .isISO8601()
        .isAfter(new Date().toJSON().slice(0, 10),)
        .withMessage('Start date must be in the future'),
    check('endDate')
        .exists({ checkFalsy: true })
        .isISO8601()
        .custom((value, { req }) => {
            const endDate = new Date(value)
            const startDate = new Date(req.body.startDate)

            if (endDate <= startDate) {
                throw new Error('End date must be later than the start date')
            }
            return true
        }),
    handleValidationErrors
];
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
router.get('/', validateParams, async (req, res) => {
    let { page, size, name, type, startDate } = req.query

    page = parseInt(page) || 1
    size = parseInt(size) || 20

    if (name) name = name.replace(/"/g, "")
    if (type) type = type.replace(/"/g, "")
    // if (startDate) startDate = startDate.replace(/"/g, "")


    let filters = {
        where: {
            name: {
                [Op.substring]: name
            },
            type,
            // startDate: { [Op.substring]: startDate }
        },
        limit: size,
        offset: size * (page - 1)
    }

    // let newDate = startDate.split(' ')
    // console.log('THESE ARE OUR FILTERS', filters)
    // console.log('UNFILTERED', startDate)
    // console.log('FILTERED', newDate)


    if (!name) delete filters.where.name
    if (!type) delete filters.where.type
    // if (!startDate) delete filters.where.startDate

    const events = await Event.findAll({
        attributes: {
            exclude: ['createdAt', 'updatedAt', 'price', 'capacity', 'description'],
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

    //Testing Date-Time filter

    let filteredEventsList = []

    if (startDate) {
        eventsList.forEach(event => {

            // console.log('START DATE IN LIST', event.startDate)
            // console.log(typeof event.startDate)

            const startDateToString = event.startDate instanceof Date ? event.startDate.toISOString().split('T')[0] : event.startDate;

            // console.log('NEW', startDateToString)
            // console.log(typeof startDateToString)

            // console.log('StartDate of event', startDateToString)
            // console.log('Filtered Start Date', startDate)

            if (typeof startDateToString === 'string') {
                // console.log('Test one')
                if (startDateToString.split(' ').length == 1) {
                    // console.log('Test two')
                    if (startDateToString.split(':')[0] == startDate) {
                        // console.log('Test three')
                        filteredEventsList.push(event)
                    }
                }
            }
        })

        // console.log(filteredEventsList)
    }

    else { filteredEventsList = eventsList }

    filteredEventsList.forEach(event => {

        event.numAttending = event.Attendances.length
        event.previewImage = "No preview Image given"

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


    filteredEventsList = filteredEventsList.map((event) => {
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

    return res.json({ Events: filteredEventsList });
    //--


    //Original for each - keep

    // eventsList.forEach(event => {

    //     event.numAttending = event.Attendances.length
    //     event.previewImage = "No preview Image given"

    //     if (event.EventImages.length) {
    //         for (let i = 0; i < event.EventImages.length; i++) {
    //             count++;
    //             if (event.EventImages[i].preview === true) {
    //                 event.previewImage = event.EventImages[i].url;
    //             }
    //         }
    //     }
    //     delete event.EventImages
    //     delete event.Attendances
    // })

    // eventsList = eventsList.map((event) => {
    //     const {
    //         id,
    //         groupId,
    //         venueId,
    //         name,
    //         type,
    //         startDate,
    //         endDate,
    //         numAttending,
    //         previewImage,
    //         ...rest
    //     } = event;

    //     return {
    //         id,
    //         groupId,
    //         venueId,
    //         name,
    //         type,
    //         startDate,
    //         endDate,
    //         numAttending,
    //         previewImage,
    //         ...rest,
    //     };
    // });

    // return res.json({ Events: eventsList });
});

//Creates and returns a new venue for a group specified by its id
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

//Update specified event ✔️
router.put('/:eventId', requireAuth, validateEvents, async (req, res) => {
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

//Add an image to an event by Id ✔️
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
            model: Attendance,
            where: {
                eventId: eventId,
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
            Attendance: {
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
    const group = await Group.findByPk(event.groupId)

    const currentUser = await User.findByPk(user.id, {
        include: [{
            model: Membership
        },
        {
            model: Attendance
        }]
    })

    const currentUserJSON = currentUser.toJSON()
    let membershipArr = []
    let attendanceArr = []
    currentUserJSON.Memberships.forEach(membership => {
        if (membership.groupId === group.id) {
            membershipArr.push(membership.status)
        }
    })

    if (!membershipArr.length || membershipArr.includes('pending')) {
        return res.status(403).json({ message: "Forbidden" })
    }

    currentUserJSON.Attendances.forEach(event => {
        if (event.eventId == eventId) {
            attendanceArr.push(event.status)
        }
    })

    if (attendanceArr.includes('pending')) {
        return res.status(400).json({ message: 'Attendance has already been requested' })
    }

    if (attendanceArr.includes('attending')) {
        return res.status(400).json({ message: 'User is already an attendee of the event' })
    }

    const newAttendance = await Attendance.create({
        eventId: eventId,
        userId: user.id,
        status: 'pending'
    })
    let currMember = newAttendance.toJSON()
    return res.json({
        userId: currMember.userId,
        status: currMember.status
    })
})

// change status of attendances for an event by ID ✔️
router.put('/:eventId/attendance', requireAuth, async (req, res) => {
    const { eventId } = req.params;
    const { userId, status } = req.body;
    const { user } = req;

    const userCheck = await User.findByPk(userId);
    if (!userCheck) {
        return res.status(404).json({ message: "User couldn't be found" });
    }

    if (status === 'pending') {
        return res.status(400).json({ message: "Validation Error", errors: { status: 'Cannot change an attendance status to pending' } });
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
router.delete('/:eventId/attendance/:userId', requireAuth, async (req, res) => {
    const { eventId, userId } = req.params
    const { user } = req


    console.log('users ID', user.id)
    console.log('Param ID', userId)
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

    console.log('Attendance', userAttendance)
    if (userAttendance) {
        console.log('IT EXISTS')
    }

    const userCheck = await User.findByPk(userId);
    if (!userCheck) {
        return res.status(404).json({ message: "User couldn't be found" });
    }
    if (!userAttendance) {
        return res.status(404).json({ message: "Attendance does not exist for this User" });
    }

    console.log('Userchecker', userCheck)
    console.log('RIGHT BEFORE IT HITS')


    console.log(typeof user.id)
    console.log(typeof userId)
    if (user.id === parseInt(userId)) console.log('Comparison is correct')
    if (user.id === group.organizerId || user.id === parseInt(userId)) {
        console.log('ARE WE HITTING??')
        await userAttendance.destroy()

        return res.json({
            message: "Successfully deleted attendance from event"
        })

    }
    else {
        res.status(403).json({ message: 'Forbidden' })
    }
})



module.exports = router;
