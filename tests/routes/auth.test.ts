import request from "supertest";
import { app } from "../../src/app.js";
import jwt from "jsonwebtoken";

// Integration tests for the auth endpoint

let agentA = request.agent(app);
let agentB = request.agent(app);
const key = process.env.SECRET_ACCESS_TOKEN as string;

const authUserA = {
  name: "Auth Tester A",
  email: "testA@authemail.com",
  password: "Password123!",
};
const authUserB = {
  name: "Auth Tester B",
  email: "testB@authemail.com",
  password: "Password123!",
};

const incorrectJWT =
  "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJcIm5vbmVcIiIsImlhdCI6MTc2ODY4NTQ1MywiZXhwIjoxNzY4Njg2NzMwLCJhdWQiOiJ3d3cuZXhhbXBsZS5jb20iLCJzdWIiOiIifQ.TSWOA-LqTAOuccBw4W3drNyQdfkw8XJzc_K2JeS7KKo";

beforeEach(async () => {
  agentA = request.agent(app);
  agentB = request.agent(app);
});
afterEach(async () => {
  await agentA.post("/login").send({
    email: authUserA.email,
    password: authUserA.password,
  });
  await agentB.post("/login").send({
    email: authUserB.email,
    password: authUserB.password,
  });
  await agentA.delete("/session/profile/deleteUser");
  await agentB.delete("/session/profile/deleteUser");
});

beforeAll(async () => {
  agentA = request.agent(app);
  agentB = request.agent(app);
});

afterAll(async () => {
  agentA = request.agent(app);
  agentB = request.agent(app);
});

function passwordVal(url: string) {
  describe("with password", () => {
    it("missing, should return 422", async () => {
      await request(app)
        .post(url)
        .send({
          name: authUserA,
          email: authUserA.email,
        })
        .then((response) => {
          expect(response.status).toBe(422);
          expect(response.body.errors[0].msg).toEqual("Password is required");
        });
    });
    it("missing numbers, should return 422", async () => {
      await request(app)
        .post(url)
        .send({
          name: authUserA,
          email: authUserA.email,
          password: "Password!",
        })
        .then((response) => {
          expect(response.status).toBe(422);
          expect(response.body.errors[0].msg).toEqual(
            "Password must contain at least one uppercase letter, one lowercase letter, one number, and one symbol",
          );
        });
    });
    it("missing symbol, should return 422", async () => {
      await request(app)
        .post(url)
        .send({
          name: authUserA,
          email: authUserA.email,
          password: "Password123",
        })
        .then((response) => {
          expect(response.status).toBe(422);
          expect(response.body.errors[0].msg).toEqual(
            "Password must contain at least one uppercase letter, one lowercase letter, one number, and one symbol",
          );
        });
    });
    it("missing uppercase, should return 422", async () => {
      await request(app)
        .post(url)
        .send({
          name: authUserA,
          email: authUserA.email,
          password: "password123!",
        })
        .then((response) => {
          expect(response.status).toBe(422);
          expect(response.body.errors[0].msg).toEqual(
            "Password must contain at least one uppercase letter, one lowercase letter, one number, and one symbol",
          );
        });
    });
    it("missing lowercase, should return 422", async () => {
      await request(app)
        .post(url)
        .send({
          name: authUserA,
          email: authUserA.email,
          password: "PASSWORD23!",
        })
        .then((response) => {
          expect(response.status).toBe(422);
          expect(response.body.errors[0].msg).toEqual(
            "Password must contain at least one uppercase letter, one lowercase letter, one number, and one symbol",
          );
        });
    });
    it("not long enough, should return 422", async () => {
      await request(app)
        .post(url)
        .send({
          name: authUserA,
          email: authUserA.email,
          password: "Pass1!",
        })
        .then((response) => {
          expect(response.status).toBe(422);
          expect(response.body.errors[0].msg).toEqual(
            "Password must be at least 8 characters long",
          );
        });
    });
  });
}
function emailVal(url: string) {
  describe("with Email", () => {
    it("missing, should return 422", async () => {
      await request(app)
        .post(url)
        .send({
          name: authUserA.name,
          password: authUserA.password,
        })
        .then((response) => {
          expect(response.status).toBe(422);
          expect(response.body.errors[0].msg).toEqual("Email is required");
        });
    });
    it("missing @, should return 422", async () => {
      await request(app)
        .post(url)
        .send({
          name: authUserA.name,
          password: authUserA.password,
          email: "emailemail.com",
        })
        .then((response) => {
          expect(response.status).toBe(422);
          expect(response.body.errors[0].msg).toEqual("Invalid email format");
        });
    });
    it("missing .com, should return 422", async () => {
      await request(app)
        .post(url)
        .send({
          name: authUserA.name,
          password: authUserA.password,
          email: "email@email",
        })
        .then((response) => {
          expect(response.status).toBe(422);
          expect(response.body.errors[0].msg).toEqual("Invalid email format");
        });
    });
  });
}
function nameVal(url: string) {
  describe("with Name", () => {
    it("missing, should return 422", async () => {
      await request(app)
        .post(url)
        .send({
          email: authUserA.email,
          password: authUserA.password,
        })
        .then((response) => {
          expect(response.status).toBe(422);
          expect(response.body.errors[0].msg).toEqual(
            "Name must be at least 1 character long",
          );
        });
    });
  });
}

describe("access validation", () => {
  it("without access token, should return 400", async () => {
    const response = await request(app).get("/session");
    expect(response.status).toBe(401);
    expect(response.body.message).toEqual("No access token provided");
  });
  it("with invalid access token, should return 401", async () => {
    const response = await request(app)
      .get("/session")
      .set("Cookie", [`accessToken=${incorrectJWT}`]);
    expect(response.status).toBe(401);
    expect(response.body.message).toEqual("Invalid access token.");
  });
  it("with expired access token, should return 401", async () => {
    // create new user
    await agentA.post("/register").send({
      name: authUserA.name,
      email: authUserA.email,
      password: authUserA.password,
    });
    // login user to get id
    const user = await agentA.post("/login").send({
      email: authUserA.email,
      password: authUserA.password,
    });
    // create token that expires in 1ms
    const testId = user.body.data.id;
    const expiredJwt = jwt.sign({ testId }, key, {
      expiresIn: "1s",
    });
    const sleep = new Promise((resolve) => setTimeout(resolve, 2000));
    await sleep; // wait to ensure token is expired

    const response = await request(app)
      .get("/session/profile")
      .set("Cookie", [`accessToken=${expiredJwt}`]);
    expect(response.status).toBe(401);
    expect(response.body.message).toEqual(
      "Access token expired, please refresh.",
    );
  });
  it("with valid access token, should call next()", async () => {
    // create new user
    await agentA.post("/register").send({
      name: authUserA.name,
      email: authUserA.email,
      password: authUserA.password,
    });
    // login user to get tokens
    await agentA.post("/login").send({
      email: authUserA.email,
      password: authUserA.password,
    });
    const response = await agentA.get("/session/profile");
    expect(response.status).toBe(200);
  });
});

describe("register user", () => {
  passwordVal("/register");
  emailVal("/register");
  nameVal("/register");
  describe("with correct details ", () => {
    it("create userA and userB, should return 201 and user data", async () => {
      const responseA = await request(app).post("/register").send({
        name: authUserA.name,
        email: authUserA.email,
        password: authUserA.password,
      });
      expect(responseA.status).toBe(201);
      expect(responseA.body.data).toHaveProperty("id");
      expect(responseA.body.data).toHaveProperty("name", authUserA.name);
      expect(responseA.body.data).toHaveProperty("email", authUserA.email);
      expect(responseA.body.data).not.toHaveProperty("password");

      const responseB = await request(app).post("/register").send({
        name: authUserB.name,
        email: authUserB.email,
        password: authUserB.password,
      });
      expect(responseB.status).toBe(201);
      expect(responseB.body.data).toHaveProperty("id");
      expect(responseB.body.data).toHaveProperty("name", authUserB.name);
      expect(responseB.body.data).toHaveProperty("email", authUserB.email);
      expect(responseB.body.data).not.toHaveProperty("password");
    });
    it("create two user with the same userA credentials, should return 403", async () => {
      await agentA.post("/register").send({
        name: authUserA.name,
        email: authUserA.email,
        password: authUserA.password,
      });

      const response = await request(app).post("/register").send({
        name: authUserA.name,
        email: authUserA.email,
        password: authUserA.password,
      });
      expect(response.status).toBe(403);
      expect(response.body.message).toEqual(
        "An account with this Email already exists.",
      );
    });
    it("create two users at the same time, should return 201 for both users", async () => {
      const requests = [
        request(app).post("/register").send({
          name: authUserA.name,
          email: authUserA.email,
          password: authUserA.password,
        }),
        request(app).post("/register").send({
          name: authUserB.name,
          email: authUserB.email,
          password: authUserB.password,
        }),
      ];
      const responses = await Promise.all(requests);
      responses.forEach((res) => {
        expect(res.status).toBe(201);
        expect(res.body.data).toHaveProperty("id");
        expect(res.body.data).toHaveProperty("name");
        expect(res.body.data).toHaveProperty("email");
        expect(res.body.data).not.toHaveProperty("password");
      });
      // const responseA = await
    });
  });
});

describe("login user", () => {
  emailVal("/login");
  it("missing, should return 422", async () => {
    await request(app)
      .post("/login")
      .send({
        name: authUserA,
        email: authUserA.email,
      })
      .then((response) => {
        expect(response.status).toBe(422);
        expect(response.body.errors[0].msg).toEqual("Password is required");
      });
  });
  it("with invalid email, should return 401", async () => {
    await request(app).post("/register").send({
      name: authUserA.name,
      email: authUserA.email,
      password: authUserA.password,
    });
    const response = await request(app).post("/login").send({
      email: "wrong@email.com",
      password: authUserA.password,
    });
    expect(response.status).toBe(401);
    expect(response.body.message).toEqual(
      "Invalid email or password. Please try again",
    );
  });
  it("with invalid password, should return 401", async () => {
    await request(app).post("/register").send({
      name: authUserA.name,
      email: authUserA.email,
      password: authUserA.password,
    });
    const response = await request(app).post("/login").send({
      email: authUserA.email,
      password: "WrongPassword123!",
    });
    expect(response.status).toBe(401);
    expect(response.body.message).toEqual(
      "Invalid email or password. Please try again",
    );
  });
  it("with valid details, should return 200 and set cookie", async () => {
    await request(app).post("/register").send({
      name: authUserA.name,
      email: authUserA.email,
      password: authUserA.password,
    });
    const response = await request(app).post("/login").send({
      email: authUserA.email,
      password: authUserA.password,
    });
    const cookies = response.headers["set-cookie"];
    expect(cookies).toBeDefined();
    expect(cookies.length).toEqual(2);
    expect.stringMatching(/accessToken=/);
    // .then((response) => {
    //   expect(response.status).toBe(200);
    //   expect(response.headers).toHaveProperty("set-cookie");
    //   expect(response.headers["set-cookie"][0]).toMatch(/accessToken=/);
    //   expect(response.headers["set-cookie"][1]).toMatch(/refreshToken=/);
    // });
  });
});

describe("refresh access token", () => {
  it("without refresh token, should return 400", async () => {
    const response = await request(app).get("/refresh");
    expect(response.status).toBe(400);
    expect(response.body.message).toEqual("No refresh token provided");
  });
  it("random JWT refresh token, should return 401", async () => {
    const response = await request(app)
      .get("/refresh")
      .set("Cookie", [`refreshToken=${incorrectJWT}`]);
    expect(response.status).toBe(401);
    expect(response.body.message).toEqual("Invalid refresh token.");
  });
  it("with expired access token, should return 401", async () => {
    // create new user
    await agentA.post("/register").send({
      name: authUserA.name,
      email: authUserA.email,
      password: authUserA.password,
    });
    // login user to get id
    const user = await agentA.post("/login").send({
      email: authUserA.email,
      password: authUserA.password,
    });
    // create token that expires in 1ms
    const testId = user.body.data.id;
    const expiredJwt = jwt.sign({ testId }, key, {
      expiresIn: "1s",
    });
    const sleep = new Promise((resolve) => setTimeout(resolve, 2000));
    await sleep; // wait to ensure token is expired

    const response = await request(app)
      .get("/refresh")
      .set("Cookie", [`refreshToken=${expiredJwt}`]);
    expect(response.status).toBe(401);
    expect(response.body.message).toEqual(
      "Refresh token expired, please refresh.",
    );
  });
  it("with valid refresh token, should return 200 and set new access token", async () => {
    // create new user
    await agentA.post("/register").send({
      name: authUserA.name,
      email: authUserA.email,
      password: authUserA.password,
    });
    // login user to get tokens
    await agentA.post("/login").send({
      email: authUserA.email,
      password: authUserA.password,
    });
    const response = await agentA.get("/refresh");
    expect(response.status).toBe(200);
    const cookies = response.headers["set-cookie"];
    expect(cookies).toBeDefined();
    expect.stringMatching(/accessToken=/);
  });
});
