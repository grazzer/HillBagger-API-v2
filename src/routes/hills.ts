import express from "express";
import { HandleSearchHills } from "../controllers/hills.js";

const router = express.Router();

router.get("/hills/:classification", (req, res, next) => {
  HandleSearchHills(
    req.params.classification, // classification
    req.query.s, // search
    req.query.d, // direction
    req.query.p, // pagination
    req.app.locals.paginationVolume
  )
    .then((ret) => {
      // TODO: success: true,   needed to be consistent with other responses
      res.status(200).json(ret);
    })
    .catch(() => {
      // TODO: success: false,   needed to be consistent with other responses
      res.status(500).json({ error: "could not find data" });
    });
});

export { router };
