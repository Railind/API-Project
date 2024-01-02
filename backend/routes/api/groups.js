const express = require('express');
const { Op, Sequelize } = require('sequelize');
const bcrypt = require('bcryptjs');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

const { setTokenCookie, restoreUser, requireAuth } = require('../../utils/auth');
const { Group, Membership, GroupImage, Venue, Event, User, EventImage, Attendance } = require('../../db/models');

const router = express.Router();



const validateGroups = [
    check('name')
        .exists({ checkFalsy: true })
        .isLength({ max: 60 })
        .withMessage('Name must be 60 characters or less'),
    check('about')
        .exists({ checkFalsy: true })
        .isLength({ min: 50 })
        .withMessage('About must be 50 characters or more'),
    check('type')
        .exists({ checkFalsy: true })
        .isIn(['Online', 'In Person'])
        .withMessage("Type must be 'Online' or 'In person"),
    check('private')
        .exists()
        .isBoolean()
        .withMessage("Private must be a boolean"),
    check('city')
        .exists({ checkFalsy: true })
        .withMessage('City is required'),
    check('state')
        .exists({ checkFalsy: true })
        .withMessage('State is required'),
    handleValidationErrors
];

//Create group ✔️
router.post('/', requireAuth, validateGroups, async (req, res) => {
    const { user } = req
    let organizerId = user.id
    const { name, about, type, private, city, state } = req.body;
    const group = await Group.create({ organizerId, name, about, type, private, city, state });

    await Membership.create({
        userId: user.id,
        groupId: group.id,
        status: 'co-host'
    });

    const newGroup = {
        id: group.id,
        organizerId: group.organizerId,
        name: group.name,
        about: group.about,
        type: group.type,
        private: group.private,
        city: group.city,
        state: group.state,
        createdAt: group.createdAt,
        updatedAt: group.updatedAt
    };
    res.status(201)
    return res.json(
        newGroup
    );
}
);

//Delete Current Group ✔️
router.delete('/:groupId', requireAuth, async (req, res) => {
    const { user } = req
    const deletedGroup = await Group.findByPk(req.params.groupId);
    if (!deletedGroup) {
        return res.status(404).json({ message: "Group couldn't be found" });
    }
    if (user.id === deletedGroup.organizerId) {
        if (deletedGroup) await deletedGroup.destroy();

        return res.status(200).json({ message: 'Successfully deleted' });
    }
    else {
        return res.status(403).json({ message: "Forbidden" })
    }
})


//Update Current Group ✔️router.put
router.put('/:groupId', requireAuth, validateGroups, async (req, res) => {

    const { user } = req
    const { name, about, type, private, city, state } = req.body;

    let updatedGroup = await Group.findByPk(req.params.groupId);
    if (!updatedGroup) {
        return res.status(404).json({ message: "Group couldn't be found" });
    }
    if (user.id === updatedGroup.organizerId) {


        await updatedGroup.update({ name, about, type, private, city, state });

        let newGroup = {
            id: updatedGroup.id,
            organizerId: updatedGroup.organizerId,
            name: updatedGroup.name,
            about: updatedGroup.about,
            type: updatedGroup.type,
            private: updatedGroup.private,
            city: updatedGroup.city,
            state: updatedGroup.state,
            createdAt: updatedGroup.createdAt,
            updatedAt: updatedGroup.updatedAt

        }


        res.status(200).json(
            newGroup
        );
    }
    else {
        return res.status(403).json({ message: "Forbidden" })
    }
}
);

//Get all groups of current user ✔️
router.get('/current', async (req, res) => {
    await requireAuth
    const { user } = req
    const groups = await Group.findAll({
        where: { organizerId: user.id }
    });
    const groupMemberships = await Group.findAll({
        include: [{
            model: Membership,
            where: { userId: user.id },
        },
        {
            model: GroupImage,
            attributes: ['url', 'preview'],
            where: { preview: true },
            required: false,
            limit: 1,
        }]
    });

    let groupsList = [];
    groupMemberships.forEach(group => {
        groupsList.push(group.toJSON())
    })
    let count = 0;
    groupsList.forEach(group => {
        group.numMembers = group.Memberships.length
        if (group.GroupImages.length) {
            for (let i = 0; i < group.GroupImages.length; i++) {
                count++
                if (group.GroupImages[i].preview === true) {
                    group.previewImage = group.GroupImages[i].url
                }
            }
        }
        delete group.GroupImages
        delete group.Memberships
    })

    return res.json({
        Groups: groupsList
    })
});

//Get group by Id ✔️
router.get('/:groupId', async (req, res) => {
    const { groupId } = req.params
    const group = await Group.findByPk(groupId, {
        include: [
            {
                model: Membership,
                attributes: ['groupId', 'userId']
            },
            {
                model: GroupImage,
                attributes: ['id',
                    'url', 'preview']
            },
            {
                model: User,
                attributes: ['id', 'firstName', 'lastName'],
                as: 'Organizer'
            },
            {
                model: Venue,
                attributes: ['id', 'groupId', 'address', 'city', 'state', 'lat', 'lng'],
                // as: 'Organizer'
            },
        ],
    }
    );
    group.numMembers = group.Memberships.length
    if (!group) {
        return res.status(404).json({ message: "Group couldn't be found" });
    }

    return res.status(200).json(group);
});

//Get all groups ✔️
router.get('/', async (req, res) => {
    const groups = await Group.findAll(
        {
            include: [
                {
                    model: GroupImage,
                    attributes: ['url', 'preview'],
                },
                {
                    model: Membership,
                    attributes: ['groupId', 'userId']
                }
            ]
        })

    let groupsList = [];
    groups.forEach(group => {
        groupsList.push(group.toJSON())
    })
    let count = 0;
    groupsList.forEach(group => {
        group.numMembers = group.Memberships.length
        if (group.GroupImages.length) {
            for (let i = 0; i < group.GroupImages.length; i++) {
                count++
                if (group.GroupImages[i].preview === true) {
                    group.previewImage = group.GroupImages[i].url
                }
            }
        }
        delete group.GroupImages
        delete group.Memberships
    })

    return res.json({
        Groups: groupsList
    })
})



// VENUES
// '--------------------------------------------------'


//Get all Venues for a group ✔️
router.get('/:groupId/venues', requireAuth, async (req, res) => {
    const { groupId } = req.params
    const { user } = req
    const group = await Group.findByPk(groupId)
    if (!group) {
        return res.status(404).json({ message: "Group couldn't be found" });
    }
    const cohostCheck = await User.findByPk(user.id, {
        include: {
            model: Membership,
            where: {
                groupId: groupId,
                status: 'co-host'
            }
        }
    })


    if (user.id === group.organizerId || cohostCheck !== null) {
        const venues = await Venue.findAll({
            where: { groupId: groupId },
            attributes: {
                exclude: ['createdAt', 'updatedAt'], // Exclude createdAt and updatedAt
            },
        });

        return res.json({ Venues: venues });
    }
    else {
        return res.status(403).json({ message: "Forbidden" })
    }
});


//Make a venue for a group ✔️ ❌ NEEDS BODY VALIDATION
router.post('/:groupId/venues', requireAuth, async (req, res) => {
    const { groupId } = req.params
    const { user } = req
    const group = await Group.findByPk(groupId)
    if (!group) {
        return res.status(404).json({ message: "Group couldn't be found" });
    }
    console.log(group.organizerId)
    const cohostCheck = await User.findByPk(user.id, {
        include: {
            model: Membership,
            where: {
                groupId: groupId,
                status: 'co-host'
            }
        }
    })
    if (user.id === group.organizerId || cohostCheck !== null) {
        res.status(200)
        const { address, city, state, lat, lng } = req.body;
        const venue = await Venue.create({ groupId, address, lat, lng, city, state });

        const newVenue = {
            id: venue.id,
            groupId: groupId,
            address: venue.address,
            city: venue.city,
            state: venue.state,
            lat: venue.lat,
            lng: venue.lng
        };

        return res.json(newVenue);
    }
    else {
        return res.status(403).json({ message: "Forbidden" })
    }
});

// EVENTS
// ---------------------------------------

//Get Events by group Id ✔️
router.get('/:groupId/events', async (req, res) => {
    const { groupId } = req.params
    const group = await Event.findByPk(groupId)
    if (!group) {
        // res.Error("Couldn't find a Group with the specified id")
        return res.status(404).json({ message: "Group couldn't be found" });
    }
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
        ,

        where: { groupId: groupId }
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

//Create Event by GroupId ✔️ ❌
router.post('/:groupId/events', requireAuth, async (req, res) => {
    const { groupId } = req.params
    const { user } = req
    const group = await Group.findByPk(groupId)
    if (!group) {
        return res.status(404).json({ message: "Group couldn't be found" });
    }

    const cohostCheck = await User.findByPk(user.id, {
        include: {
            model: Membership,
            where: {
                groupId: groupId,
                status: 'co-host'
            }
        }
    })
    if (user.id === group.organizerId || cohostCheck !== null) {

        res.status(200)
        const { name, type, capacity, price, description, venueId, startDate, endDate } = req.body;
        const event = await Event.create({ groupId, name, price, description, type, capacity, venueId, startDate, endDate });

        const newEvent = {
            id: event.id,
            groupId: groupId,
            venueId: event.venueId,
            name: event.name,
            type: event.type,
            capacity: event.capacity,
            price: event.price,
            description: event.description,
            startDate: event.startDate,
            endDate: event.endDate
        };

        return res.json(newEvent);
    }
    else {
        return res.status(403).json({ message: "Forbidden" })
    }
});


// MEMBERSHIPS
// -------------------------------------------------

//Gets members of a group by Id ✔️
router.get('/:groupId/members', async (req, res) => {
    const { groupId } = req.params
    const { user } = req
    const group = await Group.findByPk(groupId)
    if (!group) {
        return res.status(404).json({ message: "Group couldn't be found" });
    }

    const cohostCheck = await User.findByPk(user.id, {
        include: {
            model: Membership,
            where: {
                groupId: groupId,
                status: 'co-host'
            }
        }
    })


    if (user.id === group.organizerId || cohostCheck !== null) {
        const people = await Membership.findAll({
            where: { groupId: groupId },
            include: [{
                model: User,
                attributes: ['id', 'firstName', 'lastName']
            }]
        });


        const membersList = people.map(member => ({
            id: member.User.id,
            firstName: member.User.firstName,
            lastName: member.User.lastName,
            Membership: {
                status: member.status
            }
        }))
        return res.status(200).json({ Members: membersList });
    }
    //IF USER ISNT HOST/CO-HOST
    else {
        const people = await Membership.findAll({
            where: { groupId: groupId, status: ['member', 'co-host', 'host'] },
            include: [{
                model: User,
                attributes: ['id', 'firstName', 'lastName']
            }]
        });


        const membersList = people.map(member => ({
            id: member.User.id,
            firstName: member.User.firstName,
            lastName: member.User.lastName,
            Membership: {
                status: member.status
            }
        }))
        return res.status(200).json({ Members: membersList });
    }
});



//Request to join a group based on the group's Id ✔️
router.post('/:groupId/membership', requireAuth, async (req, res) => {
    const { groupId } = req.params
    const { user } = req
    const group = await Group.findByPk(groupId)
    if (!group) {
        return res.status(404).json({ message: "Group couldn't be found" });
    }

    const membershipStatus = await Membership.findOne({
        where: { groupId: groupId, userId: user.id }
    });

    if (!membershipStatus) {
        const newMember = await Membership.create({
            groupId: groupId,
            userId: user.id,
            status: 'pending'
        })
        let currMember = newMember.toJSON()
        currMember.memberId = currMember.userId
        return res.json({
            memberId: currMember.memberId,
            status: currMember.status
        })
    }
    else if (membershipStatus.toJSON().status === 'pending') {
        res.status(400).json({ message: 'Membership has already been requested' })
    }
    else if (membershipStatus.toJSON().status !== 'pending') {
        res.status(400).json({ message: 'User is already a member of the group' })
    }
});

// change status of membership by id. ✔️
router.put('/:groupId/membership', requireAuth, async (req, res) => {
    const { groupId } = req.params
    const { memberId, status } = req.body
    const { user } = req
    if (status === 'pending') {
        return res.status(400).json({ message: "Validations Error", errors: { status: 'Cannot change a membership status to pending' } })
    }
    const userCheck = await User.findOne({ where: { id: memberId } })
    if (!userCheck) {
        return res.status(400).json({ message: "Validation Error", errors: { memberId: "User couldn't be found" } })
    }
    const group = await Group.findByPk(groupId)
    if (!group) {
        return res.status(404).json({ message: "Group couldn't be found" });
    }

    const membership = await Membership.findOne({ where: { userId: memberId } })
    if (!membership) {
        res.status(404).json({ message: "Membership between the user and the group does not exist" })
    }

    const cohostCheck = await User.findByPk(user.id, {
        include: {
            model: Membership,
            where: {
                groupId: groupId,
                status: 'co-host'
            }
        }
    })
    if (cohostCheck !== null) {
        if (status === 'co-host') {
            res.status(403).json({ message: 'Forbidden' })
        }
        else {
            await membership.update({ status: status })
            const updatedMembership = await Membership.findByPk(membership.id);

            const newBody = {
                id: updatedMembership.id,
                groupId: updatedMembership.groupId,
                memberId: updatedMembership.userId,
                status: updatedMembership.status
            };
            console.log(newBody);
            return res.status(200).json(newBody);
        }
    }

    if (user.id === group.organizerId) {
        await membership.update({ status: status })
        const updatedMembership = await Membership.findByPk(membership.id);

        const newBody = {
            id: updatedMembership.id,
            groupId: updatedMembership.groupId,
            memberId: updatedMembership.userId,
            status: updatedMembership.status
        };
        console.log(newBody);
        return res.status(200).json(newBody);
    }
    else {
        res.status(403).json({ message: 'Forbidden' })
    }
})
// Delete a user membership ✔️
router.delete('/:groupId/membership', requireAuth, async (req, res) => {
    const { groupId } = req.params
    const { memberId } = req.body
    const { user } = req

    const group = await Group.findByPk(groupId)
    if (!group) {
        return res.status(404).json({ message: "Group couldn't be found" });
    }

    const userCheck = await User.findOne({ where: { id: memberId } })
    if (!userCheck) {
        return res.status(400).json({ message: "Validation Error", errors: { memberId: "User couldn't be found" } })
    }

    const membership = await Membership.findOne({ where: { userId: memberId } })
    if (!membership) {
        res.status(404).json({ message: "Membership does not exist for this User" })
    }


    if (user.id === group.organizerId || user.id !== memberId) {
        await membership.destroy()

        return res.json({
            message: "Successfully deleted membership from group"
        })

    }
    else {
        res.status(403).json({ message: 'Forbidden' })
    }
})

// IMAGES
// ------------------------------------

//Add an image to a group based on group ID ✔️
router.post('/:groupId/images', requireAuth, async (req, res) => {
    const { groupId } = req.params;
    const { user } = req;
    const group = await Group.findByPk(groupId);

    if (!group) {
        return res.status(404).json({ message: "Group couldn't be found" });
    }

    if (user.id === group.organizerId) {
        res.status(200);

        const { url, preview } = req.body;
        // Do not include 'id' in the create call, it will be auto-generated
        const groupImage = await GroupImage.create({ url, preview, groupId });

        const newImage = {
            id: groupImage.id, // This id is automatically generated by the database
            url: groupImage.url,
            preview: groupImage.preview
        };

        return res.json(newImage);
    } else {
        return res.status(403).json({ message: "Forbidden" });
    }
});

//ATTENDEES



module.exports = router;
