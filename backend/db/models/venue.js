'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Venue extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Venue.hasMany(
        models.Event,
        { foreignKey: 'venueId', hooks: true }
      );
      Venue.belongsTo(
        models.Group,
        { foreignKey: 'groupId' }
      );
    }
  }
  Venue.init({
    groupId: DataTypes.INTEGER,
    address: {
      allowNull: false,
      type: DataTypes.STRING,
      validate: {
        notEmpty: { msg: 'Street address is required' }
      }
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'City is required' }
      }
    },
    state: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [2, 2],
        isAlpha: true,
        notEmpty: { msg: 'State is required' }

      }
    },
    lat: {
      type: DataTypes.FLOAT,
      validate: {
        numCheck(value) {
          if (Math.abs(value > 90 || value < -90)) {
            throw new Error("Latitude must be within -90 and 90")
          }
        }
      }
    },
    lng: {
      type: DataTypes.FLOAT,
      validate: {
        numCheck(value) {
          if (Math.abs(value > 180 || value < -180)) {
            throw new Error("Longitude must be within -180 and 180")
          }
        }
      }
    },
  }, {
    sequelize,
    modelName: 'Venue',
  });
  return Venue;
};
