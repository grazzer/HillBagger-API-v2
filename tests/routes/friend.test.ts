import request from "supertest";
import { app } from "../../src/app.js";

//TODO: separate out friends tests into their own file

//Integration tests for the profile endpoint

let agentA = request.agent(app);
let agentB = request.agent(app);

const fakeID = "6808acb64466bb2759b4cc82";

const userA = {
  id: "",
  name: "Friend Tester A",
  email: "testA@friend-email.com",
  password: "Password123!",
};

const userB = {
  id: "",
  name: "Friend Tester B",
  email: "testB@friend-email.com",
  password: "Password123!",
};

beforeEach(async () => {
  await request(app).post("/register").send({
    name: userA.name,
    email: userA.email,
    password: userA.password,
  });
  await request(app).post("/register").send({
    name: userB.name,
    email: userB.email,
    password: userB.password,
  });
  await agentA
    .post("/login")
    .send({
      email: userA.email,
      password: userA.password,
    })
    .then((response) => {
      userA.id = response.body.data.id;
    });
  await agentB
    .post("/login")
    .send({
      email: userB.email,
      password: userB.password,
    })
    .then((response) => {
      userB.id = response.body.data.id;
    });
});

afterEach(async () => {
  await agentA.post("/login").send({
    email: "testA@email.com",
    password: "Password123!",
  });
  await agentB.post("/login").send({
    email: "testB@email.com",
    password: "Password123!",
  });
  await agentA.delete("/session/profile/deleteUser");
  await agentB.delete("/session/profile/deleteUser");
});

function authAndValidationTests(url: string, IdName: string) {
  const incorrectFormat = { [IdName]: "123abc" };
  const nonexistentUser = { [IdName]: fakeID };
  it("with no cookie, should return 401", async () => {
    const response: any = await request(app).put(url);
    expect(response.status).toBe(401);
  });
  it("with no ID, should return 422", async () => {
    const response = await agentA.put(url);
    expect(response.status).toBe(422);
  });
  it("with incorrect ID format (not ObjectId), should return 422", async () => {
    const response = await agentA.put(url).send(incorrectFormat);
    expect(response.status).toBe(422);
  });
}

function authAndValidationTestsDelete(url: string, IdName: string) {
  const incorrectFormat = { [IdName]: "123abc" };
  const nonexistentUser = { [IdName]: fakeID };
  it("with no cookie, should return 401", async () => {
    const response: any = await request(app).delete(url);
    expect(response.status).toBe(401);
  });
  it("with no ID, should return 422", async () => {
    const response = await agentA.delete(url);
    expect(response.status).toBe(422);
  });
  it("with incorrect ID format (not ObjectId), should return 422", async () => {
    const response = await agentA.delete(url).send(incorrectFormat);
    expect(response.status).toBe(422);
  });
}

describe("friend request", () => {
  authAndValidationTests("/session/friend/request", "friendId");

  it("with id of non existing user, should return 404", async () => {
    const response = await agentA
      .put("/session/friend/request")
      .send({ friendId: fakeID });
    expect(response.status).toBe(404);
    expect(response.body.message).toBe("friend not found");
  });
  it("to self, should return 400", async () => {
    const response = await agentA
      .put("/session/friend/request")
      .send({ friendId: userA.id });
    expect(response.status).toBe(400);
    expect(response.body.message).toBe(
      "You cannot send a friend request to yourself",
    );
  });
  it("when friend is blocked by user,  should return 403", async () => {
    await agentA.put("/session/friend/blockUser").send({
      blockUserId: userB.id,
    });
    const response = await agentA
      .put("/session/friend/request")
      .send({ friendId: userB.id });
    expect(response.status).toBe(403);
    expect(response.body.message).toBe("You have blocked this user");
  });
  it("when user is blocked by friend, should return 403", async () => {
    await agentA.put("/session/friend/blockUser").send({
      blockUserId: userB.id,
    });
    const response = await agentB
      .put("/session/friend/request")
      .send({ friendId: userA.id });
    expect(response.status).toBe(403);
    expect(response.body.message).toBe(
      "you cannot send this user a friend request",
    );
  });
  it("when already friends, should return 400", async () => {
    await agentA.put("/session/friend/request").send({ friendId: userB.id });
    await agentB.put("/session/friend/acceptRequest").send({
      friendId: userA.id,
    });
    const res = await agentA
      .put("/session/friend/request")
      .send({ friendId: userB.id });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("You are already friends with this user");
  });

  it("with twice with the same ID, should return 400", async () => {
    await agentA.put("/session/friend/request").send({ friendId: userB.id });

    const response = await agentA
      .put("/session/friend/request")
      .send({ friendId: userB.id });
    expect(response.status).toBe(200);
    const sentIds = response.body.data.friendRequestsSentIDs;
    const occurrences = sentIds.filter((id: string) => id === userB.id).length;
    expect(occurrences).toBe(1);
  });

  it("with user B id, should return 200", async () => {
    const response = await agentA
      .put("/session/friend/request")
      .send({ friendId: userB.id });
    expect(response.status).toBe(200);
    expect(response.body.data.friendRequestsSentIDs).toEqual(
      expect.arrayContaining([userB.id]),
    );
    await agentB.get("/session/profile").then((response2) => {
      expect(response2.status).toBe(200);
      expect(response2.body.data.friendRequestsReceivedIDs).toEqual(
        expect.arrayContaining([userA.id]),
      );
    });
  });
});

describe("friend request accept response", () => {
  authAndValidationTests("/session/friend/acceptRequest", "friendId");

  it("with id of non existing user, should return 404", async () => {
    const response = await agentA
      .put("/session/friend/acceptRequest")
      .send({ friendId: fakeID });
    expect(response.body.message).toBe("friend not found");
    expect(response.status).toBe(404);
    expect(response.body.message).toBe("friend not found");
  });
  it("with no friend request", async () => {
    const res = await agentA.put("/session/friend/acceptRequest").send({
      friendId: userB.id,
    });
    expect(res.status).toBe(404);
    expect(res.body.message).toBe(
      "you do not have a valid friend request from this user",
    );
  });
  it("with valid friend request and correct id, should return 200", async () => {
    await agentB.put("/session/friend/request").send({ friendId: userA.id });

    const res = await agentA.put("/session/friend/acceptRequest").send({
      friendId: userB.id,
    });
    expect(res.body.message).toBe("friend request accepted");
    expect(res.status).toBe(200);
    expect(res.body.data.friendIDs).toEqual(expect.arrayContaining([userB.id]));
    expect(res.body.data.friendRequestsReceivedIDs).not.toEqual(
      expect.arrayContaining([userB.id]),
    );
  });
});

describe("friend request reject response", () => {
  authAndValidationTestsDelete("/session/friend/rejectRequest", "friendId");

  it("with id of non existing user, should return 404", async () => {
    const response = await agentA
      .delete("/session/friend/rejectRequest")
      .send({ friendId: fakeID });
    expect(response.body.message).toBe("friend not found");
    expect(response.status).toBe(404);
    expect(response.body.message).toBe("friend not found");
  });
  it("with valid friend request and correct id, should return 200", async () => {
    await agentB.put("/session/friend/request").send({ friendId: userA.id });
    const res = await agentA.delete("/session/friend/rejectRequest").send({
      friendId: userB.id,
    });
    expect(res.status).toBe(200);
    expect(res.body.message).toBe("friend request removed");
    expect(res.body.data.friendIDs).not.toEqual(
      expect.arrayContaining([userB.id]),
    );
    expect(res.body.data.friendRequestsReceivedIDs).not.toEqual(
      expect.arrayContaining([userB.id]),
    );
  });
});

describe("remove friend request", () => {
  authAndValidationTestsDelete("/session/friend/request", "friendId");

  // TODO: there are no checks fro existing user or friend request, i don't think this is a problem
  it("with id of non existing user, should return 200", async () => {
    const response = await agentA
      .delete("/session/friend/request")
      .send({ friendId: fakeID });
    expect(response.status).toBe(200);
    expect(response.body.message).toBe("friend request removed");
  });
  it("with no request, should return 200", async () => {
    const response = await agentA
      .delete("/session/friend/request")
      .send({ friendId: userB.id });
    expect(response.status).toBe(200);
    expect(response.body.message).toBe("friend request removed");
  });
  it("with existing request, should return 200", async () => {
    await agentB.put("/session/friend/request").send({ friendId: userA.id });
    const response = await agentA
      .delete("/session/friend/request")
      .send({ friendId: userB.id });
    expect(response.status).toBe(200);
    expect(response.body.message).toBe("friend request removed");
  });
});

describe("remove friend", () => {
  authAndValidationTestsDelete("/session/friend/remove", "friendId");

  it("with id of non existing user, should return 404", async () => {
    const response = await agentA
      .delete("/session/friend/remove")
      .send({ friendId: fakeID });
    expect(response.status).toBe(404);
    expect(response.body.message).toBe("friend to disconnect not found");
  });
  it("with no request, should return 200", async () => {
    const response = await agentA
      .delete("/session/friend/remove")
      .send({ friendId: userB.id });
    expect(response.status).toBe(200);
    expect(response.body.message).toBe("friend removed");
  });
  it("with existing request, should return 200", async () => {
    await agentB.put("/session/friend/request").send({ friendId: userA.id });
    const response = await agentA
      .delete("/session/friend/remove")
      .send({ friendId: userB.id });
    expect(response.status).toBe(200);
    expect(response.body.message).toBe("friend removed");
  });
});

describe("block User", () => {
  authAndValidationTests("/session/friend/blockUser", "blockUserId");

  it("with own user Id should return 409", async () => {
    const res = await agentA.put("/session/friend/blockUser").send({
      blockUserId: userA.id,
    });
    expect(res.status).toBe(409);
    expect(res.body.message).toBe("cannot block yourself");
  });
  it("which is already blocked, should return 409", async () => {
    await agentA.put("/session/friend/blockUser").send({
      blockUserId: userB.id,
    });
    const res = await agentA.put("/session/friend/blockUser").send({
      blockUserId: userB.id,
    });
    expect(res.status).toBe(409);
    expect(res.body.message).toBe("user is already blocked");
  });
  it("should return 200", async () => {
    const res = await agentA.put("/session/friend/blockUser").send({
      blockUserId: userB.id,
    });
    expect(res.status).toBe(200);
    expect(res.body.message).toBe("user blocked");
    expect(res.body.data.blockedUserIDs).toEqual(
      expect.arrayContaining([userB.id]),
    );
  });
  it("who is has sent a friend request to user, should return 200", async () => {
    await agentA.put("/session/friend/request").send({
      friendId: userB.id,
    });
    const res = await agentA.put("/session/friend/blockUser").send({
      blockUserId: userB.id,
    });
    expect(res.status).toBe(200);
    expect(res.body.message).toBe("user blocked");
    expect(res.body.data.blockedUserIDs).toEqual(
      expect.arrayContaining([userB.id]),
    );
    expect(res.body.data.friendRequestsSentIDs).not.toEqual(
      expect.arrayContaining([userB.id]),
    );
    expect(res.body.data.friendIDs).not.toEqual(
      expect.arrayContaining([userB.id]),
    );
    expect(res.body.data.friendRequestsReceivedIDs).not.toEqual(
      expect.arrayContaining([userB.id]),
    );
    const resCheck = await agentB.get("/session/profile/");
    expect(resCheck.body.data.friendRequestsSentIDs).not.toEqual(
      expect.arrayContaining([userA.id]),
    );
    expect(resCheck.body.data.friendIDs).not.toEqual(
      expect.arrayContaining([userA.id]),
    );
    expect(resCheck.body.data.friendRequestsReceivedIDs).not.toEqual(
      expect.arrayContaining([userA.id]),
    );
  });
  it("who is has received a friend request from user, should return 200", async () => {
    await agentB.put("/session/friend/request").send({
      friendId: userA.id,
    });
    const res = await agentA.put("/session/friend/blockUser").send({
      blockUserId: userB.id,
    });
    expect(res.status).toBe(200);
    expect(res.body.message).toBe("user blocked");
    expect(res.body.data.blockedUserIDs).toEqual(
      expect.arrayContaining([userB.id]),
    );
    expect(res.body.data.friendRequestsSentIDs).not.toEqual(
      expect.arrayContaining([userB.id]),
    );
    expect(res.body.data.friendIDs).not.toEqual(
      expect.arrayContaining([userB.id]),
    );
    expect(res.body.data.friendRequestsReceivedIDs).not.toEqual(
      expect.arrayContaining([userB.id]),
    );
    const resCheck = await agentB.get("/session/profile/");
    expect(resCheck.body.data.friendRequestsSentIDs).not.toEqual(
      expect.arrayContaining([userA.id]),
    );
    expect(resCheck.body.data.friendIDs).not.toEqual(
      expect.arrayContaining([userA.id]),
    );
    expect(resCheck.body.data.friendRequestsReceivedIDs).not.toEqual(
      expect.arrayContaining([userA.id]),
    );
  });
  it("who is a friend, should return 200", async () => {
    await agentB.put("/session/friend/request").send({
      friendId: userA.id,
    });
    await agentA.put("/session/friend/acceptRequest").send({
      friendId: userB.id,
    });
    const res = await agentA.put("/session/friend/blockUser").send({
      blockUserId: userB.id,
    });
    expect(res.status).toBe(200);
    expect(res.body.message).toBe("user blocked");
    expect(res.body.data.blockedUserIDs).toEqual(
      expect.arrayContaining([userB.id]),
    );
    expect(res.body.data.friendRequestsSentIDs).not.toEqual(
      expect.arrayContaining([userB.id]),
    );
    expect(res.body.data.friendIDs).not.toEqual(
      expect.arrayContaining([userB.id]),
    );
    expect(res.body.data.friendRequestsReceivedIDs).not.toEqual(
      expect.arrayContaining([userB.id]),
    );
    const resCheck = await agentB.get("/session/profile/");
    expect(resCheck.body.data.friendRequestsSentIDs).not.toEqual(
      expect.arrayContaining([userA.id]),
    );
    expect(resCheck.body.data.friendIDs).not.toEqual(
      expect.arrayContaining([userA.id]),
    );
    expect(resCheck.body.data.friendRequestsReceivedIDs).not.toEqual(
      expect.arrayContaining([userA.id]),
    );
  });
});

describe("unblock User", () => {
  authAndValidationTests("/session/friend/blockUser", "blockUserId");

  it("with friend Id should return 409", async () => {
    const res = await agentA.delete("/session/friend/unblockUser").send({
      friendId: userB.id,
    });
    expect(res.status).toBe(422);
  });

  it("with own user Id should return 409", async () => {
    const res = await agentA.delete("/session/friend/unblockUser").send({
      blockUserId: userA.id,
    });
    expect(res.status).toBe(409);
    expect(res.body.message).toBe("cannot unblock yourself");
  });
  it("which is not blocked, should return 409", async () => {
    const res = await agentA.delete("/session/friend/unblockUser").send({
      blockUserId: userB.id,
    });
    expect(res.status).toBe(409);
    expect(res.body.message).toBe("This user was not blocked");
  });
  it("should return 200", async () => {
    await agentA.put("/session/friend/blockUser").send({
      blockUserId: userB.id,
    });
    const res = await agentA.delete("/session/friend/unblockUser").send({
      blockUserId: userB.id,
    });
    console.log(res.body.error);
    console.log(res.body);
    expect(res.status).toBe(200);
    expect(res.body.message).toBe("user unblocked");
    expect(res.body.data.blockedUserIDs).not.toEqual(
      expect.arrayContaining([userB.id]),
    );
  });
});
