'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Groups extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Groups.hasMany(
        models.Events,
        { foreignKey: 'groupId', hooks: true }
      );
      Groups.hasMany(
        models.GroupImages,
        { foreignKey: 'groupId', hooks: true }
      );
      Groups.hasMany(
        models.Memberships,
        { foreignKey: 'groupId', hooks: true }
      );
      Groups.hasMany(
        models.Venues,
        { foreignKey: 'groupId', hooks: true }
      );
      Groups.belongsTo(
        models.Users,
        { foreignKey: 'organizerId' }
      );
    }
  }
  Groups.init({
    organizerId: DataTypes.INTEGER,
    name: DataTypes.STRING,
    about: DataTypes.TEXT,
    type: DataTypes.ENUM,
    private: DataTypes.BOOLEAN,
    city: DataTypes.STRING,
    state: DataTypes.STRING,
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'Groups',
  });
  return Groups;
};
