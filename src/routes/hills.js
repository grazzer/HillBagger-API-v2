const router = require("express").Router();
const { getDirection } = require("../middleware/filterDirection");
const { getSearch } = require("../middleware/filterSearch");
const { getClassification } = require("../middleware/filterClassification");
const { createFindQuery } = require("../middleware/createFindQuery");
const { searchHills } = require("../services/hillsService");

router.use(getDirection);
router.use(getSearch);
router.use(getClassification);
router.use(createFindQuery);

router.get("/hills", (req, res, next) => {
  searchHills(
    req.query.findQuery,
    req.query.direction,
    req.query.p,
    req.app.locals.paginationVolume
  )
    .then((ret) => {
      res.status(200).json(ret);
    })
    .catch(() => {
      res.status(500).json({ error: "could not find data" });
    });
});

module.exports = router;
