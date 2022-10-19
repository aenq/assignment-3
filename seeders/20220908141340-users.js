'use strict';

const { hash } = require('../helpers/hash');

module.exports = {
  async up(queryInterface, Sequelize) {
    const timeNow = new Date();
    await queryInterface.bulkInsert('Users', [
      {
        username: 'papipuu',
        email: 'puguh@mail.com',
        password: hash('mypass'),
        createdAt: timeNow,
        updatedAt: timeNow
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Users', null, {});
  }
};
