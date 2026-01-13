import {
  createAscent,
  findSimilarAscent,
} from "../../src/DataBase/ascentDb.js";

describe("findSimilarAscent", () => {
  it("should find similar ascents based on hillID, date, and group members", async () => {
    const userId = "68f6510dc1b6f9a85d6a71c1";
    const date = "2024-06-15";
    const hillID = "6808acb64466bb2759b4cc82";
    const groupMembersIDs = [
      "68da8fb977a0aa3b66a93c40",
      "68daa68c7a9cce905085b126",
    ];
    const ascent = await createAscent(
      userId,
      date,
      hillID,
      "time",
      "weather",
      147,
      "",
      [],
      [],
      []
    );
    const similarAscents = await findSimilarAscent(
      userId,
      date,
      hillID,
      groupMembersIDs
    );
    console.log("found similar ascents - " + similarAscents);
    expect(similarAscents).toBeDefined();
    expect(Array.isArray(similarAscents)).toBe(true);
  });
});
