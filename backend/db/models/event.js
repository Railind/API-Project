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
      validate: {
        len: {
          args: [5, 255],
          msg: 'Name must be at least 5 characters'
        }
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Description is required' }
      }
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
    capacity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: { msg: 'Capacity must be an integer' }
      }
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),

      validate: {
        isPositive(value) {
          if (value < 0) {
            throw new Error('Price is invalid');
          }
        }

      }
    },
    startDate: {
      type: DataTypes.DATE,
      validate: {
        isDate: { msg: 'Must be a valid date.' },
        isAfter: {
          args: new Date().toJSON().slice(0, 10),
          msg: 'Start date must be in the future'
        }
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
