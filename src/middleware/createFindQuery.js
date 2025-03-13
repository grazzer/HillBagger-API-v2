function createFindQuery(req, res, next) {
  req.query.findQuery = {};
  if (req.query.search) {
    Object.keys(req.query.search).forEach(function eachKey(key) {
      const k = key;
      const v = req.query.search[key];
      req.query.findQuery[k] = v;
    });
  }
  if (req.query.classification) {
    const query = req.query.classification;
    Object.keys(query).forEach(function eachKey(key) {
      const k = key;
      const v = query[key];
      req.query.findQuery[k] = v;
    });
  }
  next();
  return;
}

module.exports = { createFindQuery };
