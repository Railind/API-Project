'use strict';


const { Attendance } = require('../models');

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
    await Attendance.bulkCreate([
      {
        eventId: 1,
        userId: 3,
        status: 'attending',
      },
      {
        eventId: 2,
        userId: 2,
        status: 'attending',
      },
      {
        eventId: 2,
        userId: 1,
        status: 'attending',
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
    options.tableName = 'Attendances';
    return queryInterface.bulkDelete(options, null, {});;
  }
};
