const opencage = require("opencage-api-client");

const getCoordsFromAddress = async (address) => {
  const data = await opencage.geocode({ q: address });
  if (data.results.length > 0) {
    const place = data.results[0];
    return place.geometry;
  }
};

module.exports = getCoordsFromAddress;
