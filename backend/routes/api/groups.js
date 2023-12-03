const express = require('express');
const { Op, Sequelize } = require('sequelize');
const bcrypt = require('bcryptjs');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

const { setTokenCookie, restoreUser, requireAuth } = require('../../utils/auth');
const { Group, Membership, GroupImage, Venue, Event } = require('../../db/models');

const router = express.Router();



const validateGroups = [
    check('name')
        .exists({ checkFalsy: true })
        .isLength({ max: 4 })
        .withMessage('Name must be 60 characters or less'),
    check('about')
        .exists({ checkFalsy: true })
        .isLength({ min: 50 })
        .withMessage('About must be 50 characters or more'),
    check('type')
        .not()
        .isEmail()
        .withMessage('Username cannot be an email.'),
    check('private')
        .exists({ checkFalsy: true })
        .isLength({ min: 6 })
        .withMessage('Password must be 6 characters or more.'),
    check('city')
        .exists({ checkFalsy: true })
        .isLength({ min: 6 })
        .withMessage('Password must be 6 characters or more.'),
    check('state')
        .exists({ checkFalsy: true })
        .isLength({ min: 6 })
        .withMessage('Password must be 6 characters or more.'),
    handleValidationErrors
];




router.post('/', requireAuth, validateGroups, async (req, res) => {
    const { user } = req
    let organizerId = user.id
    const { name, about, type, private, city, state } = req.body;
    const group = await Group.create({ organizerId, name, about, type, private, city, state });

    const newGroup = {
        id: group.id,
        name: group.name,
        about: group.about,
        type: group.type,
        private: group.private,
        city: group.city,
        state: group.state
    };
    res.status(201)
    return res.json({
        group: newGroup
    });
}
);

//Delete Current Group
router.delete('/:groupId', async (req, res) => {
    try {
        const deletedGroup = await Group.findByPk(req.params.groupId);
        if (deletedGroup) await deletedGroup.destroy();

        res.status(200).json({ message: 'Successfully deleted' });
    } catch (error) {
        console.error('Error deleting group:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
})


//Update Current Group
router.put('/:groupId', requireAuth, async (req, res) => {
    try {
        const { user } = req
        const { name, about, type, private, city, state } = req.body;

        let updatedGroup = await Group.findByPk(req.params.groupId);
        if (user.id !== updatedGroup.organizerId) {
            console.error({ error: 'User does not own current group.' });
            res.status(500).json({ error: 'User does not own current group.' });
        }

        if (!updatedGroup) {
            return res.status(404).json({ error: 'Group not found' });
        }

        updatedGroup.name = name || updatedGroup.name;
        updatedGroup.about = about || updatedGroup.about;
        updatedGroup.type = type || updatedGroup.type;
        updatedGroup.private = private || updatedGroup.private;
        updatedGroup.city = city || updatedGroup.city;
        updatedGroup.state = state || updatedGroup.state;
        updatedGroup.updatedAt = new Date();

        await updatedGroup.save();

        res.status(200).json({
            group: updatedGroup
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
);

//Get all groups of current user
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
            attributes: ['url'],
            where: { preview: true },
            required: false,
            separate: true,
            limit: 1,
        }]
    });
    return res.json([...groups, ...groupMemberships]);
});

//Get group by Id
router.get('/:groupId', requireAuth, async (req, res) => {
    const { groupId } = req.params
    const group = await Group.findByPk(groupId,

    );
    if (!group) {
        return res.status(404).json({ message: "Group couldn't be found" });
    }

    return res.json(group);
});
//Get all groups
router.get('/', async (req, res) => {
    try {
        const groups = await Group.findAll({
            attributes: {
                include: [
                    [
                        Sequelize.literal(`(
                SELECT COUNT(*)
                FROM "Memberships"
                WHERE "Memberships"."groupId" = "Group"."id"
                AND "Memberships"."status" IN ('Admin', 'Member')
              )`),
                        'numMembers'
                    ]
                ],
            },
            include: [
                {
                    model: GroupImage,
                    attributes: ['url'],
                    where: { preview: true },
                    required: false,
                    separate: true,
                    limit: 1,
                },
            ],
        });

        return res.json({ Groups: groups });
    } catch (error) {
        console.error('Error fetching groups:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});
// VENUES
// '--------------------------------------------------'


//Get all Venues for a group
router.get('/:groupId/venues', requireAuth, async (req, res) => {
    const { groupId } = req.params
    const group = await Group.findByPk(groupId)
    const venues = await Venue.findAll({
        where: { groupId: groupId }
    });
    if (!group) {
        return res.status(404).json({ message: "Group couldn't be found" });
    }

    return res.json({ Venues: venues });
});


//Make a venue for a group
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

router.post('/:groupId/images', requireAuth, async (req, res) => {
    const { groupId } = req.params
    const group = await Group.findByPk(groupId)
    if (!group) {
        return res.status(404).json({ message: "Group couldn't be found" });
    }
    res.status(200)
    const { url, preview } = req.body;
    const groupImage = await GroupImage.create({ url, preview });

    const newImage = {
        id: groupImage.id,
        url: groupImage.url,
        preview: groupImage.preview
    };

    return res.json(newImage);
})


module.exports = router;
