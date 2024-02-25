'use strict';

const { EventImage } = require('../models');

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
    await EventImage.bulkCreate([
      {
        eventId: 1,
        url: 'https://upload.wikimedia.org/wikipedia/en/d/db/Apex_legends_cover.jpg',
        preview: true
      },
      {
        eventId: 1,
        url: 'www.coolpicture/212',
        preview: false
      },
      {
        eventId: 2,
        url: 'https://images.wallpapersden.com/image/download/apex-legends-hd-cool-gaming-2022-art_bWlmbWaUmZqaraWkpJRnZWltrWZmamc.jpg',
        preview: true
      }


    ], { validate: true });
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */

    options.tableName = 'EventImages';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      eventId: { [Op.in]: [1, 2] }
    }, {});
  }
};
