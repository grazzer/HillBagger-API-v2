import { prisma } from "./connectDb.js";

async function main(
  whereQuery: any,
  orderQuery: any,
  skip: number,
  take: number,
): Promise<{ hills: any[]; count: number }> {
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
    throw error;
  }
}

export { main };
