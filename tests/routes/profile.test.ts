import request from "supertest";
import { app } from "../../src/app.js";

//Integration tests for the profile endpoint
let userAid: string = "";
let userBid: string = "";
let userACookie: string = "";
let userBCookie: string = "";

beforeAll(async () => {
  await request(app)
    .post("/register")
    .send({
      name: "Tester A",
      email: "testA@email.com",
      password: "Password123!",
    })
    .then((response) => {
      userAid = response.body.data.id;
    });
  await request(app)
    .post("/register")
    .send({
      name: "Tester B",
      email: "testB@email.com",
      password: "Password123!",
    })
    .then((response) => {
      userBid = response.body.data.id;
    });
  await request(app)
    .post("/login")
    .send({
      email: "testA@email.com",
      password: "Password123!",
    })
    .then((response) => {
      userACookie = response.headers["set-cookie"];
    });
  await request(app)
    .post("/login")
    .send({
      email: "testB@email.com",
      password: "Password123!",
    })
    .then((response) => {
      userBCookie = response.headers["set-cookie"];
    });
});

afterAll(async () => {
  await request(app).post("/logout").set("Cookie", [userACookie]);
  await request(app).post("/logout").set("Cookie", [userBCookie]);
  await request(app).delete("/user").set("Cookie", [userACookie]);
  await request(app).delete("/user").set("Cookie", [userBCookie]);
});

describe("friend request", () => {
  it("Get profile with no cookie", async () => {
    const response: any = await request(app).get("/profile");
    expect(response.status).toBe(401);
  });
  it("Put new friend request with no friend ID", async () => {
    const response: any = await request(app)
      .put("/friend/request")
      .set("Cookie", [userACookie]);
    expect(response.status).toBe(422);
  });
  it("Put new friend request with own ID", async () => {
    const response: any = await request(app)
      .put("/friend/request")
      .set("Cookie", [userACookie])
      .send({ friendId: userAid });
    expect(response.status).toBe(400);
  });
  it("Put new friend request with incorrect Id", async () => {
    const response: any = await request(app)
      .put("/friend/request")
      .set("Cookie", [userACookie])
      .send({ friendId: "68eab8103d85d4eb2ce8fd76" });
    expect(response.status).toBe(404);
  });
  it("PUT new request", async () => {
    const response: any = await request(app)
      .put("/friend/request")
      .set("Cookie", [userACookie])
      .send({ friendId: userBid });
    expect(response.status).toBe(200);
    expect(response.body.data.FriendRequestsSentIDs).toEqual(
      expect.arrayContaining([userBid])
    );
    await request(app)
      .get("/profile")
      .set("Cookie", [userBCookie])
      .then((response2) => {
        expect(response2.status).toBe(200);
        expect(response2.body.data.FriendRequestsReceivedIDs).toEqual(
          expect.arrayContaining([userAid])
        );
      });
  });
  it("Put new friend request with same ID again", async () => {
    const response: any = await request(app)
      .put("/friend/request")
      .set("Cookie", [userACookie])
      .send({ friendId: userBid });
    expect(response.status).toBe(200);
    const sentIds = response.body.data.FriendRequestsSentIDs;
    const occurrences = sentIds.filter((id: string) => id === userBid).length;
    expect(occurrences).toBe(1);
  });
  it("Delete request", async () => {
    const response: any = await request(app)
      .delete("/friend/request")
      .set("Cookie", [userACookie])
      .send({ friendId: userBid });
    expect(response.status).toBe(200);
    const sentIds = response.body.data.FriendRequestsSentIDs;
    const occurrences = sentIds.filter((id: string) => id === userBid).length;
    expect(occurrences).toBe(0);
  });
  it("Delete non-existent request", async () => {
    await request(app)
      .delete("/friend/request")
      .set("Cookie", [userACookie])
      .send({ friendId: userBid })
      .then((response) => {
        expect(response.status).toBe(404);
      });
  });
  it("accept own friend request/ non-existent friend request", async () => {
    await request(app)
      .put("/friend/request")
      .set("Cookie", [userACookie])
      .send({ friendId: userBid });
    await request(app)
      .put("/friend/acceptRequest")
      .set("Cookie", [userACookie])
      .send({ friendId: userBid })
      .then((response) => {
        expect(response.status).toBe(404);
      });
  });
  it("accept friend request", async () => {
    await request(app)
      .put("/friend/acceptRequest")
      .set("Cookie", [userBCookie])
      .send({ friendId: userAid })
      .then((response) => {
        expect(response.status).toBe(200);
        expect(response.body.data.friendIDs).toEqual(
          expect.arrayContaining([userAid])
        );
      });
    await request(app)
      .get("/profile")
      .set("Cookie", [userACookie])
      .then((response2) => {
        expect(response2.status).toBe(200);
        expect(response2.body.data.friendIDs).toEqual(
          expect.arrayContaining([userBid]) || undefined
        );
      });
  });
  it("remove friend", async () => {
    await request(app)
      .delete("/friend/remove")
      .set("Cookie", [userACookie])
      .send({ friendId: userBid })
      .then((response) => {
        expect(response.status).toBe(200);
        expect(response.body.data.friendIDs).toEqual(
          expect.not.arrayContaining([userBid])
        );
      });
  });
  // TOLEARN: friend is already removed but there is no check for this
  // so it should still return 200
  // is this bad practice?
  it("remove non-friend", async () => {
    await request(app)
      .delete("/friend/remove")
      .set("Cookie", [userACookie])
      .send({ friendId: userBid })
      .then((response) => {
        expect(response.status).toBe(200);
      });
  });
  it("block user", async () => {
    await request(app)
      .put("/blockUser")
      .set("Cookie", [userACookie])
      .send({ blockUserId: userBid })
      .then((response) => {
        expect(response.status).toBe(200);
        expect(response.body.data.BlockedUserIDs).toEqual(
          expect.arrayContaining([userBid])
        );
        expect(response.body.data.friendIDs).toEqual(
          expect.not.arrayContaining([userBid])
        );
      });
  });
  it("block user again", async () => {
    await request(app)
      .put("/blockUser")
      .set("Cookie", [userACookie])
      .send({ blockUserId: userBid })
      .then((response) => {
        expect(response.status).toBe(409);
      });

    await request(app)
      .get("/profile")
      .set("Cookie", [userACookie])
      .then((response) => {
        const blockedIds = response.body.data.BlockedUserIDs;
        const occurrences = blockedIds.filter(
          (id: string) => id === userBid
        ).length;
        expect(occurrences).toBe(1);
      });
  });
  it("request friend from blocked user", async () => {
    await request(app)
      .put("/friend/request")
      .set("Cookie", [userBCookie])
      .send({ friendId: userAid })
      .then((response) => {
        expect(response.status).toBe(403);
      });
  });
  it("request friend from user you block", async () => {
    await request(app)
      .put("/friend/request")
      .set("Cookie", [userACookie])
      .send({ friendId: userBid })
      .then((response) => {
        expect(response.status).toBe(403);
      });
  });
  it("unblock user", async () => {
    await request(app)
      .delete("/unblockUser")
      .set("Cookie", [userACookie])
      .send({ blockUserId: userBid })
      .then((response) => {
        expect(response.status).toBe(200);
        expect(response.body.data.BlockedUserIDs).toEqual(
          expect.not.arrayContaining([userBid])
        );
      });
  });
  it("unblock non-blocked user", async () => {
    await request(app)
      .delete("/unblockUser")
      .set("Cookie", [userACookie])
      .send({ blockUserId: userBid })
      .then((response) => {
        expect(response.status).toBe(404);
      });
  });
  it("request friend after unblocking user", async () => {
    await request(app)
      .put("/friend/request")
      .set("Cookie", [userACookie])
      .send({ friendId: userBid })
      .then((response) => {
        expect(response.status).toBe(200);
        expect(response.body.data.FriendRequestsSentIDs).toEqual(
          expect.arrayContaining([userBid])
        );
      });
  });
  it("block friend", async () => {
    await request(app)
      .put("/blockUser")
      .set("Cookie", [userACookie])
      .send({ blockUserId: userBid })
      .then((response) => {
        expect(response.status).toBe(200);
        expect(response.body.data.friendIDs).toEqual(
          expect.not.arrayContaining([userBid])
        );
      });
  });
});
