const express = require('express');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

const { setTokenCookie, restoreUser } = require('../../utils/auth');
const { Group } = require('../../db/models');

const router = express.Router();

router.post(
    '/',
    // validateSignup,
    async (req, res) => {
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

router.delete('/:groupId' async (req, res) => {

})


router.get(
    '/current',
    // validateSignup,
    async (req, res) => {
        const { email, password, username } = req.body;
        const hashedPassword = bcrypt.hashSync(password);
        const user = await User.create({ email, username, hashedPassword });

        const safeUser = {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            username: user.username,
        };

        await setTokenCookie(res, safeUser);

        return res.json({
            user: safeUser
        });
    }
);

module.exports = router;
