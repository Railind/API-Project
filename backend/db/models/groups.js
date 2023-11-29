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
        { foreignKey: 'groupId', hooks: true }
      );
      Group.hasMany(
        models.GroupImage,
        { foreignKey: 'groupId', hooks: true }
      );
      Group.hasMany(
        models.Membership,
        { foreignKey: 'groupId', hooks: true }
      );
      Group.hasMany(
        models.Venue,
        { foreignKey: 'groupId', hooks: true }
      );
      Group.belongsTo(
        models.User,
        { foreignKey: 'organizerId' }
      );
    }
  }
  Group.init({
    organizerId: DataTypes.INTEGER,
    name: DataTypes.STRING,
    about: DataTypes.TEXT,
    type: DataTypes.STRING,
    private: DataTypes.BOOLEAN,
    city: DataTypes.STRING,
    state: DataTypes.STRING,
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'Group',
  });
  return Group;
};
