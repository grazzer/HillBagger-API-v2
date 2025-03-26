import express from "express";
import { searchHills } from "../services/hillsService.js";
const router = express.Router();
router.get("/hills/:classification", (req, res, next) => {
    searchHills(req.params.classification, // classification
    req.query.s, // search
    req.query.d, // direction
    req.query.p, // pagination
    req.app.locals.paginationVolume)
        .then((ret) => {
        res.status(200).json(ret);
    })
        .catch(() => {
        res.status(500).json({ error: "could not find data" });
    });
});
export { router };
