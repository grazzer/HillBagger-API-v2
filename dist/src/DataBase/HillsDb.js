var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
function main(whereQuery, orderQuery, skip, take) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield prisma.hills.findMany({
            skip: skip,
            take: take,
            orderBy: orderQuery,
            where: whereQuery,
        });
    });
}
export { main, prisma };
// const results = await prisma.post.findMany({
//   skip: 200,
//   take: 20,
//   where: {
//     email: {
//       contains: 'Prisma',
//     },
//   },
//   orderBy: {
//     title: 'desc',
//   },
// })
