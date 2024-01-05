const express = require('express');
const { Op, Sequelize } = require('sequelize');
const bcrypt = require('bcryptjs');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

const { setTokenCookie, restoreUser, requireAuth } = require('../../utils/auth');
const { Group, Membership, GroupImage, Venue, User } = require('../../db/models');

const router = express.Router();


const validateVenues = [
    check('address')
        .exists({ checkFalsy: true })
        .notEmpty()
        .withMessage('Street address is required'),
    check('city')
        .exists({ checkFalsy: true })
        .notEmpty()
        .withMessage('City is required'),
    check('state')
        .exists({ checkFalsy: true })
        .notEmpty()
        .withMessage('State is required'),
    check('lat')
        .exists({ checkFalsy: true })
        .isFloat()
        .custom((value) => {
            if (Math.abs(value > 90 || value < -90)) {
                throw new Error("Latitude must be within -90 and 90")
            }
            return true
        }),
    check('lng')
        .exists({ checkFalsy: true })
        .withMessage('City is required')
        .custom((value) => {
            if (Math.abs(value > 180 || value < -180)) {
                throw new Error("Longitude must be within -180 and 180")
            }
            return true
        })
    , handleValidationErrors
]


//Edit a new venue by id ✔️ ❌
router.put('/:venueId', requireAuth, validateVenues, async (req, res) => {
    const { venueId } = req.params
    const { user } = req
    const { address, city, state, lat, lng } = req.body
    const venue = await Venue.findByPk(venueId, {
        include: { model: Group }
    })
    if (!venue) {
        return res.status(404).json({ message: "Venue couldn't be found" });
    }
    const cohostCheck = await User.findByPk(user.id, {
        include: {
            model: Membership,
            where: {
                groupId: venue.groupId,
                status: 'co-host'
            }
        }
    })
    if (user.id === venue.Group.organizerId || cohostCheck !== null) {
        res.status(200)
        const newVenue = await venue.update({ address, lat, lng, city, state });

        const editedVenue = newVenue.toJSON()

        const postedVenue = {
            id: editedVenue.id,
            groupId: editedVenue.groupId,
            address: editedVenue.address,
            city: editedVenue.city,
            state: editedVenue.state,
            lat: editedVenue.lat,
            lng: editedVenue.lng
        };

        return res.json(postedVenue);
    }
    else {
        return res.status(403).json({ message: "Forbidden" })
    }

});


router.get('/', requireAuth, validateVenues, async (req, res) => {
    const venues = await Venue.findAll({

        include: {
            model: GroupImage,
            where: {
                preview: true
            },
            attributes: ['url'],
        },
    });


    return res.json({ "Venues": venues });
});

module.exports = router;
``
