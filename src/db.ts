import { MongoClient } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

let dbConnection: any;

function connectToDb(cb: any) {
  MongoClient.connect(process.env.MongoDB_URI)
    .then((client) => {
      dbConnection = client.db("hills");
      return cb();
    })
    .catch((err) => {
      console.log(err);
      return cb(err);
    });
}
function getDb() {
  return dbConnection;
}

export { connectToDb, getDb };
