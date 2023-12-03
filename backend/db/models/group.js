'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Group extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Group.hasMany(
        models.Event,
        { foreignKey: 'groupId', hooks: true, onDelete: 'CASCADE' }
      );
      Group.hasMany(
        models.GroupImage,
        { foreignKey: 'groupId', hooks: true, onDelete: 'CASCADE' }
      );
      Group.hasMany(
        models.Membership,
        { foreignKey: 'groupId', hooks: true, onDelete: 'CASCADE' }
      );
      Group.hasMany(
        models.Venue,
        { foreignKey: 'groupId', hooks: true, onDelete: 'CASCADE' }
      );
      Group.belongsTo(
        models.User,
        { foreignKey: 'organizerId' }
      );
    }
  }
  Group.init({
    organizerId: DataTypes.INTEGER,
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [1, 60],
      }
    },
    about: {
      type: DataTypes.TEXT,
      allowNull: false,
      // validate: {
      //   len: {
      //     args: [50],
      //     msg: 'The attribute must have at least 60 characters.',
      //   },
      // },
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
      // validate: {
      //   isIn: {
      //     args: [['In Person', 'Online']],
      //     msg: "Type must be 'Online' or 'In person'",
      //   },
      // },
    },
    private: {
      type: DataTypes.BOOLEAN,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    state: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'Group',
  });
  return Group;
};
