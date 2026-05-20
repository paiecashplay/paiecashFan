const footballApi = require('./services/footballApi');
async function test() {
  const fixtures = await footballApi.getFixturesForWeek(39);
  console.log("Fixtures count:", fixtures.length);
  if (fixtures.length > 0) console.log("First fixture:", fixtures[0]);
  else console.log("No fixtures found for league 39 in season 2025");
}
test();
