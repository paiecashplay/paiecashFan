const configuration =
  require('./config');

const client =
  require('./client');

const activities =
  require('./activities');

module.exports = {
  ...configuration,
  ...client,
  ...activities,
};