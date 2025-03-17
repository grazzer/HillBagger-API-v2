function getSearch(req, res, next) {
  if (req.query.s) {
    const searchString = req.query.s.replace(/\s/g, "");

    if (/^[A-Za-z]+$/.test(searchString)) {
      req.query.search = {
        $or: [
          { Name: { $regex: req.query.s } },
          { County: { $regex: req.query.s } },
        ],
      };
    } else if (/^\d+$/.test(searchString)) {
      let searchNumbers = parseInt(searchString);
      req.query.search = { Number: searchNumbers };
    } else {
      console.log("mix of numbers and letters");
      // TODO: error needed ?
    }
  }
  next();
  return;
}

export { getSearch };
