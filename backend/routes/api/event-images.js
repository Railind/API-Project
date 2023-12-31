const express = require('express');
const { Op, Sequelize } = require('sequelize');
const bcrypt = require('bcryptjs');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

const { setTokenCookie, restoreUser, requireAuth } = require('../../utils/auth');
const { Group, Venue, Event, EventImage, Attendance, GroupImage, User, Membership } = require('../../db/models');
const { url } = require('inspector');

const router = express.Router();

// It's all finished now!


router.delete('/:imageId', requireAuth, async (req, res) => {
    const { user } = req
    const { imageId } = req.params

    const image = await EventImage.findByPk(imageId, {
        include: {
            model: Event,
            include: { model: Group }
        }
    })

    if (!image) {
        return res.status(404).json({ message: "Event Image couldn't be found" })
    }
    let event = image.Event
    let group = event.Group

    const cohostCheck = await User.findByPk(user.id, {
        include: {
            model: Membership,
            where: {
                groupId: group.id,
                status: 'co-host'
            }
        }
    })


    if (user.id === group.organizerId || cohostCheck !== null) {
        await image.destroy()
        return res.status(200).json({ message: "Successfully deleted" })
    }
    else {
        res.status(403).json({ message: 'Forbidden' })
    }
})

module.exports = router;
