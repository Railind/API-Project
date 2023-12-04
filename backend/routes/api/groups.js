const express = require('express');
const { Op, Sequelize } = require('sequelize');
const bcrypt = require('bcryptjs');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

const { setTokenCookie, restoreUser, requireAuth } = require('../../utils/auth');
const { Group, Membership, GroupImage, Venue, Event, User } = require('../../db/models');

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

const cohostFinder = async (user, groupId) => {
    await User.findByPk(user.id, {
        include: {
            model: Membership,
            where: {
                groupId: groupId,
                status: 'co-host'
            }
        }
    })
}


//Create group ✔️
router.post('/', requireAuth, validateGroups, async (req, res) => {
    const { user } = req
    let organizerId = user.id
    const { name, about, type, private, city, state } = req.body;
    const group = await Group.create({ organizerId, name, about, type, private, city, state });

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
    return res.json({
        group: newGroup
    });
}
);

//Delete Current Group ✔️
router.delete('/:groupId', requireAuth, async (req, res) => {
    const { user } = req
    const deletedGroup = await Group.findByPk(req.params.groupId);
    if (!deletedGroup) {
        return res.status(404).json({ message: "Group couldn't be found" });
    }
    if (user.id !== deletedGroup.organizerId) {
        return res.status(403).json({ message: "Forbidden" })
    }
    if (deletedGroup) await deletedGroup.destroy();

    return res.status(200).json({ message: 'Successfully deleted' });

})


//Update Current Group ✔️
router.put('/:groupId', requireAuth, validateGroups, async (req, res) => {

    const { user } = req
    const { name, about, type, private, city, state } = req.body;

    let updatedGroup = await Group.findByPk(req.params.groupId);
    if (!updatedGroup) {
        return res.status(404).json({ message: "Group couldn't be found" });
    }
    if (user.id !== updatedGroup.organizerId) {
        return res.status(403).json({ message: "Forbidden" })
    }

    updatedGroup.name = name || updatedGroup.name;
    updatedGroup.about = about || updatedGroup.about;
    updatedGroup.type = type || updatedGroup.type;
    updatedGroup.private = private || updatedGroup.private;
    updatedGroup.city = city || updatedGroup.city;
    updatedGroup.state = state || updatedGroup.state;
    updatedGroup.updatedAt = new Date();

    await updatedGroup.save();

    res.status(200).json(
        updatedGroup
    );

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
            }
        ]
    }

    );
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
        const venues = await Venue.findAll({
            where: { groupId: groupId },
            attributes: {
                exclude: ['createdAt', 'updatedAt'], // Exclude createdAt and updatedAt
            },
        });
        if (!group) {
            return res.status(404).json({ message: "Group couldn't be found" });
        }

        return res.json({ Venues: venues });
    }
    else {
        return res.status(403).json({ message: "Forbidden" })
    }
});


//Make a venue for a group
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

//Get Events by group Id
router.get('/:groupId/events', requireAuth, async (req, res) => {
    const { groupId } = req.params
    const group = await Event.findByPk(groupId)
    if (!group) {
        // res.Error("Couldn't find a Group with the specified id")
        return res.status(404).json({ message: "Group couldn't be found" });
    }
    const events = await Event.findAll({
        where: { groupId: groupId }
    });

    return res.json({ Events: events });
});

//Create Event by GroupId
router.post('/:groupId/events', requireAuth, async (req, res) => {
    const { groupId } = req.params
    const group = await Group.findByPk(groupId)
    if (!group) {
        return res.status(404).json({ message: "Group couldn't be found" });
    }
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
});


// MEMBERSHIPS
// -------------------------------------------------

//Gets members of a group by Id
router.get('/:groupId/members', async (req, res) => {
    const { groupId } = req.params
    const group = await Membership.findByPk(groupId)
    if (!group) {
        // res.Error("Couldn't find a Group with the specified id")
        return res.status(404).json({ message: "Group couldn't be found" });
    }
    const members = await Membership.findAll({
        where: { groupId: groupId }
    });

    return res.json({ Members: members });
});



//Request to join a group based on the group's Id
router.post('/:groupId/membership', requireAuth, async (req, res) => {
    const { groupId } = req.params
    const group = await Membership.findByPk(groupId)
    if (!group) {
        return res.status(404).json({ message: "Group couldn't be found" });
    }
    const members = await Membership.findAll({
        where: { groupId: groupId }
    });

    return res.json({ Members: members });
});


router.delete('/:groupId/membership', requireAuth, async (req, res) => {
    const { groupId } = req.params
    const { memberId } = req.body

    const group = await Group.findbyPk(groupId)
    if (!group) {
        return res.status(404).json({ message: "Group couldn't be found" });
    }

    const membership = await Membership.findOne({
        where: {
            groupId,
            memberId,
        }
    });
    if (!membership) {
        return res.status(400).json({ "message": "User couldn't be found" })
    }

})

// IMAGES
// ------------------------------------

//Add an image to a group based on group ID ✔️
router.post('/:groupId/images', requireAuth, async (req, res) => {
    const { groupId } = req.params
    const { user } = req
    const group = await Group.findByPk(groupId)
    if (!group) {
        return res.status(404).json({ message: "Group couldn't be found" });
    }
    if (user.id === group.organizerId) {


        res.status(200)
        const { url, preview } = req.body;
        const groupImage = await GroupImage.create({ url, preview });

        const newImage = {
            id: groupImage.id,
            url: groupImage.url,
            preview: groupImage.preview
        };

        return res.json(newImage);
    }
    else {
        return res.status(403).json({ message: "Forbidden" })
    }
})


module.exports = router;
