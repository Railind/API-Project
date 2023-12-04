'use strict';

const { Membership } = require('../models');

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}


/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
    await Membership.bulkCreate([
      {
        userId: 1,
        groupId: 2,
        status: 'co-host',
      },
      {
        userId: 2,
        groupId: 2,
        status: 'organizer',
      },
      {
        userId: 2,
        groupId: 2,
        status: 'co-host',
      },
      {
        userId: 3,
        groupId: 2,
        status: 'co-host',
      },

    ], { validate: true });
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    options.tableName = 'Membership';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      groupId: { [Op.in]: [1, 2] }
    }, {});

  }
};
