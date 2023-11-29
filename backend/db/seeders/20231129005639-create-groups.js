'use strict';


const { Group } = require('../models');

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
    await Group.bulkCreate([
      {
        groupId: 1,
        name: 'Dudes and Cars',
        about: 'This is a fun group for car enthusiasts!',
        type: 'Public',
        private: false,
        city: 'Oklahoma City',
        state: 'Oklahoma'
      },
      {
        groupId: 2,
        name: 'Artists United',
        about: 'This is a fun group for art enthusiasts!',
        type: 'Public',
        private: true,
        city: 'Toronto',
        state: 'Ontario'
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
    options.tableName = 'Group';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      name: { [Op.in]: ['Dudes and Cars', 'Artists United'] }
    }, {});
  }
};
