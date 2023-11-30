const express = require('express');
const { Op, Sequelize } = require('sequelize');
const bcrypt = require('bcryptjs');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

const { setTokenCookie, restoreUser, requireAuth } = require('../../utils/auth');
const { Group, Membership, GroupImage, Venue, Event, EventImage } = require('../../db/models');

const router = express.Router();


router.get('/', requireAuth, async (req, res) => {
    const events = await Event.findAll({

        // include: {
        //     model: EventImage,
        //     where: {
        //         preview: true
        //     },
        //     attributes: ['url'],
        // },
    });


    return res.json({ "Events": events });
});

module.exports = router;
