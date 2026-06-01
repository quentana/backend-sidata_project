'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Users', 'rayon_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: 'Rayons', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
  },
  async down(queryInterface) {
    await queryInterface.removeColumn('Users', 'rayon_id');
  }
};
