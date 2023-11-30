'use strict';


const { Event } = require('../models');

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
    await Event.bulkCreate([
      {
        venueId: 1,
        groupId: 1,
        name: 'Coffee and Cars',
        description: 'Crazy cool and fun event for all car enthusiasts! Come by and have a wonderful time.',
        type: "Free",
        capacity: 40,
        price: 5.00,
        startDate: '01-02-2024',
        endDate: '01-04-2024'
      },
      {
        venueId: 2,
        groupId: 2,
        name: 'Art Station',
        description: 'Artists! Come by and join in our group work!.',
        type: "Free",
        capacity: 70,
        price: 1.00,
        startDate: '04-03-2024',
        endDate: '04-21-2024'
      },
    ], { validate: true });
  },

  async down(queryInterface, Sequelize) {
    options.tableName = 'Event';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      name: { [Op.in]: ['Art Station', 'Coffee and Cars'] }
    }, {});
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  }
};
