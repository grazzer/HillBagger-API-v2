import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main(
  whereQuery: any,
  orderQuery: any,
  skip: number,
  take: number
) {
  return await prisma.hills.findMany({
    skip: skip,
    take: take,
    orderBy: orderQuery,
    where: whereQuery,
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
