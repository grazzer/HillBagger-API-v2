import { main } from "../DataBase/hillsDb.js";
import { getSearch } from "./filterRequest/filterSearch.js";
import { getDirection } from "./filterRequest/filterDirection.js";
import { getClassification } from "./filterRequest/filterClassification.js";
import { createFindQuery } from "./filterRequest/createFindQuery.js";

// TODO: name search is case sensitive
export async function HandleSearchHills(
  classificationQuery: any,
  searchQuery: any,
  directionQuery: any,
  pageNum: any,
  itemsPerPage: number,
): Promise<{ hills: any[]; count: number }> {
  classificationQuery = classificationQuery || "";
  searchQuery = searchQuery || "";
  directionQuery = directionQuery || "";
  pageNum = pageNum || 0;
  const _classificationQuery = getClassification(classificationQuery);
  const _searchQuery = getSearch(searchQuery);
  const findQuery = createFindQuery(_searchQuery, _classificationQuery);

  const _directionQuery = getDirection(directionQuery) || { Number: "asc" };
  const _page = parseInt(pageNum) * 20 || 0;

  return await main(findQuery, _directionQuery, _page, itemsPerPage);
}
