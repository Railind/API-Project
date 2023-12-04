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
        { foreignKey: 'eventId', hooks: true, onDelete: 'CASCADE' }
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
    type: {
      type: DataTypes.STRING,
      validate: {
        typeChecker(value) {
          const types = ['In person', 'Online']
          if (!types.includes(value)) {
            throw new Error("Type must be Online or In person")
          }
        }
      }
    },
    capacity: { type: DataTypes.INTEGER },
    price: { type: DataTypes.DECIMAL(10, 2) },
    startDate: {
      type: DataTypes.DATE,
      validate: {
        isDate: true,
        isAfter: new Date().toJSON().slice(0, 10)
      }
    },
    endDate: {
      type: DataTypes.DATE,
      validate: {
        isDate: true,
        beforeCheck(value) {
          if (value < this.startDate) {
            throw new Error('End date is less than start date')
          }
        }
      }
    },
  }, {
    sequelize,
    modelName: 'Event',
  });
  return Event;
};
