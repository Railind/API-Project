'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Event extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Event.belongsTo(
        models.Group,
        { foreignKey: 'groupId' }
      );

      Event.belongsTo(
        models.Venue,
        { foreignKey: 'venueId' }
      );

      Event.hasMany(
        models.EventImage,
        { foreignKey: 'eventId', hooks: true, onDelte: 'CASCADE' }
      );
      Event.hasMany(
        models.Attendance,
        { foreignKey: 'eventId', hooks: true, onDelete: 'CASCADE' }
      );

    }
  }
  Event.init({
    venueId: {
      type: DataTypes.INTEGER,
      references: { model: 'Venues' },
      onDelete: 'SET NULL'
    },
    groupId: {
      type: DataTypes.INTEGER,
      references: { model: 'Groups' },
      allowNull: false,
      onDelete: 'CASCADE',
      hooks: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { len: [5, 255] }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    type: DataTypes.STRING,
    capacity: DataTypes.INTEGER,
    price: DataTypes.INTEGER,
    startDate: DataTypes.DATE,
    endDate: DataTypes.DATE,
  }, {
    sequelize,
    modelName: 'Event',
  });
  return Event;
};
