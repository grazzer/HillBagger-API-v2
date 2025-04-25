import { PrismaClient } from "../generated/prisma/client.js";

const prisma = new PrismaClient();

async function main(
  whereQuery: any,
  orderQuery: any,
  skip: number,
  take: number
) {
  try {
    const [paginatedResults, totalCount] = await prisma.$transaction([
      prisma.hills.findMany({
        skip: skip,
        take: take,
        orderBy: orderQuery,
        where: whereQuery,
      }),
      prisma.hills.count({
        where: whereQuery,
      }),
    ]);

    return { hills: paginatedResults, count: totalCount };
  } catch (error) {
    return error;
  }
}

export { main, prisma };
