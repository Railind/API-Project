'use strict';


const { GroupImage } = require('../models');

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
    await GroupImage.bulkCreate([
      {
        groupId: 1,
        url: 'https://media.contentapi.ea.com/content/dam/apex-legends/common/articles/storm-point/updated/storm-point-map.jpg.adapt.1920w.jpg',
        preview: true
      },
      {
        groupId: 2,
        url: 'https://static.wikia.nocookie.net/apexlegends_gamepedia_en/images/6/63/Transition_Olympus.png/revision/latest/scale-to-width-down/1200?cb=20201105143428',
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
    options.tableName = 'GroupImages';
    return queryInterface.bulkDelete(options, null, {})
  }
};
