// import request from "supertest";
// import { app } from "../../src/app.js";
// import type { Ascent } from "@prisma/client";

// //Integration tests for the user endpoint
// let testUserID: string = "";
// const testUserName: string = "Tester";
// const hillId: string = "6808acb64466bb2759b4cc82";
// const invalidHillId: string = "6808acb64466bb2759b4cc81";
// let testUserCookie: string = "";

// beforeAll(async () => {
//   // Create test users
//   await request(app)
//     .post("/register")
//     .send({
//       name: testUserName,
//       email: "test@email.com",
//       password: "Password123!",
//     })
//     .then((response) => {
//       testUserID = response.body.data.id;
//     });
//   await request(app)
//     .post("/login")
//     .send({
//       email: "test@email.com",
//       password: "Password123!",
//     })
//     .then((response) => {
//       testUserCookie = response.headers["set-cookie"];
//     });
//   // TODO: assign user an to an ascent
// });

// afterAll(async () => {
//   await request(app)
//     .delete("/session/profile/deleteUser")
//     .set("Cookie", [testUserCookie]);
// });

// // TOLEARN: two methods of checking keys in objects, what is the difference between toHaveProperty and toEqual(expect.objectContaining())?

// describe("user search", () => {
//   describe("Get user by ID", () => {
//     it("with no user ID, should error 422", async () => {
//       await request(app)
//         .get("/getUser/ById")
//         .then((Response) => expect(Response.status).toBe(422));
//     });
//     it("with invalid user ID, should error 404", async () => {
//       await request(app)
//         .get("/getUser/ById")
//         .send({ userId: "68eab8103d85d4eb2ce8fd76" })
//         .then((Response) => expect(Response.status).toBe(404));
//     });
//     it("with valid user ID, should return user", async () => {
//       await request(app)
//         .get("/getUser/ById")
//         .send({ userId: testUserID })
//         .then((Response) => {
//           expect(Response.status).toBe(200);
//           expect(Response.body.data).toHaveProperty("photo");
//           expect(Response.body.data).toEqual(
//             expect.objectContaining({
//               id: expect.any(String),
//               name: expect.any(String),
//               friendIDs: expect.any(Array),
//               ascentIDs: expect.any(Array),
//             })
//           );
//           // expect(
//           //   Response.body.data.photo === null ||
//           //     typeof Response.body.data.photo === "string"
//           // ).toBe(true);
//           expect(Response.body.data).not.toHaveProperty("password");
//           expect(Response.body.data).not.toHaveProperty("email");
//           expect(Response.body.data).not.toHaveProperty("blockedIDs");
//           expect(Response.body.data).not.toHaveProperty(
//             "FriendRequestsReceivedIDs"
//           );
//         });
//     });
//   });

//   describe("Get user by name", () => {
//     it("with no name, should error 422", async () => {
//       await request(app)
//         .get("/getUser/ByName")
//         .then((Response) => expect(Response.status).toBe(422));
//     });
//     it("with invalid name, should error 404", async () => {
//       await request(app)
//         .get("/getUser/ByName")
//         .send({ userName: "NonExistentUser" })
//         .then((Response) => expect(Response.status).toBe(404));
//     });
//     it("with valid Name, should return user", async () => {
//       await request(app)
//         .get("/getUser/ByName")
//         .send({ userName: testUserName })
//         .then((Response) => {
//           expect(Response.status).toBe(200);
//           expect(Array.isArray(Response.body.data)).toBe(true);
//           expect(Response.body.data.length).toBeGreaterThan(0);
//           // fields that should exist in user object
//           expect(Response.body.data[0]).toHaveProperty("id");
//           expect(Response.body.data[0]).toHaveProperty("name");
//           expect(Response.body.data[0]).toHaveProperty("friendIDs");
//           // fields that should be removed in none authorized user search
//           expect(Response.body.data[0]).not.toHaveProperty("password");
//           expect(Response.body.data[0]).not.toHaveProperty("email");
//           expect(Response.body.data[0]).not.toHaveProperty("blockedIDs");
//           expect(Response.body.data[0]).not.toHaveProperty(
//             "FriendRequestsReceivedIDs"
//           );
//         });
//     });
//     it("with partial name match, should return user", async () => {
//       await request(app)
//         .get("/getUser/ByName")
//         .send({ userName: "Test" })
//         .then((Response) => {
//           expect(Response.status).toBe(200);
//           expect(Array.isArray(Response.body.data)).toBe(true);
//           expect(Response.body.data.length).toBeGreaterThan(0);
//           const userNames = Response.body.data.map((user: any) => user.name);
//           expect(userNames).toEqual(expect.arrayContaining([testUserName]));
//         });
//     });
//   });

//   describe("Get user by ascent", () => {
//     it("with no hill ID, should error 422", async () => {
//       await request(app)
//         .get("/getUser/ByAscent")
//         .then((Response) => expect(Response.status).toBe(422));
//     });
//     it("with invalid hill ID, should error 404", async () => {
//       await request(app)
//         .get("/getUser/ByAscent")
//         .send({ hillId: invalidHillId })
//         .then((Response) => expect(Response.status).toBe(404));
//     });
//     // const ascentPartial: Partial<Ascent> = {
//     //   id: "",
//     //   date: new Date("2025-01-01T10:00:00Z"),
//     //   hillID: "6808acb64466bb2759b4cc84",
//     // };
//     // it("with valid hill ID, should return user", async () => {
//     //   await request(app)
//     //     .post("/session/ascent/create")
//     //     .set("Cookie", [testUserCookie])
//     //     .send({
//     //       date: ascentPartial.date,
//     //       hillID: ascentPartial.hillID,
//     //     });
//     //   await request(app)
//     //     .get("/getUser/ByAscent")
//     //     .send({ hillId: ascentPartial.hillID })
//     //     .then((Response) => {
//     //       expect(Response.status).toBe(200);
//     //       expect(Array.isArray(Response.body.data)).toBe(true);
//     //       expect(Response.body.data.length).toBeGreaterThan(0);
//     //       // fields that should exist in user object
//     //       expect(Response.body.data[0]).toHaveProperty("id");
//     //       expect(Response.body.data[0].id).toBe(testUserID);
//     //       expect(Response.body.data[0]).toHaveProperty("name");
//     //       expect(Response.body.data[0]).toHaveProperty("friendIDs");
//     //       // fields that should be removed in none authorized user search
//     //       expect(Response.body.data[0]).not.toHaveProperty("password");
//     //       expect(Response.body.data[0]).not.toHaveProperty("email");
//     //       expect(Response.body.data[0]).not.toHaveProperty("blockedIDs");
//     //       expect(Response.body.data[0]).not.toHaveProperty(
//     //         "FriendRequestsReceivedIDs"
//     //       );
//     //     });
//     // });
//   });
// });
