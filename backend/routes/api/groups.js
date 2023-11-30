const express = require('express');
const { Op, Sequelize } = require('sequelize');
const bcrypt = require('bcryptjs');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

const { setTokenCookie, restoreUser, requireAuth } = require('../../utils/auth');
const { Group, Membership, GroupImage, Venue, Event } = require('../../db/models');

const router = express.Router();

// const validateGroup = [
//     check('id')
//         .exists
//         .withMessage("Group Couldn't be found")
// ]

router.post(
    '/',

    // validateSignup,
    async (req, res) => {
        await requireAuth
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
router.put(
    '/:groupId',
    // validateSignup,
    async (req, res) => {
        await requireAuth
        const { organizerId, name, about, type, private, city, state } = req.body;
        let updatedGroup = await Group.findByPk(req.params.groupId)

        updatedGroup = {
            id: updatedGroup.id,
            name: updatedGroup.name,
            about: updatedGroup.about,
            type: updatedGroup.type,
            private: updatedGroup.private,
            city: updatedGroup.city,
            state: updatedGroup.state,
        };

        updatedGroup.save()
        res.status(201)
        return res.json({
            group: updatedGroup
        });
    }
);

//Get all groups of current user
router.get('/current', requireAuth, async (req, res) => {
    const { user } = req
    const groups = await Group.findAll({
        where: { organizerId: user.id }
    });
    const groupMemberships = await Group.findAll({
        include: {
            model: Membership,
            where: { userId: user.id },
        },
        include: [
            {
                model: GroupImage,
                attributes: ['url'],
                where: { preview: true },
                required: false,
                separate: true,
                limit: 1,
            },]
        // attributes: {
        //     include: [[
        //         Sequelize.literal(`(
        //     SELECT COUNT(*)
        //     FROM "Memberships"
        //     WHERE "Memberships"."groupId" = "Group"."id"
        //       AND "Memberships"."status" IN ('Admin', 'Member')
        // )`),
        //         'memberCount'
        //     ]],
        // },
    });
    console.log(groupMemberships)

    return res.json([...groups, ...groupMemberships]);
});

//Get group by Id
router.get('/:groupId', requireAuth, async (req, res) => {
    const { groupId } = req.params
    const group = await Group.findByPk(groupId, {
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
                attributes: ['id', 'url', 'preview'],
                // where: { userId: organizerId },
                required: false,
                separate: true,
            },

            // {
            //     model: User,
            //     attributes: ['url'],
            //     where: { preview: true },
            //     required: false,
            //     separate: true,
            //     limit: 1,
            // },
            // {
            //     model: GroupImage,
            //     attributes: ['url'],
            //     where: { preview: true },
            //     required: false,
            //     separate: true,
            //     limit: 1,
            // },
        ],
        include: [
            {
                model: User,
                attributes: ['id', 'fisrtName', 'lastName'],
                required: false,
                separate: true,
            }]
    }

        // attributes: {
        //     include: [[
        //         Sequelize.literal(`(
        //     SELECT COUNT(*)
        //     FROM "Memberships"
        //     WHERE "Memberships"."groupId" = "Group"."id"
        //       AND "Memberships"."status" IN ('Admin', 'Member')
        // )`),
        //         'memberCount'
        //     ]],
        // },
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

// Events
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


// Memberships
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
        // res.Error("Couldn't find a Group with the specified id")
        return res.status(404).json({ message: "Group couldn't be found" });
    }
    const members = await Membership.findAll({
        where: { groupId: groupId }
    });

    return res.json({ Members: members });
});



module.exports = router;
