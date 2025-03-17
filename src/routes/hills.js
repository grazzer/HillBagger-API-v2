import express from "express";
import { getDirection } from "../filterRequest/filterDirection.js";
import { getSearch } from "../filterRequest/filterSearch.js";
import { getClassification } from "../filterRequest/filterClassification.js";
import { createFindQuery } from "../filterRequest/createFindQuery.js";
import { searchHills } from "../services/hillsService.js";

const router = express.Router();
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

export { router };
