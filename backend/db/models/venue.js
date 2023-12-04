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

    },
    city: {
      type: DataTypes.STRING,
      allowNull: false
    },
    state: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [2, 2],
        isAlpha: true
      }
    },
    lat: {
      type: DataTypes.FLOAT,
      validate: {
        numCheck(value) {
          if (Math.abs(value > 90 || value < -90)) {
            throw new Error("Latitute is not valid")
          }
        }
      }
    },
    lng: {
      type: DataTypes.FLOAT,
      validate: {
        numCheck(value) {
          if (Math.abs(value > 180 || value < -180)) {
            throw new Error("Latitute is not valid")
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
