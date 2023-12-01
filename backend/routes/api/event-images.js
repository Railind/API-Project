const express = require('express');
const { Op, Sequelize } = require('sequelize');
const bcrypt = require('bcryptjs');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

const { setTokenCookie, restoreUser, requireAuth } = require('../../utils/auth');
const { Group, Venue, Event, EventImage, Attendance, GroupImage } = require('../../db/models');
const { url } = require('inspector');

const router = express.Router();


router.delete('/:imageId', async (req, res) => {
    try {
        const deletedGroup = await Group.findByPk(req.params.groupId);
        if (deletedGroup) await deletedGroup.destroy();

        res.status(200).json({ message: 'Successfully deleted' });
    } catch (error) {
        console.error('Error deleting group:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
})

module.exports = router;
