var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { main, prisma } from "../DataBase/hillsDb.js";
import { getSearch } from "./filterRequest/filterSearch.js";
import { getDirection } from "./filterRequest/filterDirection.js";
import { getClassification } from "./filterRequest/filterClassification.js";
import { createFindQuery } from "./filterRequest/createFindQuery.js";
// TODO: name search is case sensitive
function searchHills(classificationQuery, searchQuery, directionQuery, pageNum, itemsPerPage) {
    const _classificationQuery = getClassification(classificationQuery);
    const _searchQuery = getSearch(searchQuery);
    const findQuery = createFindQuery(_searchQuery, _classificationQuery);
    const _directionQuery = getDirection(directionQuery) || { Number: "asc" };
    const _page = parseInt(pageNum) * 20 || 0;
    return new Promise((resolve, reject) => {
        main(findQuery, _directionQuery, _page, itemsPerPage)
            .then((hills) => __awaiter(this, void 0, void 0, function* () {
            resolve(hills);
        }))
            .catch((e) => __awaiter(this, void 0, void 0, function* () {
            console.error(e);
            reject(e);
            process.exit(1);
        }))
            .finally(() => __awaiter(this, void 0, void 0, function* () {
            yield prisma.$disconnect();
        }));
    });
}
export { searchHills };
