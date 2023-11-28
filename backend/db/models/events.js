'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Events extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Events.belongsTo(
        models.Groups,
        { foreignKey: 'groupId' }
      );

      Events.belongsTo(
        models.Venues,
        { foreignKey: 'venueId' }
      );

      Events.hasMany(
        models.EventImages,
        { foreignKey: 'eventId', hooks: true }
      );
      Events.hasMany(
        models.Attendances,
        { foreignKey: 'eventId', hooks: true }
      );

    }
  }
  Events.init({
    venueId: DataTypes.INTEGER,
    groupId: DataTypes.INTEGER,
    name: DataTypes.STRING,
    description: DataTypes.TEXT,
    type: DataTypes.ENUM,
    capacity: DataTypes.INTEGER,
    price: DataTypes.INTEGER,
    startDate: DataTypes.DATE,
    endDate: DataTypes.DATE,
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'Events',
  });
  return Events;
};
