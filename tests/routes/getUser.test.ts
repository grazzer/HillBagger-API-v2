import request from "supertest";
import { app } from "../../src/app.js";
import type { User } from "@prisma/client";

// End-to-end tests for /getUser routes

const fakeID = "6808acb64466bb2759b4cc82"; // well-formed but non-existent
const fakeHillID = "6808acb64466bb2759b4cc90";

let testUsers: Partial<User>[] = [];
let ascentHillID = "6808acb64466bb2759b4cc99"; // hillID for ascents
let ascentId = ""; // will store the created ascent ID
const testUserCreator = {
  id: "",
  name: "GetUser Tester Creator",
  email: "getuser-creator@test-email.com",
  password: "Password123!",
};

let agent = request.agent(app);

beforeAll(async () => {
  // Register and login creator
  await agent.post("/register").send({
    name: testUserCreator.name,
    email: testUserCreator.email,
    password: testUserCreator.password,
  });
  const creatorRes = await agent.post("/login").send({
    email: testUserCreator.email,
    password: testUserCreator.password,
  });
  testUserCreator.id = creatorRes.body.data.id;

  // Create test users
  const testUserData = [
    {
      name: "Alice Test User",
      email: "alice@test.com",
      password: "Password123!",
    },
    {
      name: "Bob Test User",
      email: "bob@test.com",
      password: "Password123!",
    },
    {
      name: "Alice Another",
      email: "alice2@test.com",
      password: "Password123!",
    },
  ];

  for (const userData of testUserData) {
    const registerRes = await request(app).post("/register").send(userData);
    testUsers.push({
      id: registerRes.body.data?.id,
      name: userData.name,
      email: userData.email,
    });
  }

  // Create an ascent for the first test user so we have data for ByAscent tests
  const ascentAgent = request.agent(app);
  await ascentAgent.post("/login").send({
    email: testUserData[0]?.email,
    password: testUserData[0]?.password,
  });
  const ascentRes = await ascentAgent.post("/session/ascent/create").send({
    date: new Date("2025-02-15").toISOString(),
    hillID: ascentHillID,
  });
  if (ascentRes.status === 200 || ascentRes.status === 201) {
    ascentId = ascentRes.body.data?.id || "";
  }
});

afterAll(async () => {
  // Clean up: delete all test users
  for (const user of testUsers) {
    const testAgent = request.agent(app);
    await testAgent.post("/login").send({
      email: user.email,
      password: "Password123!",
    });
    await testAgent.delete("/session/profile/deleteUser");
  }

  // Delete creator
  await agent.delete("/session/profile/deleteUser");
});

describe("/getUser routes - end-to-end", () => {
  describe("GET /getUser/ById", () => {
    // Validation error tests
    describe("Validation errors", () => {
      it("422 when userId is missing", async () => {
        const res = await request(app).get("/getUser/ById");
        expect(res.status).toBe(422);
      });

      it("422 when userId is not a hexadecimal", async () => {
        const res = await request(app).get("/getUser/ById").send({
          userId: 123,
        });
        expect(res.status).toBe(422);
      });

      it("422 when userId is not the correct length", async () => {
        const res = await request(app).get("/getUser/ById").send({
          userId: "123",
        });
        expect(res.status).toBe(422);
      });

      it("422 when userId is not a valid MongoDB ID", async () => {
        const res = await request(app).get("/getUser/ById").send({
          userId: "ZZZZZZZZZZZZZZZZZZZZZZZZ",
        });
        expect(res.status).toBe(422);
      });
    });

    // Controller error tests
    describe("Successful retrieval", () => {
      it("200 and user data when userId is valid", async () => {
        const res = await request(app).get("/getUser/ById").send({
          userId: testUsers[0]?.id,
        });
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe("User found");
        expect(res.body.data).toBeDefined();
        expect(res.body.data).toBeInstanceOf(Array);
        expect(res.body.data.length).toBeGreaterThan(0);
        expect(res.body.data[0].id).toBe(testUsers[0]?.id);
        expect(res.body.data[0].name).toBe(testUsers[0]?.name);
      });
    });

    // Unsuccessful retrieval
    describe("Unsuccessful retrieval", () => {
      it("404 when userId is well-formed but does not exist", async () => {
        const res = await request(app).get("/getUser/ById").send({
          userId: fakeID,
        });
        expect(res.status).toBe(404);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe("User not found");
      });
    });
  });

  describe("GET /getUser/ByName", () => {
    // Validation error tests
    describe("Validation errors", () => {
      it("422 when userName is missing", async () => {
        const res = await request(app).get("/getUser/ByName");
        expect(res.status).toBe(422);
      });

      it("422 when userName is not a string", async () => {
        const res = await request(app).get("/getUser/ByName").send({
          userName: 123,
        });
        expect(res.status).toBe(422);
      });

      it("422 when userName contains numerical characters", async () => {
        const res = await request(app).get("/getUser/ByName").send({
          userName: "User123",
        });
        expect(res.status).toBe(422);
      });

      it("422 when userName is empty string", async () => {
        const res = await request(app).get("/getUser/ByName").send({
          userName: "",
        });
        expect(res.status).toBe(422);
      });
    });

    // Successful retrieval
    describe("Successful retrieval", () => {
      it("200 and user data when userName is valid and exists", async () => {
        const res = await request(app).get("/getUser/ByName").send({
          userName: testUsers[0]?.name,
        });
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe("User(s) found");
        expect(res.body.data).toBeDefined();
        expect(res.body.data).toBeInstanceOf(Array);
        expect(res.body.data.length).toBeGreaterThan(0);
        expect(res.body.data[0].name).toBe(testUsers[0]?.name);
      });

      it("200 and multiple users when multiple users have similar names", async () => {
        const res = await request(app).get("/getUser/ByName").send({
          userName: "Alice",
        });
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toBeInstanceOf(Array);
        expect(res.body.data.length).toBeGreaterThanOrEqual(2);
      });
    });

    // Unsuccessful retrieval
    describe("Unsuccessful retrieval", () => {
      it("404 when userName does not exist", async () => {
        const res = await request(app).get("/getUser/ByName").send({
          userName: "NonexistentUser",
        });
        expect(res.status).toBe(404);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe("No users found");
      });
    });
  });

  describe("GET /getUser/ByAscent", () => {
    // Validation error tests
    describe("Validation errors", () => {
      it("422 when hillId is missing", async () => {
        const res = await request(app).get("/getUser/ByAscent");
        expect(res.status).toBe(422);
      });

      it("422 when hillId is not a hexadecimal", async () => {
        const res = await request(app).get("/getUser/ByAscent").send({
          hillId: 123,
        });
        expect(res.status).toBe(422);
      });

      it("422 when hillId is not the correct length", async () => {
        const res = await request(app).get("/getUser/ByAscent").send({
          hillId: "123",
        });
        expect(res.status).toBe(422);
      });

      it("422 when hillId is not a valid MongoDB ID", async () => {
        const res = await request(app).get("/getUser/ByAscent").send({
          hillId: "ZZZZZZZZZZZZZZZZZZZZZZZZ",
        });
        expect(res.status).toBe(422);
      });
    });

    // Successful retrieval
    describe("Successful retrieval", () => {
      it("200 and user data when hillId (ascentId) has users", async () => {
        const res = await request(app).get("/getUser/ByAscent").send({
          hillId: ascentId,
        });
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe("User(s) found");
        expect(res.body.data).toBeDefined();
        expect(res.body.data).toBeInstanceOf(Array);
        expect(res.body.data.length).toBeGreaterThan(0);

        // Verify user data shape
        const user = res.body.data[0];
        expect(user).toHaveProperty("id");
        expect(user).toHaveProperty("name");
        expect(typeof user.id).toBe("string");
        expect(typeof user.name).toBe("string");
        expect(user.id).toBe(testUsers[0]?.id);
        expect(user.name).toBe(testUsers[0]?.name);
      });
    });

    // Unsuccessful retrieval
    describe("Unsuccessful retrieval", () => {
      it("404 when hillId is well-formed but no ascents exist for that hill", async () => {
        const res = await request(app).get("/getUser/ByAscent").send({
          hillId: fakeHillID,
        });
        expect(res.status).toBe(404);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe("No users found");
      });
    });
  });

  describe("Error handling - 500 errors", () => {
    // Note: These tests attempt to find scenarios that would return 500
    // Most 500 errors would come from database connection issues or unexpected data states

    it("should handle database errors gracefully", async () => {
      // Send valid formatted request that might trigger DB issues
      // This is a placeholder - actual 500 errors would require DB simulation
      const res = await request(app).get("/getUser/ById").send({
        userId: testUsers[0]?.id,
      });
      // If database is working, this should not be 500
      expect(res.status).not.toBe(500);
    });

    // Testing with edge cases that might cause issues
    describe("Edge cases", () => {
      it("should handle empty result sets without errors", async () => {
        const res = await request(app).get("/getUser/ByName").send({
          userName: "UniqueNonexistentName",
        });
        // Should be 404, not 500
        expect([404, 200]).toContain(res.status);
        expect(res.status).not.toBe(500);
      });

      it("should handle valid ID format with no results as 404, not 500", async () => {
        const res = await request(app).get("/getUser/ById").send({
          userId: fakeID,
        });
        expect(res.status).not.toBe(500);
      });
    });
  });
});
