import request, { agent } from "supertest";
import { app } from "../../src/app.js";
import type { Ascent } from "@prisma/client";
import { getProfile } from "../../src/DataBase/profileDb.js";
import { time } from "console";

// Integration tests for the ascent endpoint

let agentA = request.agent(app);
let agentB = request.agent(app);
let agentC = request.agent(app);

const ascentUserA = {
  id: "",
  name: "Ascent Tester A",
  email: "testA@ascent-email.com",
  password: "Password123!",
};

const ascentUserB = {
  id: "",
  name: "Ascent Tester B",
  email: "testB@ascent-email.com",
  password: "Password123!",
};

const ascentUserC = {
  id: "",
  name: "Ascent Tester C",
  email: "testC@ascent-email.com",
  password: "Password123!",
};

const ascentMinimal: Partial<Ascent> = {
  id: "",
  date: new Date("2025-01-01T10:00:00Z"),
  hillID: "6808acb64466bb2759b4cc85",
};

// user B id added as pending group member in setup
const ascentFriends: Partial<Ascent> = {
  id: "",
  date: new Date("2023-01-01T10:00:00Z"),
  hillID: "6808acb64466bb2759b4cc86",
  time: 3600,
  weather: "Sunny",
  distance: 10.5,
  notes: "Great hike!",
  photos: ["photo1.jpg", "photo2.jpg"],
  nonUserGroupMembers: ["bob", "ted"],
  pendingGroupMembersIDs: [],
};

const ascentThree: Partial<Ascent> = {
  id: "",
  date: new Date("2024-01-01T10:00:00Z"),
  hillID: "6808acb64466bb2759b4cc87",
  time: 30,
  weather: "raining",
  distance: 1.5,
  notes: "Great hike!",
  photos: ["photo1.jpg", "photo2.jpg"],
};

const fakeID = "6808acb64466bb2759b4cc82";

beforeEach(async () => {
  // create and log in users A, B and C
  await agentA.post("/register").send({
    name: ascentUserA.name,
    email: ascentUserA.email,
    password: ascentUserA.password,
  });
  await agentB.post("/register").send({
    name: ascentUserB.name,
    email: ascentUserB.email,
    password: ascentUserB.password,
  });
  await agentC.post("/register").send({
    name: ascentUserC.name,
    email: ascentUserC.email,
    password: ascentUserB.password,
  });
  const resA = await agentA.post("/login").send({
    email: ascentUserA.email,
    password: ascentUserA.password,
  });
  const resB = await agentB.post("/login").send({
    email: ascentUserB.email,
    password: ascentUserB.password,
  });
  const resC = await agentC.post("/login").send({
    email: ascentUserC.email,
    password: ascentUserC.password,
  });
  ascentUserA.id = resA.body.data.id;
  ascentUserB.id = resB.body.data.id;
  ascentUserC.id = resC.body.data.id;
  ascentFriends.pendingGroupMembersIDs = [ascentUserB.id];
});
afterEach(async () => {
  // log in and delete users A, B and C, this will also delete their ascents
  await agentA.post("/login").send({
    email: ascentUserA.email,
    password: ascentUserA.password,
  });
  await agentB.post("/login").send({
    email: ascentUserB.email,
    password: ascentUserB.password,
  });
  await agentC.post("/login").send({
    email: ascentUserC.email,
    password: ascentUserC.password,
  });
  await agentA.delete("/session/profile/deleteUser");
  await agentB.delete("/session/profile/deleteUser");
  await agentC.delete("/session/profile/deleteUser");
});

beforeAll(async () => {
  agentA = request.agent(app);
  agentB = request.agent(app);
  agentC = request.agent(app);
});

afterAll(async () => {
  agentA = request.agent(app);
  agentB = request.agent(app);
  agentC = request.agent(app);
});

describe("create new Ascent", () => {
  it("with no access token, should return 401", async () => {
    const response = await request(app).post("/session/ascent/create").send({
      hillID: ascentMinimal.hillID,
    });
    expect(response.status).toBe(401);
  });
  it("with no date, should return 422", async () => {
    const response = await agentA.post("/session/ascent/create").send({
      hillID: ascentMinimal.hillID,
    });
    expect(response.status).toBe(422);
    expect(response.body.errors[0].msg).toEqual("Date is required");
  });
  it("with wrong date type, should return 422", async () => {
    const response = await agentA.post("/session/ascent/create").send({
      date: 14071994,
      hillID: ascentMinimal.hillID,
    });
    expect(response.status).toBe(422);
    expect(response.body.errors[0].msg).toEqual("date must be a valid date");
  });
  it("with wrong date type, should return 422", async () => {
    const response = await agentA.post("/session/ascent/create").send({
      date: "01-01-01T10:00:00Z",
      hillID: ascentMinimal.hillID,
    });
    expect(response.status).toBe(422);
    expect(response.body.errors[0].msg).toEqual("date must be a valid date");
  });
  it("with missing hillID, should return 422", async () => {
    const response = await agentA.post("/session/ascent/create").send({
      date: ascentMinimal.date,
    });
    expect(response.status).toBe(422);
    expect(response.body.errors[0].msg).toEqual("hillID is required");
  });
  it("with incorrect hillID format, should return 422", async () => {
    const response = await agentA.post("/session/ascent/create").send({
      hillID: "12345",
      date: ascentMinimal.date,
    });
    expect(response.status).toBe(422);
    expect(response.body.errors[0].msg).toEqual("hillID must be 24 bytes long");
  });
  describe("with correct data and hillId data,", () => {
    it("but incorrect time format (string), should return 422", async () => {
      const response = await agentA.post("/session/ascent/create").send({
        date: ascentMinimal.date,
        hillID: ascentMinimal.hillID,
        time: "one hour",
      });
      expect(response.status).toBe(422);
    });
    it("but incorrect weather format (int), should return 422", async () => {
      const response = await agentA.post("/session/ascent/create").send({
        date: ascentMinimal.date,
        hillID: ascentMinimal.hillID,
        weather: 1,
      });
      expect(response.status).toBe(422);
    });
    it("but incorrect distance format (string), should return 422", async () => {
      const response = await agentA.post("/session/ascent/create").send({
        date: ascentMinimal.date,
        hillID: ascentMinimal.hillID,
        distance: "far",
      });
      expect(response.status).toBe(422);
    });
    it("but incorrect notes format (int), should return 422", async () => {
      const response = await agentA.post("/session/ascent/create").send({
        date: ascentMinimal.date,
        hillID: ascentMinimal.hillID,
        notes: 1,
      });
      expect(response.status).toBe(422);
    });
    it("but incorrect nonUserGroupMember format (not Array), should return 422", async () => {
      const response = await agentA.post("/session/ascent/create").send({
        date: ascentMinimal.date,
        hillID: ascentMinimal.hillID,
        nonUserGroupMembers: "bob",
      });
      expect(response.status).toBe(422);
    });
    it("but incorrect nonUserGroupMember format (array of int), should return 422", async () => {
      const response = await agentA.post("/session/ascent/create").send({
        date: ascentMinimal.date,
        hillID: ascentMinimal.hillID,
        nonUserGroupMembers: [1, 2, 3],
      });
      expect(response.status).toBe(422);
    });
    it("but incorrect pendingGroupMembersIDs format (not Array), should return 422", async () => {
      const response = await agentA.post("/session/ascent/create").send({
        date: ascentMinimal.date,
        hillID: ascentMinimal.hillID,
        pendingGroupMembersIDs: "bob",
      });
      expect(response.status).toBe(422);
    });
    it("but incorrect pendingGroupMembersIDs format (not objectID), should return 422", async () => {
      const response = await agentA.post("/session/ascent/create").send({
        date: ascentMinimal.date,
        hillID: ascentMinimal.hillID,
        pendingGroupMembersIDs: [
          "1a2b3c4d5efg",
          "67890",
          "abcdefghij123456789qwert",
        ],
      });
      expect(response.status).toBe(422);
    });
  });
  it("with ascentMinimal data, should return 200 and ascent data", async () => {
    const response = await agentA
      .post("/session/ascent/create")
      .send({
        date: ascentMinimal.date,
        hillID: ascentMinimal.hillID,
      })
      .then((res) => {
        ascentMinimal.id = res.body.data.id;
        return res;
      });
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty("id");
    expect(new Date(response.body.data.date)).toEqual(ascentMinimal.date);
    expect(response.body.data.hillID).toEqual(ascentMinimal.hillID);
    expect(response.body.data.groupMembersIDs).toEqual(
      expect.arrayContaining([ascentUserA.id]),
    );
  });
  it("with ascentFriends data with user B as pending invite, should return 200 and ascent data", async () => {
    const response = await agentA
      .post("/session/ascent/create")
      .send({
        date: ascentFriends.date,
        hillID: ascentFriends.hillID,
        time: ascentFriends.time,
        weather: ascentFriends.weather,
        distance: ascentFriends.distance,
        notes: ascentFriends.notes,
        photos: ascentFriends.photos,
        nonUserGroupMembers: ascentFriends.nonUserGroupMembers,
        pendingGroupMembersIDs: ascentFriends.pendingGroupMembersIDs,
      })
      .then((res) => {
        ascentFriends.id = res.body.data.id;
        return res;
      });
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty("id");
    expect(new Date(response.body.data.date)).toEqual(ascentFriends.date);
    expect(response.body.data.hillID).toEqual(ascentFriends.hillID);
    expect(response.body.data.time).toEqual(ascentFriends.time);
    expect(response.body.data.weather).toEqual(ascentFriends.weather);
    expect(response.body.data.distance).toEqual(ascentFriends.distance);
    expect(response.body.data.notes).toEqual(ascentFriends.notes);
    expect(response.body.data.photos).toEqual(ascentFriends.photos);
    expect(response.body.data.nonUserGroupMembers).toEqual(
      ascentFriends.nonUserGroupMembers,
    );
    expect(response.body.data.pendingGroupMembersIDs).toEqual(
      expect.arrayContaining([ascentUserB.id]),
    );
    expect(response.body.data.groupMembersIDs).toEqual(
      expect.arrayContaining([ascentUserA.id]),
    );
  });
  it("twice with the same ascentFriends data, should return 403 and array containing ascentFriends data ", async () => {
    await agentA.post("/session/ascent/create").send({
      date: ascentFriends.date,
      hillID: ascentFriends.hillID,
      time: ascentFriends.time,
      weather: ascentFriends.weather,
      distance: ascentFriends.distance,
      notes: ascentFriends.notes,
      photos: ascentFriends.photos,
      nonUserGroupMembers: ascentFriends.nonUserGroupMembers,
      pendingGroupMembersIDs: ascentFriends.pendingGroupMembersIDs,
    });

    const response = await agentA.post("/session/ascent/create").send({
      date: ascentFriends.date,
      hillID: ascentFriends.hillID,
      time: ascentFriends.time,
      weather: ascentFriends.weather,
      distance: ascentFriends.distance,
      notes: ascentFriends.notes,
      photos: ascentFriends.photos,
      nonUserGroupMembers: ascentFriends.nonUserGroupMembers,
      pendingGroupMembersIDs: ascentFriends.pendingGroupMembersIDs,
    });
    expect(response.status).toBe(403);
    expect(response.body.success).toBe(false);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBeGreaterThan(0);
    expect(response.body.data[0]).toHaveProperty("id");
    expect(new Date(response.body.data[0].date)).toEqual(ascentFriends.date);
    expect(response.body.data[0].hillID).toEqual(ascentFriends.hillID);
  });
  it("twice the first with just the date and hill id from ascentFriends data the second with the full ascentFriends data, should return 403 and array containing ascentFriends data ", async () => {
    await agentA.post("/session/ascent/create").send({
      date: ascentFriends.date,
      hillID: ascentFriends.hillID,
    });

    const response = await agentA.post("/session/ascent/create").send({
      date: ascentFriends.date,
      hillID: ascentFriends.hillID,
      time: ascentFriends.time,
      weather: ascentFriends.weather,
      distance: ascentFriends.distance,
      notes: ascentFriends.notes,
      photos: ascentFriends.photos,
      nonUserGroupMembers: ascentFriends.nonUserGroupMembers,
      pendingGroupMembersIDs: ascentFriends.pendingGroupMembersIDs,
    });
    expect(response.status).toBe(403);
    expect(response.body.success).toBe(false);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBeGreaterThan(0);
    expect(response.body.data[0]).toHaveProperty("id");
    expect(new Date(response.body.data[0].date)).toEqual(ascentFriends.date);
    expect(response.body.data[0].hillID).toEqual(ascentFriends.hillID);
  });
  it("twice with the same ascentFriends data but each created by two users, should return 403 and array containing ascentFriends data ", async () => {
    await agentB.post("/session/ascent/create").send({
      date: ascentFriends.date,
      hillID: ascentFriends.hillID,
      time: ascentFriends.time,
      weather: ascentFriends.weather,
      distance: ascentFriends.distance,
      notes: ascentFriends.notes,
      photos: ascentFriends.photos,
      nonUserGroupMembers: ascentFriends.nonUserGroupMembers,
      pendingGroupMembersIDs: ascentFriends.pendingGroupMembersIDs,
    });

    const response = await agentA.post("/session/ascent/create").send({
      date: ascentFriends.date,
      hillID: ascentFriends.hillID,
      time: ascentFriends.time,
      weather: ascentFriends.weather,
      distance: ascentFriends.distance,
      notes: ascentFriends.notes,
      photos: ascentFriends.photos,
      nonUserGroupMembers: ascentFriends.nonUserGroupMembers,
      pendingGroupMembersIDs: ascentFriends.pendingGroupMembersIDs,
    });
    expect(response.status).toBe(403);
    expect(response.body.success).toBe(false);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBeGreaterThan(0);
    expect(response.body.data[0]).toHaveProperty("id");
    expect(new Date(response.body.data[0].date)).toEqual(ascentFriends.date);
    expect(response.body.data[0].hillID).toEqual(ascentFriends.hillID);
  });
  it("with the same date and hillId as ascentFriends with rejectSimilar set to true, should return 200 and ascent data", async () => {
    const response = await agentA.post("/session/ascent/create").send({
      rejectSimilar: true,
      date: ascentFriends.date,
      hillID: ascentFriends.hillID,
      time: ascentFriends.time,
      weather: ascentFriends.weather,
      distance: ascentFriends.distance,
      notes: ascentFriends.notes,
      photos: ascentFriends.photos,
      nonUserGroupMembers: ascentFriends.nonUserGroupMembers,
      pendingGroupMembersIDs: ascentFriends.pendingGroupMembersIDs,
    });
    ascentThree.id = response.body.data.id;
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty("id");
    expect(new Date(response.body.data.date)).toEqual(ascentFriends.date);
    expect(response.body.data.hillID).toEqual(ascentFriends.hillID);
    expect(response.body.data.id).not.toEqual(ascentFriends.id);
  });
});

describe("request to join existing ascent", () => {
  // user A will create ascentFriend ascent
  // user C will request to join ascentFriend ascent
  // user B will request to join ascentFriend ascent, user is already a pending member
  // user A will request to join ascentFriend ascent, user is already a member
  let ascentId: string;
  beforeEach(async () => {
    const res = await agentA.post("/session/ascent/create").send({
      date: ascentFriends.date,
      hillID: ascentFriends.hillID,
      time: ascentFriends.time,
      weather: "testy",
      distance: ascentFriends.distance,
      notes: ascentFriends.notes,
      photos: ascentFriends.photos,
      nonUserGroupMembers: ascentFriends.nonUserGroupMembers,
      pendingGroupMembersIDs: ascentFriends.pendingGroupMembersIDs,
    });
    ascentId = res.body.data.id;
    await agentB
      .put("/session/ascent/join/request")
      .send({ ascentId: ascentId });
  });

  it("with incorrect ascent ID format (not ObjectId), should return 422", async () => {
    const response = await agentC.put("/session/ascent/join/request").send({
      ascentId: "12345",
    });
    expect(response.status).toBe(422);
  });
  it("with non-existing ascent, should return 404", async () => {
    const response = await agentC.put("/session/ascent/join/request").send({
      ascentId: fakeID,
    });
    expect(response.status).toBe(404);
  });
  describe("with correct data", () => {
    it("which the user is already a member of, should return 400", async () => {
      const response = await agentA.put("/session/ascent/join/request").send({
        ascentId: ascentId,
      });
      expect(response.status).toBe(400);
    });
    it("which the user is already a pending member of, should return 400", async () => {
      const response = await agentB.put("/session/ascent/join/request").send({
        ascentId: ascentId,
      });
      expect(response.status).toBe(400);
    });
    it("should return 200", async () => {
      const response = await agentC.put("/session/ascent/join/request").send({
        ascentId: ascentId,
      });
      expect(response.status).toBe(200);
      expect(response.body.message).toBe(
        `Requested to join ascent group successfully`,
      );
    });
    it("which the user has already requested, should return 200", async () => {
      const response = await agentC.put("/session/ascent/join/request").send({
        ascentId: ascentId,
      });
      expect(response.status).toBe(200);
      expect(response.body.message).toBe(
        `Requested to join ascent group successfully`,
      );
    });
  });
});

describe("accept request to join ascent", () => {
  // user A is a member of the ascent, user C has requested to join
  let ascentId: string;
  beforeEach(async () => {
    const res = await agentA.post("/session/ascent/create").send({
      date: ascentFriends.date,
      hillID: ascentFriends.hillID,
      time: ascentFriends.time,
      weather: ascentFriends.weather,
      distance: ascentFriends.distance,
      notes: ascentFriends.notes,
      photos: ascentFriends.photos,
      nonUserGroupMembers: ascentFriends.nonUserGroupMembers,
      pendingGroupMembersIDs: ascentFriends.pendingGroupMembersIDs,
    });
    ascentId = res.body.data.id;
    await agentC.put("/session/ascent/join/request").send({
      ascentId: ascentId,
    });
  });
  it("with incorrect ascent ID format (not ObjectId), should return 422", async () => {
    const response = await agentA.put("/session/ascent/join/accept").send({
      ascentId: "12345",
      requestedUserId: fakeID,
    });
    expect(response.status).toBe(422);
  });
  it("with no requestedUserId, should return 422", async () => {
    const response = await agentA.put("/session/ascent/join/accept").send({
      ascentId: fakeID,
    });
    expect(response.status).toBe(422);
  });
  it("with non-existing ascent, should return 404", async () => {
    const response = await agentA.put("/session/ascent/join/accept").send({
      ascentId: fakeID,
      requestedUserId: ascentUserC.id,
    });
    expect(response.status).toBe(404);
    expect(response.body.message).toEqual("The ascent cannot be found");
  });
  it("with incorrect requestedUserId to accept, should return 404", async () => {
    const response = await agentA.put("/session/ascent/join/accept").send({
      ascentId: ascentId,
      requestedUserId: fakeID,
    });
    expect(response.status).toBe(404);
    expect(response.body.message).toEqual(
      "user has not requested to join this ascent",
    );
  });
  it("when user to accept has not requested to join ascent, expect 404", async () => {
    const response = await agentA.put("/session/ascent/join/accept").send({
      ascentId: ascentId,
      requestedUserId: ascentUserB.id,
    });
    expect(response.status).toBe(404);
    expect(response.body.message).toEqual(
      "user has not requested to join this ascent",
    );
  });
  it("when the user is not a member (has no authority to edit) of the ascent, expect 401", async () => {
    const response = await agentB.put("/session/ascent/join/accept").send({
      ascentId: ascentId,
      requestedUserId: ascentUserC.id,
    });
    expect(response.status).toBe(401);
    expect(response.body.message).toEqual(
      "user is not authorized edit requests for this ascent",
    );
  });
  it("as a member of the ascent, expect 200 and the invitee id to be removed from requestedGroupMembersIDs", async () => {
    const response = await agentA.put("/session/ascent/join/accept").send({
      ascentId: ascentId,
      requestedUserId: ascentUserC.id,
    });
    expect(response.status).toBe(200);
    expect(response.body.message).toEqual("user has been added to the ascent");
  });
  it("when user to accept is already a member of the ascent, expect 404", async () => {
    // set up
    await agentA.put("/session/ascent/join/accept").send({
      ascentId: ascentId,
      requestedUserId: ascentUserC.id,
    });
    // test
    const response = await agentA.put("/session/ascent/join/accept").send({
      ascentId: ascentId,
      requestedUserId: ascentUserC.id,
    });
    expect(response.status).toBe(404);
    expect(response.body.message).toEqual(
      "user has not requested to join this ascent",
    );
  });
});

describe("reject request to join ascent", () => {
  // user A is a member of the ascent, user C has requested to join
  let ascentId: string;
  beforeEach(async () => {
    const res = await agentA.post("/session/ascent/create").send({
      date: ascentFriends.date,
      hillID: ascentFriends.hillID,
      time: ascentFriends.time,
      weather: ascentFriends.weather,
      distance: ascentFriends.distance,
      notes: ascentFriends.notes,
      photos: ascentFriends.photos,
      nonUserGroupMembers: ascentFriends.nonUserGroupMembers,
      pendingGroupMembersIDs: ascentFriends.pendingGroupMembersIDs,
    });
    ascentId = res.body.data.id;
    await agentC.put("/session/ascent/join/request").send({
      ascentId: ascentId,
    });
  });
  it("should return 200 and user Id should be removed from requestedGroupMembersIDs", async () => {
    const response = await agentA.put("/session/ascent/join/reject").send({
      ascentId: ascentId,
      requestedUserId: ascentUserC.id,
    });
    expect(response.status).toBe(200);
    expect(response.body.message).toBe(
      "user's request to join has been rejected",
    );
  });
});

describe("remove Request to join ascent", () => {
  // user A has created an ascent, user B has requested to join
  let ascentOneId: string;
  beforeEach(async () => {
    const resOne = await agentA.post("/session/ascent/create").send({
      date: ascentFriends.date,
      hillID: ascentFriends.hillID,
    });
    ascentOneId = resOne.body.data.id;
    await agentB.put("/session/ascent/join/request").send({
      ascentId: ascentOneId,
    });
  });
  it("with no ascentId, should return 422", async () => {
    const response = await agentB.delete("/session/ascent/join/remove");
    expect(response.status).toBe(422);
  });
  it("with incorrect ascent ID format (not ObjectId), should return 422", async () => {
    const response = await agentB.delete("/session/ascent/join/remove").send({
      ascentId: "12ABC345",
    });
    expect(response.status).toBe(422);
  });
  it("with non-existing ascentId, should return 404", async () => {
    const response = await agentB.delete("/session/ascent/join/remove").send({
      ascentId: fakeID,
    });
    expect(response.status).toBe(404);
    expect(response.body.message).toBe("This ascent cannot be found");
  });
  it("with an existing ascentId but they have not requested to join, should return 404", async () => {
    const response = await agentC.delete("/session/ascent/join/remove").send({
      ascentId: ascentOneId,
    });
    expect(response.status).toBe(404);
    expect(response.body.message).toBe(
      "user has not requested to join this ascent",
    );
  });
  it("with an existing ascentId and they have requested to join, should return 200 and user Id should be removed from requestedGroupMembersIDs", async () => {
    const response = await agentB.delete("/session/ascent/join/remove").send({
      ascentId: ascentOneId,
    });
    expect(response.status).toBe(200);
    expect(response.body.message).toBe(
      "your request to join the ascent has been removed",
    );
  });
});

describe("accept invite to join ascent", () => {
  // user A has created an ascent, user B is invited join
  let ascentId: string;
  beforeEach(async () => {
    const res = await agentA.post("/session/ascent/create").send({
      date: ascentFriends.date,
      hillID: ascentFriends.hillID,
      pendingGroupMembersIDs: ascentFriends.pendingGroupMembersIDs,
    });
    ascentId = res.body.data.id;
  });
  it("with no ascentId, should return 422", async () => {
    const response = await agentB.put("/session/ascent/invite/accept");
    expect(response.status).toBe(422);
  });
  it("with incorrect ascentId format (not ObjectId), should return 422", async () => {
    const response = await agentB.put("/session/ascent/invite/accept").send({
      ascentId: "123AbC456",
    });
    expect(response.status).toBe(422);
  });
  it("with non existing ascentId, should return 404", async () => {
    const response = await agentB.put("/session/ascent/invite/accept").send({
      ascentId: fakeID,
    });
    expect(response.status).toBe(404);
    expect(response.body.message).toBe("ascent cannot be found");
  });
  it("when not invited to join, should return 401", async () => {
    const response = await agentC.put("/session/ascent/invite/accept").send({
      ascentId: ascentId,
    });
    expect(response.status).toBe(401);
    expect(response.body.message).toBe(
      "user is not authorized to respond to this invitation",
    );
  });
  it("when a member of the ascent, should return 401", async () => {
    const response = await agentA.put("/session/ascent/invite/accept").send({
      ascentId: ascentId,
    });
    expect(response.status).toBe(401);
    expect(response.body.message).toBe(
      "user is not authorized to respond to this invitation",
    );
  });
  it("when invited to join, should return 200 and user Id should be removed from pendingGroupMembersIDs", async () => {
    const response = await agentB.put("/session/ascent/invite/accept").send({
      ascentId: ascentId,
    });
    expect(response.status).toBe(200);
    expect(response.body.message).toBe("you have been added to the ascent");
    expect(response.body.data.groupMembersIDs).toEqual(
      expect.arrayContaining([ascentUserB.id]),
    );
    expect(response.body.data.pendingGroupMembersIDs).not.toEqual(
      expect.arrayContaining([ascentUserB.id]),
    );
  });
});

describe("reject invite to join ascent", () => {
  let ascentId: string;
  beforeEach(async () => {
    const res = await agentA.post("/session/ascent/create").send({
      date: ascentFriends.date,
      hillID: ascentFriends.hillID,
      pendingGroupMembersIDs: ascentFriends.pendingGroupMembersIDs,
    });
    ascentId = res.body.data.id;
  });
  it("when invited to join, should return 200 and user Id should be removed from pendingGroupMembersIDs", async () => {
    const response = await agentB.put("/session/ascent/invite/reject").send({
      ascentId: ascentId,
    });
    expect(response.status).toBe(200);
    expect(response.body.message).toBe(
      "you have declined the invitation to the ascent",
    );
    expect(response.body.data.groupMembersIDs).not.toEqual(
      expect.arrayContaining([ascentUserB.id]),
    );
    expect(response.body.data.pendingGroupMembersIDs).not.toEqual(
      expect.arrayContaining([ascentUserB.id]),
    );
  });
});

describe("remove invite to join ascent", () => {
  // user A has created an ascent, user B is invited join
  let ascentId: string;
  beforeEach(async () => {
    const res = await agentA.post("/session/ascent/create").send({
      date: ascentFriends.date,
      hillID: ascentFriends.hillID,
      pendingGroupMembersIDs: [ascentUserB.id],
    });
    ascentId = res.body.data.id;
  });
  afterAll(async () => {
    await agentA.delete("/session/ascent/leave").send({ ascentId: ascentId });
  });
  it("with no ascentId, should return 422", async () => {
    const response = await agentA.delete("/session/ascent/invite/remove").send({
      removeUserId: fakeID,
    });
    expect(response.status).toBe(422);
  });
  it("with no removeUserId, should return 422", async () => {
    const response = await agentA.delete("/session/ascent/invite/remove").send({
      ascentId: fakeID,
    });
    expect(response.status).toBe(422);
  });
  it("with incorrect ascentId format (not ObjectId), should return 422", async () => {
    const response = await agentA.delete("/session/ascent/invite/remove").send({
      ascentId: "123ABC456",
      removeUserId: fakeID,
    });
    expect(response.status).toBe(422);
  });
  it("with removeUserId format (not ObjectId), should return 422", async () => {
    const response = await agentA.delete("/session/ascent/invite/remove").send({
      ascentId: fakeID,
      removeUserId: "123ABC456",
    });
    expect(response.status).toBe(422);
  });
  it("with non existing ascentId, should return 404", async () => {
    const response = await agentA.delete("/session/ascent/invite/remove").send({
      ascentId: fakeID,
      removeUserId: ascentUserB.id,
    });
    expect(response.status).toBe(404);
    expect(response.body.message).toBe("ascent cannot be found");
  });
  it("when not invited to join, should return 404", async () => {
    const response = await agentA.delete("/session/ascent/invite/remove").send({
      ascentId: ascentId,
      removeUserId: ascentUserC.id,
    });
    expect(response.status).toBe(404);
    expect(response.body.message).toBe(
      "the invited user cannot be found on this ascent",
    );
  });
  it("when not a member of the ascent, should return 401", async () => {
    const response = await agentB.delete("/session/ascent/invite/remove").send({
      ascentId: ascentId,
      removeUserId: ascentUserB.id,
    });
    expect(response.status).toBe(401);
    expect(response.body.message).toBe(
      "user is not authorized edit this ascent",
    );
  });
  it("when invited to join, should return 200 and user Id should be removed from pendingGroupMembersIDs", async () => {
    const response = await agentA.delete("/session/ascent/invite/remove").send({
      ascentId: ascentId,
      removeUserId: ascentUserB.id,
    });
    expect(response.status).toBe(200);
    expect(response.body.message).toBe(
      "the invited user has been removed from the ascent",
    );
    expect(response.body.data.pendingGroupMembersIDs).not.toEqual(
      expect.arrayContaining([ascentUserB.id]),
    );
    expect(response.body.data.groupMembersIDs).not.toEqual(
      expect.arrayContaining([ascentUserB.id]),
    );
  });
});

describe("update ascent", () => {
  let ascentIdEmpty: string;
  let ascentIdFull: string;
  beforeEach(async () => {
    const resEmpty = await agentA.post("/session/ascent/create").send({
      rejectSimilar: true,
      date: ascentFriends.date,
      hillID: ascentFriends.hillID,
    });
    const resFull = await agentA.post("/session/ascent/create").send({
      rejectSimilar: true,
      date: ascentFriends.date,
      hillID: ascentFriends.hillID,
      time: ascentFriends.time,
      weather: ascentFriends.weather,
      distance: ascentFriends.distance,
      notes: ascentFriends.notes,
      photos: ascentFriends.photos,
      nonUserGroupMembers: ascentFriends.nonUserGroupMembers,
      pendingGroupMembersIDs: [ascentUserB.id],
    });
    ascentIdEmpty = resEmpty.body.data.id;
    ascentIdFull = resFull.body.data.id;
  });
  it("with no ascentId, should return 422", async () => {
    const response = await agentA.put("/session/ascent/update").send({
      date: ascentFriends.date,
      hillID: ascentFriends.hillID,
    });
    expect(response.status).toBe(422);
  });
  it("with no Date, should return 422", async () => {
    const response = await agentA.put("/session/ascent/update").send({
      ascentId: ascentIdEmpty,
      hillID: ascentFriends.hillID,
    });
    expect(response.status).toBe(422);
  });
  it("with no hillID, should return 422", async () => {
    const response = await agentA.put("/session/ascent/update").send({
      ascentId: ascentIdEmpty,
      date: ascentFriends.date,
    });
    expect(response.status).toBe(422);
  });
  it("with non-existing ascentId, should return 404", async () => {
    const response = await agentA.put("/session/ascent/update").send({
      ascentId: fakeID,
      date: ascentFriends.date,
      hillID: ascentFriends.hillID,
    });
    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Ascent not found");
  });
  it("when not a member of the ascent, should return 401", async () => {
    const response = await agentB.put("/session/ascent/update").send({
      ascentId: ascentIdEmpty,
      date: ascentFriends.date,
      hillID: ascentFriends.hillID,
    });
    expect(response.status).toBe(401);
    expect(response.body.message).toBe(
      "user is not authorized to edit this ascent",
    );
  });
  it("with correct information except time format", async () => {
    const response = await agentA.put("/session/ascent/update").send({
      ascentId: ascentIdEmpty,
      date: ascentFriends.date,
      hillID: ascentFriends.hillID,
      time: "12:00 PM",
      weather: ascentFriends.weather,
      distance: ascentFriends.distance,
      notes: ascentFriends.notes,
      photos: ascentFriends.photos,
      nonUserGroupMembers: ascentFriends.nonUserGroupMembers,
      pendingGroupMembersIDs: [ascentUserB.id],
    });
    expect(response.status).toBe(422);
  });
  it("with correct information except time format", async () => {
    const response = await agentA.put("/session/ascent/update").send({
      ascentId: ascentIdEmpty,
      date: ascentFriends.date,
      hillID: ascentFriends.hillID,
      time: "2023-01-01T10:00:00Z",
      weather: ascentFriends.weather,
      distance: ascentFriends.distance,
      notes: ascentFriends.notes,
      photos: ascentFriends.photos,
      nonUserGroupMembers: ascentFriends.nonUserGroupMembers,
      pendingGroupMembersIDs: [ascentUserB.id],
    });
    expect(response.status).toBe(422);
  });
  it("with correct information except weather format", async () => {
    const response = await agentA.put("/session/ascent/update").send({
      ascentId: ascentIdEmpty,
      date: ascentFriends.date,
      hillID: ascentFriends.hillID,
      time: ascentFriends.time,
      weather: 9,
      distance: ascentFriends.distance,
      notes: ascentFriends.notes,
      photos: ascentFriends.photos,
      nonUserGroupMembers: ascentFriends.nonUserGroupMembers,
      pendingGroupMembersIDs: [ascentUserB.id],
    });
    expect(response.status).toBe(422);
  });
  it("with correct information except weather format", async () => {
    const response = await agentA.put("/session/ascent/update").send({
      ascentId: ascentIdEmpty,
      date: ascentFriends.date,
      hillID: ascentFriends.hillID,
      time: ascentFriends.time,
      weather: "9",
      distance: ascentFriends.distance,
      notes: ascentFriends.notes,
      photos: ascentFriends.photos,
      nonUserGroupMembers: ascentFriends.nonUserGroupMembers,
      pendingGroupMembersIDs: [ascentUserB.id],
    });
    expect(response.status).toBe(422);
  });
  it("with correct information except distance format", async () => {
    const response = await agentA.put("/session/ascent/update").send({
      ascentId: ascentIdEmpty,
      date: ascentFriends.date,
      hillID: ascentFriends.hillID,
      time: ascentFriends.time,
      weather: ascentFriends.weather,
      distance: "10 km",
      notes: ascentFriends.notes,
      photos: ascentFriends.photos,
      nonUserGroupMembers: ascentFriends.nonUserGroupMembers,
      pendingGroupMembersIDs: [ascentUserB.id],
    });
    expect(response.status).toBe(422);
  });
  it("with correct information except notes format", async () => {
    const response = await agentA.put("/session/ascent/update").send({
      ascentId: ascentIdEmpty,
      date: ascentFriends.date,
      hillID: ascentFriends.hillID,
      time: ascentFriends.time,
      weather: ascentFriends.weather,
      distance: ascentFriends.distance,
      notes: 123,
      photos: ascentFriends.photos,
      nonUserGroupMembers: ascentFriends.nonUserGroupMembers,
      pendingGroupMembersIDs: [ascentUserB.id],
    });
    expect(response.status).toBe(422);
  });
  it("with correct information except notes format", async () => {
    const response = await agentA.put("/session/ascent/update").send({
      ascentId: ascentIdEmpty,
      date: ascentFriends.date,
      hillID: ascentFriends.hillID,
      time: ascentFriends.time,
      weather: ascentFriends.weather,
      distance: ascentFriends.distance,
      notes: [1, 2, 3],
      photos: ascentFriends.photos,
      nonUserGroupMembers: ascentFriends.nonUserGroupMembers,
      pendingGroupMembersIDs: [ascentUserB.id],
    });
    expect(response.status).toBe(422);
  });
  it("with correct information except photos format", async () => {
    const response = await agentA.put("/session/ascent/update").send({
      ascentId: ascentIdEmpty,
      date: ascentFriends.date,
      hillID: ascentFriends.hillID,
      time: ascentFriends.time,
      weather: ascentFriends.weather,
      distance: ascentFriends.distance,
      notes: ascentFriends.notes,
      photos: "photo1.jpg",
      nonUserGroupMembers: ascentFriends.nonUserGroupMembers,
      pendingGroupMembersIDs: [ascentUserB.id],
    });
    expect(response.status).toBe(422);
  });
  it("with correct information except nonUserGroupMembers format", async () => {
    const response = await agentA.put("/session/ascent/update").send({
      ascentId: ascentIdEmpty,
      date: ascentFriends.date,
      hillID: ascentFriends.hillID,
      time: ascentFriends.time,
      weather: ascentFriends.weather,
      distance: ascentFriends.distance,
      notes: ascentFriends.notes,
      photos: ascentFriends.photos,
      nonUserGroupMembers: "ben",
      pendingGroupMembersIDs: [ascentUserB.id],
    });
    expect(response.status).toBe(422);
  });
  it("with correct information except nonUserGroupMembers format", async () => {
    const response = await agentA.put("/session/ascent/update").send({
      ascentId: ascentIdEmpty,
      date: ascentFriends.date,
      hillID: ascentFriends.hillID,
      time: ascentFriends.time,
      weather: ascentFriends.weather,
      distance: ascentFriends.distance,
      notes: ascentFriends.notes,
      photos: ascentFriends.photos,
      nonUserGroupMembers: [10, "tom"],
      pendingGroupMembersIDs: [ascentUserB.id],
    });
    expect(response.status).toBe(422);
  });
  it("with correct information, and all other fields empty, full ascent data should be updated to empty", async () => {
    const response = await agentA.put("/session/ascent/update").send({
      ascentId: ascentIdFull,
      date: ascentFriends.date,
      hillID: ascentFriends.hillID,
    });
    expect(response.status).toBe(200);
    expect(response.body.data.id).toEqual(ascentIdFull);
    expect(new Date(response.body.data.date)).toEqual(ascentFriends.date);
    expect(response.body.data.hillID).toEqual(ascentFriends.hillID);
    expect(response.body.data.time).toBeNull();
    expect(response.body.data.weather).toEqual("");
    expect(response.body.data.distance).toBeNull();
    expect(response.body.data.notes).toEqual("");
    expect(response.body.data.photos).toEqual([""]);
    expect(response.body.data.nonUserGroupMembers).toEqual([""]);
    expect(response.body.data.pendingGroupMembersIDs).toEqual(
      ascentFriends.pendingGroupMembersIDs,
    );
  });
  it("with correct information, and all other fields full, empty ascent data should be updated to full", async () => {
    const response = await agentA.put("/session/ascent/update").send({
      ascentId: ascentIdEmpty,
      date: ascentFriends.date,
      hillID: ascentFriends.hillID,
      time: ascentFriends.time,
      weather: ascentFriends.weather,
      distance: ascentFriends.distance,
      notes: ascentFriends.notes,
      photos: ascentFriends.photos,
      nonUserGroupMembers: ascentFriends.nonUserGroupMembers,
      pendingGroupMembersIDs: [ascentUserB.id],
    });
    expect(response.status).toBe(200);
    expect(response.body.data.id).toEqual(ascentIdEmpty);
    expect(new Date(response.body.data.date)).toEqual(ascentFriends.date);
    expect(response.body.data.hillID).toEqual(ascentFriends.hillID);
    expect(response.body.data.time).toEqual(ascentFriends.time);
    expect(response.body.data.weather).toEqual(ascentFriends.weather);
    expect(response.body.data.distance).toEqual(ascentFriends.distance);
    expect(response.body.data.notes).toEqual(ascentFriends.notes);
    expect(response.body.data.photos).toEqual(ascentFriends.photos);
    expect(response.body.data.nonUserGroupMembers).toEqual(
      ascentFriends.nonUserGroupMembers,
    );
    expect(response.body.data.pendingGroupMembersIDs).toEqual(
      ascentFriends.pendingGroupMembersIDs,
    );
  });
});

describe("leave ascent", () => {
  beforeEach(async () => {
    const res = await agentA.post("/session/ascent/create").send({
      date: ascentFriends.date,
      hillID: ascentFriends.hillID,
      time: ascentFriends.time,
      weather: ascentFriends.weather,
      distance: ascentFriends.distance,
      notes: ascentFriends.notes,
      photos: ascentFriends.photos,
      nonUserGroupMembers: ascentFriends.nonUserGroupMembers,
      pendingGroupMembersIDs: ascentFriends.pendingGroupMembersIDs,
    });
    ascentFriends.id = res.body.data.id;
    await agentB
      .put("/session/ascent/invite/accept")
      .send({ ascentId: ascentFriends.id });
  });
  it("with no ascentId, should return 422", async () => {
    const response = await agentA.delete("/session/ascent/leave");
    expect(response.status).toBe(422);
  });
  it("with non-existing ascent, should return 404", async () => {
    const response = await agentA.delete("/session/ascent/leave").send({
      ascentId: fakeID,
    });
    expect(response.body.message).toBe("could not find ascent");
    expect(response.status).toBe(404);
  });
  it("when not a member of the ascent, should return 401", async () => {
    const response = await agentC.delete("/session/ascent/leave").send({
      ascentId: ascentFriends.id,
    });
    expect(response.body.message).toBe("user is not a member of this ascent");
    expect(response.status).toBe(401);
  });
  it("when a member of the ascent, should return 200 and user Id should be removed from groupMembersIDs", async () => {
    const response = await agentA.delete("/session/ascent/leave").send({
      ascentId: ascentFriends.id,
    });
    expect(response.body.message).toBe("you have left the ascent");
    expect(response.status).toBe(200);
  });
  it("when the last member of the ascent, should return 200, the ascent should be deleted and pending users and invited users at the point of deletion should no longer be", async () => {
    await agentB.delete("/session/ascent/leave").send({
      ascentId: ascentFriends.id,
    });
    const response = await agentA.delete("/session/ascent/leave").send({
      ascentId: ascentFriends.id,
    });
    expect(response.body.message).toBe(
      "you have left the ascent and the was ascent deleted",
    );
    expect(response.status).toBe(200);
  });
  it("leave ascent when last member but there are pending invited and requests, should delete ascent and notify pending users", async () => {
    // create ascent with user A, user B invited, user C requested
    let ascentTwoID: string;
    const responseCreate = await agentA.post("/session/ascent/create").send({
      date: ascentMinimal.date,
      hillID: ascentMinimal.hillID,
      pendingGroupMembersIDs: [ascentUserB.id], // invited
    });
    ascentTwoID = responseCreate.body.data.id;
    expect(responseCreate.status).toBe(200);
    expect(responseCreate.body.success).toBe(true);
    expect(responseCreate.body.data).toHaveProperty("id");
    expect(new Date(responseCreate.body.data.date)).toEqual(ascentMinimal.date);
    expect(responseCreate.body.data.hillID).toEqual(ascentMinimal.hillID);
    expect(responseCreate.body.data.groupMembersIDs).toEqual(
      expect.arrayContaining([ascentUserA.id]),
    );
    expect(responseCreate.body.data.pendingGroupMembersIDs).toEqual(
      expect.arrayContaining([ascentUserB.id]),
    );
    const responseJoin = await agentC.put("/session/ascent/join/request").send({
      ascentId: ascentTwoID,
    });
    expect(responseJoin.body.message).toBe(
      `Requested to join ascent group successfully`,
    );
    const responseDelete = await agentA.delete("/session/ascent/leave").send({
      ascentId: ascentTwoID,
    });
    expect(responseDelete.body.message).toBe(
      "you have left the ascent and the was ascent deleted",
    );
    expect(responseDelete.status).toBe(200);
    const userAData = await getProfile(ascentUserA.id);
    const userBData = await getProfile(ascentUserB.id);
    const userCData = await getProfile(ascentUserC.id);
    expect(userAData?.ascentIDs).not.toContain(ascentTwoID);
    expect(userBData?.pendingAscentIDs).not.toContain(ascentTwoID);
    expect(userCData?.requestedAscentIDs).not.toContain(ascentTwoID);
  });
});
