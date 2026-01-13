import request from "supertest";
import { app } from "../../src/app.js";
import type { Ascent } from "@prisma/client";
import { getProfile } from "../../src/DataBase/profileDb.js";
import { time } from "console";

const fakeID = "6808acb64466bb2759b4cc82";

const userA = {
  id: "",
  name: "Tester A",
  email: "testA@email.com",
  password: "Password123!",
  cookie: "",
};

const userB = {
  id: "",
  name: "Tester B",
  email: "testB@email.com",
  password: "Password123!",
  cookie: "",
};

const userC = {
  id: "",
  name: "Tester C",
  email: "testC@email.com",
  password: "Password123!",
  cookie: "",
};

const ascentMinimal: Partial<Ascent> = {
  id: "",
  date: new Date("2025-01-01T10:00:00Z"),
  hillID: "6808acb64466bb2759b4cc84",
};

// user B id added as pending group member in setup
const ascentFriends: Partial<Ascent> = {
  id: "",
  date: new Date("2023-01-01T10:00:00Z"),
  hillID: "6808acb64466bb2759b4cc82",
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
  hillID: "6808acb64466bb2759b4cc83",
  time: 30,
  weather: "raining",
  distance: 1.5,
  notes: "Great hike!",
  photos: ["photo1.jpg", "photo2.jpg"],
};

beforeAll(async () => {
  //register and login userA
  await request(app)
    .post("/register")
    .send({
      name: userA.name,
      email: userA.email,
      password: userA.password,
    })
    .then((response) => {
      userA.id = response.body.data.id;
    });
  await request(app)
    .post("/login")
    .send({
      email: userA.email,
      password: userA.password,
    })
    .then((response) => {
      userA.cookie = response.headers["set-cookie"];
    });
  //register and login userB
  await request(app)
    .post("/register")
    .send({
      name: userB.name,
      email: userB.email,
      password: userB.password,
    })
    .then((response) => {
      ascentFriends.pendingGroupMembersIDs = [response.body.data.id];
      userB.id = response.body.data.id;
    });
  await request(app)
    .post("/login")
    .send({
      email: userB.email,
      password: userB.password,
    })
    .then((response) => {
      userB.cookie = response.headers["set-cookie"];
    });
  //register and login userC
  await request(app)
    .post("/register")
    .send({
      name: userC.name,
      email: userC.email,
      password: userC.password,
    })
    .then((response) => {
      userC.id = response.body.data.id;
    });
  await request(app)
    .post("/login")
    .send({
      email: userC.email,
      password: userC.password,
    })
    .then((response) => {
      userC.cookie = response.headers["set-cookie"];
    });
});

afterAll(async () => {
  console.log("Deleting test users...");
  await request(app)
    .delete("/session/profile/deleteUser")
    .set("Cookie", [userA.cookie]);
  await request(app)
    .delete("/session/profile/deleteUser")
    .set("Cookie", [userB.cookie]);
  await request(app)
    .delete("/session/profile/deleteUser")
    .set("Cookie", [userC.cookie]);
});

describe("create new Ascent", () => {
  afterAll(async () => {
    await request(app)
      .delete("/session/ascent/leave")
      .set("Cookie", [userA.cookie])
      .send({ ascentId: ascentMinimal.id });
    await request(app)
      .delete("/session/ascent/leave")
      .set("Cookie", [userA.cookie])
      .send({ ascentId: ascentFriends.id });
    await request(app)
      .delete("/session/ascent/leave")
      .set("Cookie", [userA.cookie])
      .send({ ascentId: ascentThree.id });
  });
  it("with no access token, should return 401", async () => {
    const response = await request(app).post("/session/ascent/create").send({
      hillID: ascentMinimal.hillID,
    });
    expect(response.status).toBe(401);
  });
  it("with no date, should return 422", async () => {
    const response = await request(app)
      .post("/session/ascent/create")
      .set("Cookie", [userA.cookie])
      .send({
        hillID: ascentMinimal.hillID,
      });
    expect(response.status).toBe(422);
    expect(response.body.errors[0].msg).toEqual("Date is required");
  });
  it("with wrong date type, should return 422", async () => {
    const response = await request(app)
      .post("/session/ascent/create")
      .set("Cookie", [userA.cookie])
      .send({
        date: 14071994,
        hillID: ascentMinimal.hillID,
      });
    expect(response.status).toBe(422);
    expect(response.body.errors[0].msg).toEqual("date must be a valid date");
  });
  it("with wrong date type, should return 422", async () => {
    const response = await request(app)
      .post("/session/ascent/create")
      .set("Cookie", [userA.cookie])
      .send({
        date: "01-01-01T10:00:00Z",
        hillID: ascentMinimal.hillID,
      });
    expect(response.status).toBe(422);
    expect(response.body.errors[0].msg).toEqual("date must be a valid date");
  });
  it("with missing hillID, should return 422", async () => {
    const response = await request(app)
      .post("/session/ascent/create")
      .set("Cookie", [userA.cookie])
      .send({
        date: ascentMinimal.date,
      });
    expect(response.status).toBe(422);
    expect(response.body.errors[0].msg).toEqual("hillID is required");
  });
  it("with incorrect hillID format, should return 422", async () => {
    const response = await request(app)
      .post("/session/ascent/create")
      .set("Cookie", [userA.cookie])
      .send({
        hillID: "12345",
        date: ascentMinimal.date,
      });
    expect(response.status).toBe(422);
    expect(response.body.errors[0].msg).toEqual("hillID must be 24 bytes long");
  });
  describe("with correct data and hillId data,", () => {
    it("but incorrect time format (string), should return 422", async () => {
      const response = await request(app)
        .post("/session/ascent/create")
        .set("Cookie", [userA.cookie])
        .send({
          date: ascentMinimal.date,
          hillID: ascentMinimal.hillID,
          time: "one hour",
        });
      expect(response.status).toBe(422);
    });
    it("but incorrect weather format (int), should return 422", async () => {
      const response = await request(app)
        .post("/session/ascent/create")
        .set("Cookie", [userA.cookie])
        .send({
          date: ascentMinimal.date,
          hillID: ascentMinimal.hillID,
          weather: 1,
        });
      expect(response.status).toBe(422);
    });
    it("but incorrect distance format (string), should return 422", async () => {
      const response = await request(app)
        .post("/session/ascent/create")
        .set("Cookie", [userA.cookie])
        .send({
          date: ascentMinimal.date,
          hillID: ascentMinimal.hillID,
          distance: "far",
        });
      expect(response.status).toBe(422);
    });
    it("but incorrect notes format (int), should return 422", async () => {
      const response = await request(app)
        .post("/session/ascent/create")
        .set("Cookie", [userA.cookie])
        .send({
          date: ascentMinimal.date,
          hillID: ascentMinimal.hillID,
          notes: 1,
        });
      expect(response.status).toBe(422);
    });
    it("but incorrect nonUserGroupMember format (not Array), should return 422", async () => {
      const response = await request(app)
        .post("/session/ascent/create")
        .set("Cookie", [userA.cookie])
        .send({
          date: ascentMinimal.date,
          hillID: ascentMinimal.hillID,
          nonUserGroupMembers: "bob",
        });
      expect(response.status).toBe(422);
    });
    it("but incorrect nonUserGroupMember format (array of int), should return 422", async () => {
      const response = await request(app)
        .post("/session/ascent/create")
        .set("Cookie", [userA.cookie])
        .send({
          date: ascentMinimal.date,
          hillID: ascentMinimal.hillID,
          nonUserGroupMembers: [1, 2, 3],
        });
      expect(response.status).toBe(422);
    });
    it("but incorrect pendingGroupMembersIDs format (not Array), should return 422", async () => {
      const response = await request(app)
        .post("/session/ascent/create")
        .set("Cookie", [userA.cookie])
        .send({
          date: ascentMinimal.date,
          hillID: ascentMinimal.hillID,
          pendingGroupMembersIDs: "bob",
        });
      expect(response.status).toBe(422);
    });
    it("but incorrect pendingGroupMembersIDs format (not objectID), should return 422", async () => {
      const response = await request(app)
        .post("/session/ascent/create")
        .set("Cookie", [userA.cookie])
        .send({
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
    const response = await request(app)
      .post("/session/ascent/create")
      .set("Cookie", [userA.cookie])
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
      expect.arrayContaining([userA.id])
    );
  });
  it("with ascentFriends data with user B as pending invite, should return 200 and ascent data", async () => {
    const response = await request(app)
      .post("/session/ascent/create")
      .set("Cookie", [userA.cookie])
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
      ascentFriends.nonUserGroupMembers
    );
    expect(response.body.data.pendingGroupMembersIDs).toEqual(
      expect.arrayContaining([userB.id])
    );
    expect(response.body.data.groupMembersIDs).toEqual(
      expect.arrayContaining([userA.id])
    );
  });
  it("with the same date and hillId as ascentFriends, should return 403 and array containing ascentFriends data ", async () => {
    const response = await request(app)
      .post("/session/ascent/create")
      .set("Cookie", [userA.cookie])
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
      });
    expect(response.status).toBe(403);
    expect(response.body.success).toBe(false);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBeGreaterThan(0);
    expect(response.body.data[0]).toHaveProperty("id");
    expect(new Date(response.body.data[0].date)).toEqual(ascentFriends.date);
    expect(response.body.data[0].hillID).toEqual(ascentFriends.hillID);
  });
  it("with the same date and hillId as ascentFriends again, should return 403 and array containing ascentFriends data ", async () => {
    const response = await request(app)
      .post("/session/ascent/create")
      .set("Cookie", [userA.cookie])
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
    const response = await request(app)
      .post("/session/ascent/create")
      .set("Cookie", [userA.cookie])
      .send({
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
  // user C will request to join ascentFriend ascent
  // user B will request to join ascentFriend ascent, user is already a pending member
  // user A will request to join ascentFriend ascent, user is already a member
  let ascentId: string;
  beforeAll(async () => {
    const res = await request(app)
      .post("/session/ascent/create")
      .set("Cookie", [userA.cookie])
      .send({
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
    await request(app)
      .put("/session/ascent/join/request")
      .set("Cookie", [userB.cookie])
      .send({ ascentId: ascentId });
  });
  afterAll(async () => {
    await request(app)
      .delete("/session/ascent/leave")
      .set("Cookie", [userA.cookie])
      .send({ ascentId: ascentId });
  });

  it("with incorrect ascent ID format (not ObjectId), should return 422", async () => {
    const response = await request(app)
      .put("/session/ascent/join/request")
      .set("Cookie", [userC.cookie])
      .send({
        ascentId: "12345",
      });
    expect(response.status).toBe(422);
  });
  it("with non-existing ascent, should return 404", async () => {
    const response = await request(app)
      .put("/session/ascent/join/request")
      .set("Cookie", [userC.cookie])
      .send({
        ascentId: fakeID,
      });
    expect(response.status).toBe(404);
  });
  describe("with correct data", () => {
    it("which the user is already a member of, should return 400", async () => {
      const response = await request(app)
        .put("/session/ascent/join/request")
        .set("Cookie", [userA.cookie])
        .send({
          ascentId: ascentId,
        });
      expect(response.status).toBe(400);
    });
    it("which the user is already a pending member of, should return 400", async () => {
      const response = await request(app)
        .put("/session/ascent/join/request")
        .set("Cookie", [userB.cookie])
        .send({
          ascentId: ascentId,
        });
      expect(response.status).toBe(400);
    });
    it("should return 200", async () => {
      const response = await request(app)
        .put("/session/ascent/join/request")
        .set("Cookie", [userC.cookie])
        .send({
          ascentId: ascentId,
        });
      expect(response.status).toBe(200);
      expect(response.body.message).toBe(
        `Requested to join ascent group successfully`
      );
    });
    it("which the user has already requested, should return 200", async () => {
      const response = await request(app)
        .put("/session/ascent/join/request")
        .set("Cookie", [userC.cookie])
        .send({
          ascentId: ascentId,
        });
      expect(response.status).toBe(200);
      expect(response.body.message).toBe(
        `Requested to join ascent group successfully`
      );
    });
  });
});

describe("accept request to join ascent", () => {
  // user A is a member of the ascent, user C has requested to join
  let ascentId: string;
  beforeAll(async () => {
    const res = await request(app)
      .post("/session/ascent/create")
      .set("Cookie", [userA.cookie])
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
      });
    ascentId = res.body.data.id;
    await request(app)
      .put("/session/ascent/join/request")
      .set("Cookie", [userC.cookie])
      .send({
        ascentId: ascentId,
      });
  });
  afterAll(async () => {
    await request(app)
      .delete("/session/ascent/leave")
      .set("Cookie", [userA.cookie])
      .send({ ascentId: ascentId });
    await request(app)
      .delete("/session/ascent/leave")
      .set("Cookie", [userC.cookie])
      .send({ ascentId: ascentId });
  });
  it("with incorrect ascent ID format (not ObjectId), should return 422", async () => {
    const response = await request(app)
      .put("/session/ascent/join/accept")
      .set("Cookie", [userA.cookie])
      .send({
        ascentId: "12345",
        requestedUserId: fakeID,
      });
    expect(response.status).toBe(422);
  });
  it("with no requestedUserId, should return 422", async () => {
    const response = await request(app)
      .put("/session/ascent/join/accept")
      .set("Cookie", [userA.cookie])
      .send({
        ascentId: fakeID,
      });
    expect(response.status).toBe(422);
  });
  it("with non-existing ascent, should return 404", async () => {
    const response = await request(app)
      .put("/session/ascent/join/accept")
      .set("Cookie", [userA.cookie])
      .send({
        ascentId: fakeID,
        requestedUserId: userC.id,
      });
    expect(response.status).toBe(404);
    expect(response.body.message).toEqual("The ascent cannot be found");
  });
  it("with incorrect requestedUserId to accept, should return 404", async () => {
    const response = await request(app)
      .put("/session/ascent/join/accept")
      .set("Cookie", [userA.cookie])
      .send({
        ascentId: ascentId,
        requestedUserId: fakeID,
      });
    expect(response.status).toBe(404);
    expect(response.body.message).toEqual(
      "user has not requested to join this ascent"
    );
  });
  it("when user to accept has not requested to join ascent, expect 404", async () => {
    const response = await request(app)
      .put("/session/ascent/join/accept")
      .set("Cookie", [userA.cookie])
      .send({
        ascentId: ascentId,
        requestedUserId: userB.id,
      });
    expect(response.status).toBe(404);
    expect(response.body.message).toEqual(
      "user has not requested to join this ascent"
    );
  });
  it("when the user is not a member (has no authority to edit) of the ascent, expect 401", async () => {
    const response = await request(app)
      .put("/session/ascent/join/accept")
      .set("Cookie", [userB.cookie])
      .send({
        ascentId: ascentId,
        requestedUserId: userC.id,
      });
    expect(response.status).toBe(401);
    expect(response.body.message).toEqual(
      "user is not authorized edit requests for this ascent"
    );
  });
  it("as a member of the ascent, expect 200 and the invitee id to be removed from requestedGroupMembersIDs", async () => {
    const response = await request(app)
      .put("/session/ascent/join/accept")
      .set("Cookie", [userA.cookie])
      .send({
        ascentId: ascentId,
        requestedUserId: userC.id,
      });
    expect(response.status).toBe(200);
    expect(response.body.message).toEqual("user has been added to the ascent");
  });
  it("when user to accept is already a member of the ascent, expect 400", async () => {
    const response = await request(app)
      .put("/session/ascent/join/accept")
      .set("Cookie", [userA.cookie])
      .send({
        ascentId: ascentId,
        requestedUserId: userC.id,
      });
    expect(response.status).toBe(404);
    expect(response.body.message).toEqual(
      "user has not requested to join this ascent"
    );
  });
});

describe("reject request to join ascent", () => {
  // user A is a member of the ascent, user C has requested to join
  let ascentId: string;
  beforeAll(async () => {
    const res = await request(app)
      .post("/session/ascent/create")
      .set("Cookie", [userA.cookie])
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
      });
    ascentId = res.body.data.id;
    await request(app)
      .put("/session/ascent/join/request")
      .set("Cookie", [userC.cookie])
      .send({
        ascentId: ascentId,
      });
  });
  afterAll(async () => {
    await request(app)
      .delete("/session/ascent/leave")
      .set("Cookie", [userA.cookie])
      .send({ ascentId: ascentId });
  });
  it("should return 200 and user Id should be removed from requestedGroupMembersIDs", async () => {
    const response = await request(app)
      .put("/session/ascent/join/reject")
      .set("Cookie", [userA.cookie])
      .send({
        ascentId: ascentId,
        requestedUserId: userC.id,
      });
    expect(response.status).toBe(200);
    expect(response.body.message).toBe(
      "user's request to join has been rejected"
    );
  });
});

describe("remove Request to join ascent", () => {
  // user A has created an ascent, user B has requested to join
  let ascentOneId: string;
  beforeAll(async () => {
    const resOne = await request(app)
      .post("/session/ascent/create")
      .set("Cookie", [userA.cookie])
      .send({
        date: ascentFriends.date,
        hillID: ascentFriends.hillID,
      });
    ascentOneId = resOne.body.data.id;
    await request(app)
      .put("/session/ascent/join/request")
      .set("Cookie", [userB.cookie])
      .send({
        ascentId: ascentOneId,
      });
  });
  afterAll(async () => {
    await request(app)
      .delete("/session/ascent/leave")
      .set("Cookie", [userA.cookie])
      .send({ ascentId: ascentOneId });
  });
  it("with no ascentId, should return 422", async () => {
    const response = await request(app)
      .delete("/session/ascent/join/remove")
      .set("Cookie", [userB.cookie]);
    expect(response.status).toBe(422);
  });
  it("with incorrect ascent ID format (not ObjectId), should return 422", async () => {
    const response = await request(app)
      .delete("/session/ascent/join/remove")
      .set("Cookie", [userB.cookie])
      .send({
        ascentId: "12ABC345",
      });
    expect(response.status).toBe(422);
  });
  it("with non-existing ascentId, should return 404", async () => {
    const response = await request(app)
      .delete("/session/ascent/join/remove")
      .set("Cookie", [userB.cookie])
      .send({
        ascentId: fakeID,
      });
    expect(response.status).toBe(404);
    expect(response.body.message).toBe("This ascent cannot be found");
  });
  it("with an existing ascentId but they have not requested to join, should return 404", async () => {
    const response = await request(app)
      .delete("/session/ascent/join/remove")
      .set("Cookie", [userC.cookie])
      .send({
        ascentId: ascentOneId,
      });
    expect(response.status).toBe(404);
    expect(response.body.message).toBe(
      "user has not requested to join this ascent"
    );
  });
  it("with an existing ascentId and they have requested to join, should return 200 and user Id should be removed from requestedGroupMembersIDs", async () => {
    const response = await request(app)
      .delete("/session/ascent/join/remove")
      .set("Cookie", [userB.cookie])
      .send({
        ascentId: ascentOneId,
      });
    expect(response.status).toBe(200);
    expect(response.body.message).toBe(
      "your request to join the ascent has been removed"
    );
  });
});

describe("accept invite to join ascent", () => {
  // user A has created an ascent, user B is invited join
  let ascentId: string;
  beforeAll(async () => {
    const res = await request(app)
      .post("/session/ascent/create")
      .set("Cookie", [userA.cookie])
      .send({
        date: ascentFriends.date,
        hillID: ascentFriends.hillID,
        pendingGroupMembersIDs: ascentFriends.pendingGroupMembersIDs,
      });
    ascentId = res.body.data.id;
  });
  afterAll(async () => {
    await request(app)
      .delete("/session/ascent/leave")
      .set("Cookie", [userA.cookie])
      .send({ ascentId: ascentId });
    await request(app)
      .delete("/session/ascent/leave")
      .set("Cookie", [userB.cookie])
      .send({ ascentId: ascentId });
  });
  it("with no ascentId, should return 422", async () => {
    const response = await request(app)
      .put("/session/ascent/invite/accept")
      .set("Cookie", [userB.cookie]);
    expect(response.status).toBe(422);
  });
  it("with incorrect ascentId format (not ObjectId), should return 422", async () => {
    const response = await request(app)
      .put("/session/ascent/invite/accept")
      .set("Cookie", [userB.cookie])
      .send({
        ascentId: "123AbC456",
      });
    expect(response.status).toBe(422);
  });
  it("with non existing ascentId, should return 404", async () => {
    const response = await request(app)
      .put("/session/ascent/invite/accept")
      .set("Cookie", [userB.cookie])
      .send({
        ascentId: fakeID,
      });
    expect(response.status).toBe(404);
    expect(response.body.message).toBe("ascent cannot be found");
  });
  it("when not invited to join, should return 401", async () => {
    const response = await request(app)
      .put("/session/ascent/invite/accept")
      .set("Cookie", [userC.cookie])
      .send({
        ascentId: ascentId,
      });
    expect(response.status).toBe(401);
    expect(response.body.message).toBe(
      "user is not authorized to respond to this invitation"
    );
  });
  it("when a member of the ascent, should return 401", async () => {
    const response = await request(app)
      .put("/session/ascent/invite/accept")
      .set("Cookie", [userA.cookie])
      .send({
        ascentId: ascentId,
      });
    expect(response.status).toBe(401);
    expect(response.body.message).toBe(
      "user is not authorized to respond to this invitation"
    );
  });
  it("when invited to join, should return 200 and user Id should be removed from pendingGroupMembersIDs", async () => {
    const response = await request(app)
      .put("/session/ascent/invite/accept")
      .set("Cookie", [userB.cookie])
      .send({
        ascentId: ascentId,
      });
    expect(response.status).toBe(200);
    expect(response.body.message).toBe("you have been added to the ascent");
    expect(response.body.data.groupMembersIDs).toEqual(
      expect.arrayContaining([userB.id])
    );
    expect(response.body.data.pendingGroupMembersIDs).not.toEqual(
      expect.arrayContaining([userB.id])
    );
  });
});

describe("reject invite to join ascent", () => {
  let ascentId: string;
  beforeAll(async () => {
    const res = await request(app)
      .post("/session/ascent/create")
      .set("Cookie", [userA.cookie])
      .send({
        date: ascentFriends.date,
        hillID: ascentFriends.hillID,
        pendingGroupMembersIDs: ascentFriends.pendingGroupMembersIDs,
      });
    ascentId = res.body.data.id;
  });
  afterAll(async () => {
    await request(app)
      .delete("/session/ascent/leave")
      .set("Cookie", [userA.cookie])
      .send({ ascentId: ascentId });
  });
  it("when invited to join, should return 200 and user Id should be removed from pendingGroupMembersIDs", async () => {
    const response = await request(app)
      .put("/session/ascent/invite/reject")
      .set("Cookie", [userB.cookie])
      .send({
        ascentId: ascentId,
      });
    expect(response.status).toBe(200);
    expect(response.body.message).toBe(
      "you have declined the invitation to the ascent"
    );
    expect(response.body.data.groupMembersIDs).not.toEqual(
      expect.arrayContaining([userB.id])
    );
    expect(response.body.data.pendingGroupMembersIDs).not.toEqual(
      expect.arrayContaining([userB.id])
    );
  });
});

describe("remove invite to join ascent", () => {
  // user A has created an ascent, user B is invited join
  let ascentId: string;
  beforeAll(async () => {
    const res = await request(app)
      .post("/session/ascent/create")
      .set("Cookie", [userA.cookie])
      .send({
        date: ascentFriends.date,
        hillID: ascentFriends.hillID,
        pendingGroupMembersIDs: [userB.id],
      });
    ascentId = res.body.data.id;
  });
  afterAll(async () => {
    await request(app)
      .delete("/session/ascent/leave")
      .set("Cookie", [userA.cookie])
      .send({ ascentId: ascentId });
  });
  it("with no ascentId, should return 422", async () => {
    const response = await request(app)
      .delete("/session/ascent/invite/remove")
      .set("Cookie", [userA.cookie])
      .send({
        removeUserId: fakeID,
      });
    expect(response.status).toBe(422);
  });
  it("with no removeUserId, should return 422", async () => {
    const response = await request(app)
      .delete("/session/ascent/invite/remove")
      .set("Cookie", [userA.cookie])
      .send({
        ascentId: fakeID,
      });
    expect(response.status).toBe(422);
  });
  it("with incorrect ascentId format (not ObjectId), should return 422", async () => {
    const response = await request(app)
      .delete("/session/ascent/invite/remove")
      .set("Cookie", [userA.cookie])
      .send({
        ascentId: "123ABC456",
        removeUserId: fakeID,
      });
    expect(response.status).toBe(422);
  });
  it("with removeUserId format (not ObjectId), should return 422", async () => {
    const response = await request(app)
      .delete("/session/ascent/invite/remove")
      .set("Cookie", [userA.cookie])
      .send({
        ascentId: fakeID,
        removeUserId: "123ABC456",
      });
    expect(response.status).toBe(422);
  });
  it("with non existing ascentId, should return 404", async () => {
    const response = await request(app)
      .delete("/session/ascent/invite/remove")
      .set("Cookie", [userA.cookie])
      .send({
        ascentId: fakeID,
        removeUserId: userB.id,
      });
    expect(response.status).toBe(404);
    expect(response.body.message).toBe("ascent cannot be found");
  });
  it("when not invited to join, should return 404", async () => {
    const response = await request(app)
      .delete("/session/ascent/invite/remove")
      .set("Cookie", [userA.cookie])
      .send({
        ascentId: ascentId,
        removeUserId: userC.id,
      });
    expect(response.status).toBe(404);
    expect(response.body.message).toBe(
      "the invited user cannot be found on this ascent"
    );
  });
  it("when not a member of the ascent, should return 401", async () => {
    const response = await request(app)
      .delete("/session/ascent/invite/remove")
      .set("Cookie", [userB.cookie])
      .send({
        ascentId: ascentId,
        removeUserId: userB.id,
      });
    expect(response.status).toBe(401);
    expect(response.body.message).toBe(
      "user is not authorized edit this ascent"
    );
  });
  it("when invited to join, should return 200 and user Id should be removed from pendingGroupMembersIDs", async () => {
    const response = await request(app)
      .delete("/session/ascent/invite/remove")
      .set("Cookie", [userA.cookie])
      .send({
        ascentId: ascentId,
        removeUserId: userB.id,
      });
    expect(response.status).toBe(200);
    expect(response.body.message).toBe(
      "the invited user has been removed from the ascent"
    );
    expect(response.body.data.pendingGroupMembersIDs).not.toEqual(
      expect.arrayContaining([userB.id])
    );
    expect(response.body.data.groupMembersIDs).not.toEqual(
      expect.arrayContaining([userB.id])
    );
  });
});

describe("update ascent", () => {
  let ascentIdEmpty: string;
  let ascentIdFull: string;
  beforeEach(async () => {
    const resEmpty = await request(app)
      .post("/session/ascent/create")
      .set("Cookie", [userA.cookie])
      .send({
        rejectSimilar: true,
        date: ascentFriends.date,
        hillID: ascentFriends.hillID,
      });
    const resFull = await request(app)
      .post("/session/ascent/create")
      .set("Cookie", [userA.cookie])
      .send({
        rejectSimilar: true,
        date: ascentFriends.date,
        hillID: ascentFriends.hillID,
        time: ascentFriends.time,
        weather: ascentFriends.weather,
        distance: ascentFriends.distance,
        notes: ascentFriends.notes,
        photos: ascentFriends.photos,
        nonUserGroupMembers: ascentFriends.nonUserGroupMembers,
        pendingGroupMembersIDs: [userB.id],
      });
    ascentIdEmpty = resEmpty.body.data.id;
    ascentIdFull = resFull.body.data.id;
  });
  afterEach(async () => {
    await request(app)
      .delete("/session/ascent/leave")
      .set("Cookie", [userA.cookie])
      .send({ ascentId: ascentIdEmpty });
    await request(app)
      .delete("/session/ascent/leave")
      .set("Cookie", [userA.cookie])
      .send({ ascentId: ascentIdFull });
  });
  it("with no ascentId, should return 422", async () => {
    const response = await request(app)
      .put("/session/ascent/update")
      .set("Cookie", [userA.cookie])
      .send({
        date: ascentFriends.date,
        hillID: ascentFriends.hillID,
      });
    expect(response.status).toBe(422);
  });
  it("with no Date, should return 422", async () => {
    const response = await request(app)
      .put("/session/ascent/update")
      .set("Cookie", [userA.cookie])
      .send({
        ascentId: ascentIdEmpty,
        hillID: ascentFriends.hillID,
      });
    expect(response.status).toBe(422);
  });
  it("with no hillID, should return 422", async () => {
    const response = await request(app)
      .put("/session/ascent/update")
      .set("Cookie", [userA.cookie])
      .send({
        ascentId: ascentIdEmpty,
        date: ascentFriends.date,
      });
    expect(response.status).toBe(422);
  });
  it("with non-existing ascentId, should return 404", async () => {
    const response = await request(app)
      .put("/session/ascent/update")
      .set("Cookie", [userA.cookie])
      .send({
        ascentId: fakeID,
        date: ascentFriends.date,
        hillID: ascentFriends.hillID,
      });
    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Ascent not found");
  });
  it("when not a member of the ascent, should return 401", async () => {
    const response = await request(app)
      .put("/session/ascent/update")
      .set("Cookie", [userB.cookie])
      .send({
        ascentId: ascentIdEmpty,
        date: ascentFriends.date,
        hillID: ascentFriends.hillID,
      });
    expect(response.status).toBe(401);
    expect(response.body.message).toBe(
      "user is not authorized to edit this ascent"
    );
  });
  it("with correct information except time format", async () => {
    const response = await request(app)
      .put("/session/ascent/update")
      .set("Cookie", [userA.cookie])
      .send({
        ascentId: ascentIdEmpty,
        date: ascentFriends.date,
        hillID: ascentFriends.hillID,
        time: "12:00 PM",
        weather: ascentFriends.weather,
        distance: ascentFriends.distance,
        notes: ascentFriends.notes,
        photos: ascentFriends.photos,
        nonUserGroupMembers: ascentFriends.nonUserGroupMembers,
        pendingGroupMembersIDs: [userB.id],
      });
    expect(response.status).toBe(422);
  });
  it("with correct information except time format", async () => {
    const response = await request(app)
      .put("/session/ascent/update")
      .set("Cookie", [userA.cookie])
      .send({
        ascentId: ascentIdEmpty,
        date: ascentFriends.date,
        hillID: ascentFriends.hillID,
        time: "2023-01-01T10:00:00Z",
        weather: ascentFriends.weather,
        distance: ascentFriends.distance,
        notes: ascentFriends.notes,
        photos: ascentFriends.photos,
        nonUserGroupMembers: ascentFriends.nonUserGroupMembers,
        pendingGroupMembersIDs: [userB.id],
      });
    expect(response.status).toBe(422);
  });
  it("with correct information except weather format", async () => {
    const response = await request(app)
      .put("/session/ascent/update")
      .set("Cookie", [userA.cookie])
      .send({
        ascentId: ascentIdEmpty,
        date: ascentFriends.date,
        hillID: ascentFriends.hillID,
        time: ascentFriends.time,
        weather: 9,
        distance: ascentFriends.distance,
        notes: ascentFriends.notes,
        photos: ascentFriends.photos,
        nonUserGroupMembers: ascentFriends.nonUserGroupMembers,
        pendingGroupMembersIDs: [userB.id],
      });
    expect(response.status).toBe(422);
  });
  it("with correct information except weather format", async () => {
    const response = await request(app)
      .put("/session/ascent/update")
      .set("Cookie", [userA.cookie])
      .send({
        ascentId: ascentIdEmpty,
        date: ascentFriends.date,
        hillID: ascentFriends.hillID,
        time: ascentFriends.time,
        weather: "9",
        distance: ascentFriends.distance,
        notes: ascentFriends.notes,
        photos: ascentFriends.photos,
        nonUserGroupMembers: ascentFriends.nonUserGroupMembers,
        pendingGroupMembersIDs: [userB.id],
      });
    expect(response.status).toBe(422);
  });
  it("with correct information except distance format", async () => {
    const response = await request(app)
      .put("/session/ascent/update")
      .set("Cookie", [userA.cookie])
      .send({
        ascentId: ascentIdEmpty,
        date: ascentFriends.date,
        hillID: ascentFriends.hillID,
        time: ascentFriends.time,
        weather: ascentFriends.weather,
        distance: "10 km",
        notes: ascentFriends.notes,
        photos: ascentFriends.photos,
        nonUserGroupMembers: ascentFriends.nonUserGroupMembers,
        pendingGroupMembersIDs: [userB.id],
      });
    expect(response.status).toBe(422);
  });
  it("with correct information except notes format", async () => {
    const response = await request(app)
      .put("/session/ascent/update")
      .set("Cookie", [userA.cookie])
      .send({
        ascentId: ascentIdEmpty,
        date: ascentFriends.date,
        hillID: ascentFriends.hillID,
        time: ascentFriends.time,
        weather: ascentFriends.weather,
        distance: ascentFriends.distance,
        notes: 123,
        photos: ascentFriends.photos,
        nonUserGroupMembers: ascentFriends.nonUserGroupMembers,
        pendingGroupMembersIDs: [userB.id],
      });
    expect(response.status).toBe(422);
  });
  it("with correct information except notes format", async () => {
    const response = await request(app)
      .put("/session/ascent/update")
      .set("Cookie", [userA.cookie])
      .send({
        ascentId: ascentIdEmpty,
        date: ascentFriends.date,
        hillID: ascentFriends.hillID,
        time: ascentFriends.time,
        weather: ascentFriends.weather,
        distance: ascentFriends.distance,
        notes: [1, 2, 3],
        photos: ascentFriends.photos,
        nonUserGroupMembers: ascentFriends.nonUserGroupMembers,
        pendingGroupMembersIDs: [userB.id],
      });
    expect(response.status).toBe(422);
  });
  it("with correct information except photos format", async () => {
    const response = await request(app)
      .put("/session/ascent/update")
      .set("Cookie", [userA.cookie])
      .send({
        ascentId: ascentIdEmpty,
        date: ascentFriends.date,
        hillID: ascentFriends.hillID,
        time: ascentFriends.time,
        weather: ascentFriends.weather,
        distance: ascentFriends.distance,
        notes: ascentFriends.notes,
        photos: "photo1.jpg",
        nonUserGroupMembers: ascentFriends.nonUserGroupMembers,
        pendingGroupMembersIDs: [userB.id],
      });
    expect(response.status).toBe(422);
  });
  it("with correct information except nonUserGroupMembers format", async () => {
    const response = await request(app)
      .put("/session/ascent/update")
      .set("Cookie", [userA.cookie])
      .send({
        ascentId: ascentIdEmpty,
        date: ascentFriends.date,
        hillID: ascentFriends.hillID,
        time: ascentFriends.time,
        weather: ascentFriends.weather,
        distance: ascentFriends.distance,
        notes: ascentFriends.notes,
        photos: ascentFriends.photos,
        nonUserGroupMembers: "ben",
        pendingGroupMembersIDs: [userB.id],
      });
    expect(response.status).toBe(422);
  });
  it("with correct information except nonUserGroupMembers format", async () => {
    const response = await request(app)
      .put("/session/ascent/update")
      .set("Cookie", [userA.cookie])
      .send({
        ascentId: ascentIdEmpty,
        date: ascentFriends.date,
        hillID: ascentFriends.hillID,
        time: ascentFriends.time,
        weather: ascentFriends.weather,
        distance: ascentFriends.distance,
        notes: ascentFriends.notes,
        photos: ascentFriends.photos,
        nonUserGroupMembers: [10, "tom"],
        pendingGroupMembersIDs: [userB.id],
      });
    expect(response.status).toBe(422);
  });
  it("with correct information, and all other fields empty, full ascent data should be updated to empty", async () => {
    const response = await request(app)
      .put("/session/ascent/update")
      .set("Cookie", [userA.cookie])
      .send({
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
      ascentFriends.pendingGroupMembersIDs
    );
  });
  it("with correct information, and all other fields full, empty ascent data should be updated to full", async () => {
    const response = await request(app)
      .put("/session/ascent/update")
      .set("Cookie", [userA.cookie])
      .send({
        ascentId: ascentIdEmpty,
        date: ascentFriends.date,
        hillID: ascentFriends.hillID,
        time: ascentFriends.time,
        weather: ascentFriends.weather,
        distance: ascentFriends.distance,
        notes: ascentFriends.notes,
        photos: ascentFriends.photos,
        nonUserGroupMembers: ascentFriends.nonUserGroupMembers,
        pendingGroupMembersIDs: [userB.id],
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
      ascentFriends.nonUserGroupMembers
    );
    expect(response.body.data.pendingGroupMembersIDs).toEqual(
      ascentFriends.pendingGroupMembersIDs
    );
  });
});

describe("leave ascent", () => {
  beforeAll(async () => {
    const res = await request(app)
      .post("/session/ascent/create")
      .set("Cookie", [userA.cookie])
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
      });
    ascentFriends.id = res.body.data.id;

    await request(app)
      .put("/session/ascent/invite/accept")
      .set("Cookie", [userB.cookie])
      .send({ ascentId: ascentFriends.id });
  });
  it("with no ascentId, should return 422", async () => {
    const response = await request(app)
      .delete("/session/ascent/leave")
      .set("Cookie", [userA.cookie]);
    expect(response.status).toBe(422);
  });
  it("with non-existing ascent, should return 404", async () => {
    const response = await request(app)
      .delete("/session/ascent/leave")
      .set("Cookie", [userA.cookie])
      .send({
        ascentId: fakeID,
      });
    expect(response.body.message).toBe("could not find ascent");
    expect(response.status).toBe(404);
  });
  it("when not a member of the ascent, should return 401", async () => {
    const response = await request(app)
      .delete("/session/ascent/leave")
      .set("Cookie", [userC.cookie])
      .send({
        ascentId: ascentFriends.id,
      });
    expect(response.body.message).toBe("user is not a member of this ascent");
    expect(response.status).toBe(401);
  });
  it("when a member of the ascent, should return 200 and user Id should be removed from groupMembersIDs", async () => {
    const response = await request(app)
      .delete("/session/ascent/leave")
      .set("Cookie", [userA.cookie])
      .send({
        ascentId: ascentFriends.id,
      });
    expect(response.body.message).toBe("you have left the ascent");
    expect(response.status).toBe(200);
  });
  it("when the last member of the ascent, should return 200, the ascent should be deleted and pending users and invited users at the point of deletion should no longer be", async () => {
    const response = await request(app)
      .delete("/session/ascent/leave")
      .set("Cookie", [userB.cookie])
      .send({
        ascentId: ascentFriends.id,
      });
    expect(response.body.message).toBe(
      "you have left the ascent and the was ascent deleted"
    );
    expect(response.status).toBe(200);
  });
  it("leave ascent when last member but there are pending invited and requests, should delete ascent and notify pending users", async () => {
    // create ascent with user A, user B invited, user C requested
    let ascentTwoID: string;
    const responseCreate = await request(app)
      .post("/session/ascent/create")
      .set("Cookie", [userA.cookie])
      .send({
        date: ascentMinimal.date,
        hillID: ascentMinimal.hillID,
        pendingGroupMembersIDs: [userB.id], // invited
      });
    ascentTwoID = responseCreate.body.data.id;
    expect(responseCreate.status).toBe(200);
    expect(responseCreate.body.success).toBe(true);
    expect(responseCreate.body.data).toHaveProperty("id");
    expect(new Date(responseCreate.body.data.date)).toEqual(ascentMinimal.date);
    expect(responseCreate.body.data.hillID).toEqual(ascentMinimal.hillID);
    expect(responseCreate.body.data.groupMembersIDs).toEqual(
      expect.arrayContaining([userA.id])
    );
    expect(responseCreate.body.data.pendingGroupMembersIDs).toEqual(
      expect.arrayContaining([userB.id])
    );
    const responseJoin = await request(app)
      .put("/session/ascent/join/request")
      .set("Cookie", [userC.cookie])
      .send({
        ascentId: ascentTwoID,
      });
    expect(responseJoin.body.message).toBe(
      `Requested to join ascent group successfully`
    );
    const responseDelete = await request(app)
      .delete("/session/ascent/leave")
      .set("Cookie", [userA.cookie])
      .send({
        ascentId: ascentTwoID,
      });
    expect(responseDelete.body.message).toBe(
      "you have left the ascent and the was ascent deleted"
    );
    expect(responseDelete.status).toBe(200);
    const userAData = await getProfile(userA.id);
    const userBData = await getProfile(userB.id);
    const userCData = await getProfile(userC.id);
    expect(userAData?.ascentIDs).not.toContain(ascentTwoID);
    expect(userBData?.pendingAscentIDs).not.toContain(ascentTwoID);
    expect(userCData?.requestedAscentIDs).not.toContain(ascentTwoID);
  });
});
