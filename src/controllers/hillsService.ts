import { main } from "../DataBase/hillsDb.js";
import { getSearch } from "./filterRequest/filterSearch.js";
import { getDirection } from "./filterRequest/filterDirection.js";
import { getClassification } from "./filterRequest/filterClassification.js";
import { createFindQuery } from "./filterRequest/createFindQuery.js";

// TODO: name search is case sensitive
function searchHills(
  classificationQuery: any,
  searchQuery: any,
  directionQuery: any,
  pageNum: any,
  itemsPerPage: number
) {
  const _classificationQuery = getClassification(classificationQuery);
  const _searchQuery = getSearch(searchQuery);
  const findQuery = createFindQuery(_searchQuery, _classificationQuery);

  const _directionQuery = getDirection(directionQuery) || { Number: "asc" };
  const _page = parseInt(pageNum) * 20 || 0;

  return new Promise((resolve, reject) => {
    main(findQuery, _directionQuery, _page, itemsPerPage)
      .then(async (hills) => {
        resolve(hills);
      })
      .catch(async (e) => {
        console.error(e);
        reject(e);
        process.exit(1);
      });
  });
}

export { searchHills };
function resolve(hills: unknown) {
  throw new Error("Function not implemented.");
}
