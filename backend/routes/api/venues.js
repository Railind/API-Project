const express = require('express');
const { Op, Sequelize } = require('sequelize');
const bcrypt = require('bcryptjs');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

const { setTokenCookie, restoreUser, requireAuth } = require('../../utils/auth');
const { Group, Membership, GroupImage, Venue } = require('../../db/models');

const router = express.Router();


router.get('/', requireAuth, async (req, res) => {
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
