import { connectToDb, getDb } from "../db.js";

// TODO: Move db connection
let db;

connectToDb((err) => {
  if (!err) {
    db = getDb();
  }
});
// ...............

// TODO: name search is case sensitive
function searchHills(findQuery, direction, pageNum, itemsPerPage) {
  return new Promise((resolve, reject) => {
    const _page = pageNum || 0;
    const _direction = direction || { Number: 1 };
    const _findQuery = findQuery;
    let hills = [];

    db.collection("hills")
      .find(_findQuery)
      .sort(_direction)
      .skip(_page * itemsPerPage)
      .limit(itemsPerPage)
      .forEach((hill) => {
        hills.push(hill);
      })
      .then(() => {
        resolve(hills);
      })
      .catch(() => {
        reject("error");
      });
  });
}

export { searchHills };
