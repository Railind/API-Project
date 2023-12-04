'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Membership extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Membership.belongsTo(
        models.User,
        { foreignKey: 'userId' }
      );
      Membership.belongsTo(
        models.Group,
        { foreignKey: 'groupId' }
      );
    }
  }
  Membership.init({
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Users' },
      onDelete: 'CASCADE'
    },
    groupId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Groups' },
      onDelete: 'CASCADE'

    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        typeCheck(value) {
          let valid = ['co-host', 'member', 'pending']
          if (!valid.includes(value)) {
            throw new Error("Status must be co-host, member, or pending")
          }
        }
      }
    }
  }, {
    sequelize,
    modelName: 'Membership',
  });
  return Membership;
};
