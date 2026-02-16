import request from "supertest";
import { app } from "../../src/app.js";
import { Ascent } from "@prisma/client";

let agentA = request.agent(app);
let agentB = request.agent(app);

const profileUserA = {
  id: "",
  name: "Profile Tester A",
  email: "testA@profile-email.com",
  password: "Password123!",
};
const profileUserB = {
  id: "",
  name: "Profile Tester B",
  email: "testB@profile-email.com",
  password: "Password123!",
};

const profileAscentA: Partial<Ascent> = {
  id: "",
  date: new Date("2025-01-01T10:00:00Z"),
  hillID: "6808acb64466bb2759b4cc84",
};

beforeEach(async () => {
  agentA = request.agent(app);
  agentB = request.agent(app);
  // create and log in users A and B
  await agentA.post("/register").send({
    name: profileUserA.name,
    email: profileUserA.email,
    password: profileUserA.password,
  });
  await agentB.post("/register").send({
    name: profileUserB.name,
    email: profileUserB.email,
    password: profileUserB.password,
  });
  const resA = await agentA.post("/login").send({
    email: profileUserA.email,
    password: profileUserA.password,
  });
  const resB = await agentB.post("/login").send({
    email: profileUserB.email,
    password: profileUserB.password,
  });
  profileUserA.id = resA.body.data.id;
  profileUserB.id = resB.body.data.id;
});

afterEach(async () => {
  await agentA.post("/login").send({
    email: profileUserA.email,
    password: profileUserA.password,
  });
  await agentB.post("/login").send({
    email: profileUserB.email,
    password: profileUserB.password,
  });
  await agentA.delete("/session/profile/deleteUser");
  await agentB.delete("/session/profile/deleteUser");
});

afterAll(async () => {
  agentA = request.agent(app);
  agentB = request.agent(app);
});

describe("Get user profile", () => {
  it("get uer profile, should return 200", async () => {
    const response = await agentA.get("/session/profile/");
    expect(response.status).toBe(200);
  });
});

describe("Delete user", () => {
  it("with no friends or ascents, should return 200", async () => {
    const deleteRes = await agentA.delete("/session/profile/deleteUser");
    expect(deleteRes.status).toBe(200);
  });
  it("with friend request sent, should return 200", async () => {
    // setup
    await agentA
      .put("/session/friend/request")
      .send({ friendId: profileUserB.id });
    // test
    const deleteRes = await agentA.delete("/session/profile/deleteUser");
    expect(deleteRes.status).toBe(200);
    // check results
    const resUserB = await agentB.get("/session/profile/");
    expect(resUserB.status).toBe(200);
    expect(resUserB.body.data.friendRequestsReceivedIDs).toEqual([]);
  });
  it("with friend request received, should return 200", async () => {
    // setup
    await agentB
      .put("/session/friend/request")
      .send({ friendId: profileUserA.id });
    // test
    const deleteRes = await agentA.delete("/session/profile/deleteUser");
    expect(deleteRes.status).toBe(200);
    // check results
    const resUserB = await agentB.get("/session/profile/");
    expect(resUserB.status).toBe(200);
    expect(resUserB.body.data.friendRequestsSentIDs).toEqual([]);
  });
  it("with friend, should return 200", async () => {
    // setup
    await agentB
      .put("/session/friend/request")
      .send({ friendId: profileUserA.id });
    await agentA
      .put("/session/friend/acceptRequest")
      .send({ friendId: profileUserB.id });
    // test
    const deleteRes = await agentA.delete("/session/profile/deleteUser");
    expect(deleteRes.status).toBe(200);
    // check results
    const resUserB = await agentB.get("/session/profile/");
    expect(resUserB.status).toBe(200);
    expect(resUserB.body.data.friendRequestsSentIDs).toEqual([]);
  });
  it("with ascent request, should return 200", async () => {
    //     // setup
    const resAscent = await agentB.post("/session/ascent/create").send({
      date: profileAscentA.date,
      hillID: profileAscentA.hillID,
    });
    profileAscentA.id = resAscent.body.data.id;
    await agentA.put("/session/ascent/join/request").send({
      ascentId: profileAscentA.id,
    });
    // test
    const deleteRes = await agentA.delete("/session/profile/deleteUser");
    expect(deleteRes.status).toBe(200);
    // check results
    const checkRes = await request(app).get("/getAscent/byId").send({
      ascentId: profileAscentA.id,
    });
    expect(checkRes.status).toBe(200);
    expect(checkRes.body.message).toEqual("Ascent successfully found");
    expect(checkRes.body.data.requestedGroupMembersIDs).toEqual([]);
  });
  it("with ascent pending", async () => {
    // setup
    const resAscent = await agentB.post("/session/ascent/create").send({
      date: profileAscentA.date,
      hillID: profileAscentA.hillID,
    });
    profileAscentA.id = resAscent.body.data.id;
    await agentB.put("/session/ascent/join/update").send({
      ascentId: profileAscentA.id,
      date: profileAscentA.date,
      hillID: profileAscentA.hillID,
      pendingGroupMembersIDs: [profileUserB.id],
    });
    // test
    const deleteRes = await agentA.delete("/session/profile/deleteUser");
    expect(deleteRes.status).toBe(200);
    // check results
    const checkRes = await request(app).get("/getAscent/byId").send({
      ascentId: profileAscentA.id,
    });
    expect(checkRes.status).toBe(200);
    expect(checkRes.body.message).toEqual("Ascent successfully found");
    expect(checkRes.body.data.pendingGroupMembersIDs).toEqual([]);
  });
  it("with ascent solo membership", async () => {
    // setup
    const resAscent = await agentA.post("/session/ascent/create").send({
      date: profileAscentA.date,
      hillID: profileAscentA.hillID,
    });
    profileAscentA.id = resAscent.body.data.id;
    // test
    const deleteRes = await agentA.delete("/session/profile/deleteUser");
    expect(deleteRes.status).toBe(200);
    // check results
    const checkRes = await request(app).get("/getAscent/byId").send({
      ascentId: profileAscentA.id,
    });
    expect(checkRes.status).toEqual(404);
    expect(checkRes.body.message).toEqual("ascent not found");
  });
  it("with multiple member ascent", async () => {
    // setup
    const resAscent = await agentA.post("/session/ascent/create").send({
      date: profileAscentA.date,
      hillID: profileAscentA.hillID,
      pendingGroupMembersIDs: [profileUserB.id],
    });
    profileAscentA.id = resAscent.body.data.id;
    await agentB.put("/session/ascent/invite/accept").send({
      ascentId: profileAscentA.id,
    });
    // test
    const deleteRes = await agentA.delete("/session/profile/deleteUser");
    expect(deleteRes.status).toBe(200);
    // check results
    const checkRes = await request(app).get("/getAscent/byId").send({
      ascentId: profileAscentA.id,
    });
    expect(checkRes.status).toBe(200);
    expect(checkRes.body.message).toEqual("Ascent successfully found");
    expect(checkRes.body.data.groupMembersIDs).toEqual([profileUserB.id]);
  });
  it("with ascent solo membership, then create user with same credentials, should return 200", async () => {
    // setup
    const resAscent = await agentA.post("/session/ascent/create").send({
      date: profileAscentA.date,
      hillID: profileAscentA.hillID,
    });
    profileAscentA.id = resAscent.body.data.id;
    // delete
    const deleteRes = await agentA.delete("/session/profile/deleteUser");
    expect(deleteRes.status).toBe(200);
    // create user again
    agentA = request.agent(app);
    const reReg = await agentA.post("/register").send({
      name: profileUserA.name,
      email: profileUserA.email,
      password: profileUserA.password,
    });
    profileAscentA.id = reReg.body.data.id;
    expect(reReg.status).toBe(201);
    expect(reReg.body.message).toBe(
      "Your account has been successfully created.",
    );
    // check
    const checkRes = await request(app).get("/getUser/ById").send({
      userId: profileAscentA.id,
    });
    expect(checkRes.status).toBe(200);
  });
});
