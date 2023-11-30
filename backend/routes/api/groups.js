const express = require('express');
const { Op, Sequelize } = require('sequelize');
const bcrypt = require('bcryptjs');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

const { setTokenCookie, restoreUser, requireAuth } = require('../../utils/auth');
const { Group, Membership, GroupImage } = require('../../db/models');

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
        const { organizerId, name, about, type, private, city, state } = req.body;
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
        res.status(201)
        return res.json({
            group: updatedGroup
        });
    }
);

//Get all groups
router.get(
    '/',
    async (req, res) => {
        const groups = await Group.findAll({
            attributes: {
                include: [[
                    Sequelize.literal(`(
                    SELECT COUNT(*)
                    FROM "Memberships"
                    WHERE "Memberships"."groupId" = "Group"."id"
                      AND "Memberships"."status" IN ('Admin', 'Member')
                )`),
                    'numMembers'
                ]],
                // {
                //     model: Membership,
                //     where: { status: { [Op.in]: ['Admin', 'Member'] } }
                // }

            },
            include: {
                model: GroupImage,
                where: {
                    preview: true
                },
                attributes: ['url'],
            },
        });


        return res.json({ "Groups": groups });
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
    const group = await Group.findByPk(groupId,

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
    return res.json(group);
});
// VENUES
// '--------------------------------------------------'

router.get('/:groupId/venues', requireAuth, async (req, res) => {
    const { groupId } = req.params
});

router.post('/:groupId/venues', requireAuth, async (req, res) => {
    const { groupId } = req.params
});




module.exports = router;
