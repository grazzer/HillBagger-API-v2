const app = require("./src/app");
const port = process.env.PORT || "3000";
app.listen(3000);

// const express = require("express");
// const { connectToDb, getDb } = require("./src/db");

// //init app & middleware
// const app = express();
// app.listen(3000);

// // db connection
// let db;

// connectToDb((err) => {
//   if (!err) {
//     db = getDb();
//   }
// });

// // routes

// app.get("/munro", (req, res) => {
//   let hills = [];

//   db.collection("hills")
//     .find({ M: 1 })
//     .forEach((hill) => {
//       hills.push(hill);
//     })
//     .then(() => {
//       res.status(200).json(hills);
//     })
//     .catch(() => {
//       res.status(500).json({ error: "could not find data" });
//     });
// });

// app.get("/munro/name/:Name", (req, res) => {
//   let hills = [];

//   db.collection("hills")
//     .find({ M: 1, Name: { $regex: req.params.Name } })
//     .forEach((hill) => {
//       hills.push(hill);
//     })
//     .then(() => {
//       res.status(200).json(hills);
//     })
//     .catch(() => {
//       res.status(500).json({ error: "could not find data" });
//     });
// });

// app.get("/munro/id/:id", (req, res) => {
//   let _id = parseInt(req.params.id);
//   let hills = [];

//   db.collection("hills")
//     .find({ Number: _id })
//     .forEach((hill) => {
//       hills.push(hill);
//     })
//     .then(() => {
//       res.status(200).json(hills);
//     })
//     .catch(() => {
//       res.status(500).json({ error: "could not find data" });
//     });
// });
