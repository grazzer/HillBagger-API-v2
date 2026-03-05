import request from "supertest";
import { app } from "../../src/app.js";
import type { Ascent } from "@prisma/client";
import { time } from "console";
import e from "express";
import { start } from "repl";

// End-to-end tests for /getAscent routes

const fakeID = "6808acb64466bb2759b4cc82"; // well-formed but non-existent

const testUser = {
  id: "",
  name: "GetAscent Tester",
  email: "getascent@test-email.com",
  password: "Password123!",
};

const ascentA: Partial<Ascent> = {
  id: "",
  date: new Date("2020-02-02T00:00:00Z"),
  hillID: "6808acb64466bb2759b4cc90",
  time: 3600,
  weather: "Sunny",
  distance: 5,
};
const ascentB: Partial<Ascent> = {
  id: "",
  date: new Date("2020-03-03T00:00:00Z"),
  hillID: "6808acb64466bb2759b4cc91",
};
const ascentC: Partial<Ascent> = {
  id: "",
  date: new Date("2020-04-04T00:00:00Z"),
  hillID: ascentB.hillID,
};

let agent = request.agent(app);

beforeAll(async () => {
  // register & login
  await agent.post("/register").send({
    name: testUser.name,
    email: testUser.email,
    password: testUser.password,
  });
  const res = await agent.post("/login").send({
    email: testUser.email,
    password: testUser.password,
  });
  testUser.id = res.body.data.id;

  // create ascents
  const r1: any = await agent.post("/session/ascent/create").send({
    date: ascentA.date,
    hillID: ascentA.hillID,
    time: ascentA.time,
    weather: ascentA.weather,
    distance: ascentA.distance,
  });
  ascentA.id = r1.body.data.id;

  const r2: any = await agent.post("/session/ascent/create").send({
    date: ascentB.date,
    hillID: ascentB.hillID,
  });
  ascentB.id = r2.body.data.id;

  const r3: any = await agent.post("/session/ascent/create").send({
    date: ascentC.date,
    hillID: ascentC.hillID,
  });
  ascentC.id = r3.body.data.id;
});

afterAll(async () => {
  // delete user (cascades to ascents)
  await agent.post("/login").send({
    email: testUser.email,
    password: testUser.password,
  });
  await agent.delete("/session/profile/deleteUser");
});

const iso = (d: Date) => d.toISOString();

describe("/getAscent routes - end-to-end", () => {
  describe("GET /getAscent/byId", () => {
    it("422 when ascentId missing", async () => {
      const res = await request(app).get("/getAscent/byId");
      expect(res.status).toBe(422);
    });
    it("422 when ascentId is not hexadecimal", async () => {
      const res = await request(app).get("/getAscent/byId").send({
        ascentId: 123,
      });
      expect(res.status).toBe(422);
    });
    it("422 when ascentId is not the correct length", async () => {
      const res = await request(app).get("/getAscent/byId").send({
        ascentId: "123",
      });
      expect(res.status).toBe(422);
    });
    it("404 when ascentId is well-formed but non-existent", async () => {
      const res = await request(app).get("/getAscent/byId").send({
        ascentId: fakeID,
      });
      expect(res.status).toBe(404);
    });
    it("200 and ascent data when ascentId is valid", async () => {
      const res = await request(app).get("/getAscent/byId").send({
        ascentId: ascentA.id,
      });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(res.body.data[0].id).toBe(ascentA.id);
      expect(res.body.data[0].hillID).toBe(ascentA.hillID);
      expect(iso(new Date(res.body.data[0].date))).toBe(iso(ascentA.date!));
      expect(res.body.data[0].time).toBe(ascentA.time);
      expect(res.body.data[0].weather).toBe(ascentA.weather);
      expect(res.body.data[0].distance).toBe(ascentA.distance);
      expect(res.body.data[0].notes).toBeUndefined();
      expect(res.body.data[0].photos).toBeUndefined();
      expect(res.body.data[0].nonUserGroupMembers).toBeUndefined();
      expect(res.body.data[0].pendingGroupMembersIDs).toBeUndefined();
      expect(res.body.data[0].groupMembersIDs).toBeUndefined();
      expect(res.body.data[0].requestedGroupMembersIDs).toBeUndefined();
    });
  });
  describe("GET /getAscent/", () => {
    it("422 when hillId, date, endDate, ands startDate missing", async () => {
      const res = await request(app).get("/getAscent/search");
      expect(res.status).toBe(422);
    });
    it("422 when hillId is not a hexadecimal", async () => {
      const res = await request(app).get("/getAscent/search").send({
        hillId: 123,
      });
      expect(res.status).toBe(422);
    });
    it("422 when hillId is not the correct length ", async () => {
      const res = await request(app).get("/getAscent/search").send({
        hillId: "123",
      });
      expect(res.status).toBe(422);
    });
    it("422 when date is not a date", async () => {
      const res = await request(app).get("/getAscent/search").send({
        Date: "123",
      });
      expect(res.status).toBe(422);
    });
    it("422 when date is not a iso", async () => {
      const res = await request(app).get("/getAscent/search").send({
        Date: "11/11/2025",
      });
      expect(res.status).toBe(422);
    });
    it("422 when startDate is not a date", async () => {
      const res = await request(app).get("/getAscent/search").send({
        startDate: "123",
      });
      expect(res.status).toBe(422);
    });
    it("422 when endDate is not a date", async () => {
      const res = await request(app).get("/getAscent/search").send({
        endDate: "123",
      });
      expect(res.status).toBe(422);
    });
    it("422 when endDate is a date but start date is not", async () => {
      const res = await request(app).get("/getAscent/search").send({
        startDate: "123",
        endDate: ascentA.date?.toISOString(),
      });
      expect(res.status).toBe(422);
    });
    it("422 when startDate and endDate are correct but hillId is not", async () => {
      const res = await request(app).get("/getAscent/search").send({
        hillId: "123",
        startDate: ascentA.date?.toISOString(),
        endDate: ascentA.date?.toISOString(),
      });
      expect(res.status).toBe(422);
    });
    it("422 when startDate and endDate are correct but hillId is not", async () => {
      const res = await request(app).get("/getAscent/search").send({
        hillId: "123",
        date: ascentA.date?.toISOString(),
      });
      expect(res.status).toBe(422);
    });
    it("422 when startDate and endDate are correct but hillId is not", async () => {
      const res = await request(app).get("/getAscent/search").send({
        hillId: ascentA.hillID,
        date: "123",
      });
      expect(res.status).toBe(422);
    });
    it("422 when date, startDate and endDate are correct", async () => {
      const res = await request(app).get("/getAscent/search").send({
        date: ascentB.date?.toISOString(),
        startDate: ascentA.date?.toISOString(),
        endDate: ascentB.date?.toISOString(),
      });
      expect(res.status).toBe(422);
    });

    it("200 and an empty array when date is correct but no ascents exist", async () => {
      const res = await request(app)
        .get("/getAscent/search")
        .send({
          hillId: ascentA.hillID,
          date: new Date("2025-03-01").toISOString(),
        });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.length).toBe(0);
    });
    it("200 and an empty array when date is correct but no ascents exist and an existing hillId", async () => {
      const res = await request(app)
        .get("/getAscent/search")
        .send({
          hillId: ascentA.hillID,
          date: new Date("2025-03-01").toISOString(),
        });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.length).toBe(0);
    });
    it("200 and an empty array when date is correct but no ascents exist", async () => {
      const res = await request(app).get("/getAscent/search").send({
        hillId: fakeID,
        date: ascentA.date?.toISOString(),
      });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.length).toBe(0);
    });
    it("200 and an empty array when date range is out of range", async () => {
      const res = await request(app)
        .get("/getAscent/search")
        .send({
          startDate: new Date("2024-03-01").toISOString(),
          endDate: new Date("2024-04-01").toISOString(),
        });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.length).toBe(0);
    });
    it("200 and an empty array when date range is out of range but hillId exists", async () => {
      const res = await request(app)
        .get("/getAscent/search")
        .send({
          hillId: ascentA.hillID,
          startDate: new Date("2024-03-01").toISOString(),
          endDate: new Date("2024-04-01").toISOString(),
        });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.length).toBe(0);
    });

    it("200 and an empty array when date range is in range but hillId is fake", async () => {
      const res = await request(app)
        .get("/getAscent/search")
        .send({
          hillId: fakeID,
          startDate: new Date("2025-03-01").toISOString(),
          endDate: new Date("2025-04-01").toISOString(),
        });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.length).toBe(0);
    });

    it("200 when date are correct", async () => {
      const res = await request(app).get("/getAscent/search").send({
        date: ascentA.date?.toISOString(),
      });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
      expect(res.body.message).toBe("Ascent successfully found");
    });
    it("200 when hillId is correct", async () => {
      const res = await request(app).get("/getAscent/search").send({
        hillId: ascentB.hillID,
      });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
      expect(res.body.message).toBe("Ascent successfully found");
    });
    it("200 when startDate and endDate are correct", async () => {
      const res = await request(app)
        .get("/getAscent/search")
        .send({
          startDate: new Date("2020-01-01").toISOString(),
          endDate: new Date("2020-03-01").toISOString(),
        });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
      expect(res.body.message).toBe("Ascent successfully found");
      for (const ascent of res.body.data) {
        const ascentDate = new Date(ascent.date);
        expect(ascentDate.getTime()).toBeGreaterThanOrEqual(
          new Date("2020-01-01").getTime(),
        );
        expect(ascentDate.getTime()).toBeLessThanOrEqual(
          new Date("2020-03-01").getTime(),
        );
      }
    });
    it("200 when hillId and date are correct", async () => {
      const res = await request(app).get("/getAscent/search").send({
        hillId: ascentB.hillID,
        date: ascentB.date?.toISOString(),
      });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
      expect(res.body.message).toBe("Ascent successfully found");
    });
    it("200 when hillId, startDate and endDate are correct", async () => {
      const res = await request(app)
        .get("/getAscent/search")
        .send({
          startDate: new Date("2020-01-01").toISOString(),
          endDate: new Date("2020-03-03").toISOString(),
        });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.length).toEqual(2);
      expect(res.body.message).toBe("Ascent successfully found");
      for (const ascent of res.body.data) {
        const ascentDate = new Date(ascent.date);
        expect(ascentDate.getTime()).toBeGreaterThanOrEqual(
          new Date("2020-01-01").getTime(),
        );
        expect(ascentDate.getTime()).toBeLessThanOrEqual(
          new Date("2020-03-03").getTime(),
        );
      }
    });
    it("200 when hillId, startDate and endDate are correct", async () => {
      const res = await request(app)
        .get("/getAscent/search")
        .send({
          startDate: new Date("2020-01-01").toISOString(),
          endDate: new Date("2021-01-01").toISOString(),
        });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.length).toEqual(3);
      expect(res.body.message).toBe("Ascent successfully found");
      for (const ascent of res.body.data) {
        const ascentDate = new Date(ascent.date);
        expect(ascentDate.getTime()).toBeGreaterThanOrEqual(
          new Date("2020-01-01").getTime(),
        );
        expect(ascentDate.getTime()).toBeLessThanOrEqual(
          new Date("2021-01-01").getTime(),
        );
      }
    });
    it("200 when hillId, startDate and endDate are correct", async () => {
      const res = await request(app)
        .get("/getAscent/search")
        .send({
          hillId: ascentB.hillID,
          startDate: new Date("2020-01-01").toISOString(),
          endDate: new Date("2021-01-01").toISOString(),
        });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.length).toEqual(2);
      expect(res.body.message).toBe("Ascent successfully found");
      for (const ascent of res.body.data) {
        expect(ascent.hillID).toBe(ascentB.hillID);
        const ascentDate = new Date(ascent.date);
        expect(ascentDate.getTime()).toBeGreaterThanOrEqual(
          new Date("2020-01-01").getTime(),
        );
        expect(ascentDate.getTime()).toBeLessThanOrEqual(
          new Date("2021-01-01").getTime(),
        );
      }
    });
  });
});
