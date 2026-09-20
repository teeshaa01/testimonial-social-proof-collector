const crypto = require('crypto');

const generateRandomToken = (bytes = 32) => {
  return crypto.randomBytes(bytes).toString('hex');
};

const simulateEmail = ({ to, subject, link, type }) => {
  console.log('\n' + '='.repeat(70));
  console.log(`[EMAIL SIMULATOR] Recipient: ${to}`);
  console.log(`[EMAIL SIMULATOR] Subject: ${subject}`);
  console.log(`[EMAIL SIMULATOR] Type: ${type}`);
  console.log(`[EMAIL SIMULATOR] Action URL: ${link}`);
  console.log('='.repeat(70) + '\n');

  return {
    simulated: true,
    to,
    subject,
    link,
    type
  };
};

module.exports = {
  generateRandomToken,
  simulateEmail
};
