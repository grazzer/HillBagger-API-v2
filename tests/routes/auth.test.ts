import request from "supertest";
import { app } from "../../src/app.js";

// Integration tests for the user endpoint

const testUserName: string = "Tester";
const testUserEmail: string = "email@email.com";
const testUserPassword: string = "Password123!";

const incorrectJWT =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
const agent = request.agent(app);

let userCookie = "";
afterAll(async () => {
  await request(app)
    .delete("/session/profile/deleteUser")
    .set("Cookie", [userCookie]);
});

describe("register user", () => {
  describe("without", () => {
    it("password, should return 422", async () => {
      await request(app)
        .post("/register")
        .send({
          name: "TestUser",
          email: "email@email.com",
          // password missing
        })
        .then((response) => {
          expect(response.status).toBe(422);
          expect(response.body.errors[0].msg).toEqual("Password is required");
        });
    });
    it("numbers in password, should return 422", async () => {
      await request(app)
        .post("/register")
        .send({
          name: "TestUser",
          email: "email@email.com",
          password: "Password!",
        })
        .then((response) => {
          expect(response.status).toBe(422);
          expect(response.body.errors[0].msg).toEqual(
            "Password must contain at least one uppercase letter, one lowercase letter, one number, and one symbol"
          );
        });
    });
    it("a long enough password, should return 422", async () => {
      await request(app)
        .post("/register")
        .send({
          name: "TestUser",
          email: "email@email.com",
          password: "Pass1!",
        })
        .then((response) => {
          expect(response.status).toBe(422);
          expect(response.body.errors[0].msg).toEqual(
            "Password must be at least 8 characters long"
          );
        });
    });
    it("email, should return 422", async () => {
      await request(app)
        .post("/register")
        .send({
          name: "TestUser",
          // email missing
          password: "Password123!",
        })
        .then((response) => {
          expect(response.status).toBe(422);
          expect(response.body.errors[0].msg).toEqual("Email is required");
        });
    });
    it("a complete email, should return 422", async () => {
      await request(app)
        .post("/register")
        .send({
          name: "TestUser",
          email: "emailemail.com",
          password: "Password123!",
        })
        .then((response) => {
          expect(response.status).toBe(422);
          expect(response.body.errors[0].msg).toEqual("Invalid email format");
        });
    });
    //   await request(app)
    //     .post("/register")
    //     .send({
    //       // name missing
    //       email: "email@email.com",
    //       password: "Password123!",
    //     })
    //     .then((response) => {
    //       expect(response.status).toBe(422);
    //       expect(response.body.errors[0].msg).toEqual("Name is required");
    //     });
    // });
    it("name, should return 422", async () => {
      await request(app)
        .post("/register")
        .send({
          // name missing
          email: "email@email.com",
          password: "Password123!",
        })
        .then((response) => {
          expect(response.status).toBe(422);
          expect(response.body.errors[0].msg).toEqual(
            "Name must be at least 1 character long"
          );
        });
    });
  });
  describe("with", () => {
    it("valid details, should return 201 and user data", async () => {
      await request(app)
        .post("/register")
        .send({
          name: testUserName,
          email: testUserEmail,
          password: testUserPassword,
        })
        .then((response) => {
          expect(response.status).toBe(201);
          expect(response.body.data).toHaveProperty("id");
          expect(response.body.data).toHaveProperty("name", testUserName);
          expect(response.body.data).toHaveProperty("email", testUserEmail);
          expect(response.body.data).not.toHaveProperty("password");
        });
    });
    it("valid details again, should return 403 and user data", async () => {
      await request(app)
        .post("/register")
        .send({
          name: testUserName,
          email: testUserEmail,
          password: testUserPassword,
        })
        .then((response) => {
          expect(response.status).toBe(403);
        });
    });
  });
});

describe("login user", () => {
  describe("without", () => {
    it("password, should return 422", async () => {
      await request(app)
        .post("/login")
        .send({
          email: testUserEmail,
          // password missing
        })
        .then((response) => {
          expect(response.status).toBe(422);
          expect(response.body.errors[0].msg).toEqual("Password is required");
        });
    });
    it("email, should return 422", async () => {
      await request(app)
        .post("/login")
        .send({
          // email missing
          password: testUserPassword,
        })
        .then((response) => {
          expect(response.status).toBe(422);
          expect(response.body.errors[0].msg).toEqual("Email is required");
        });
    });
    it("email, should return 422", async () => {
      await request(app)
        .post("/login")
        .send({
          email: "emailemail.com",
          password: testUserPassword,
        })
        .then((response) => {
          expect(response.status).toBe(422);
          expect(response.body.errors[0].msg).toEqual("Invalid email format");
        });
    });
  });
  describe("with", () => {
    it("invalid email, should return 401", async () => {
      await request(app)
        .post("/login")
        .send({
          email: "wrong@email.com",
          password: testUserPassword,
        })
        .then((response) => {
          expect(response.status).toBe(401);
        });
    });
    it("invalid password, should return 401", async () => {
      await request(app)
        .post("/login")
        .send({
          email: testUserEmail,
          password: "WrongPassword123!",
        })
        .then((response) => {
          expect(response.status).toBe(401);
        });
    });
    it("valid details, should return 200 and set cookie", async () => {
      await request(app);
      agent
        .post("/login")
        .send({
          email: testUserEmail,
          password: testUserPassword,
        })
        .then((response) => {
          expect(response.status).toBe(200);
          expect(response.headers).toHaveProperty("set-cookie");
          expect(response.headers["set-cookie"][0]).toMatch(/accessToken=/);
          expect(response.headers["set-cookie"][1]).toMatch(/refreshToken=/);
        });
    });
  });
});

describe("refresh access token", () => {
  describe("without", () => {
    it("refresh token, should return 401", async () => {
      await request(app)
        .get("/refresh")
        .then((response) => {
          expect(response.status).toBe(401);
        });
    });
    // TODO: i don't think this is for wrong refresh token, instead its testing a missing refresh token
    it("valid refresh token, should return 401", async () => {
      await request(app)
        .get("/refresh")
        .set("Cookie", [`accessToken=${incorrectJWT}`])
        .then((response) => {
          expect(response.status).toBe(401);
        });
    });
  });

  describe("with", () => {
    it("valid refresh token, should return 200 and set new access token", async () => {
      await request(app);
      agent.get("/refresh").then((response) => {
        expect(response.status).toBe(200);
        expect(response.headers).toHaveProperty("accessToken");
        expect(response.headers.accessToken).toBeDefined();
      });
    });
  });
});
