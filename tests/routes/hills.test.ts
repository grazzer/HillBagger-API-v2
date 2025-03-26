// tests/userController.test.ts
import request from "supertest";
import { app } from "../../src/app.js"; // Assuming app.ts initializes Express

describe("hills endpoint", () => {
  it("GET /hills/all should return a list of hills", async () => {
    const response: any = await request(app).get("/hills/all");
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });
});

describe("hills endpoint classification", () => {
  it("GET /hills/munro should return a list of munro's", async () => {
    const response: any = await request(app).get("/hills/munro");
    expect(response.status).toBe(200);
    expect(
      response.body.every((currentValue: any) => currentValue.M == 1)
    ).toBe(true);
  });

  // it("GET /hills/Munro should return a list of munro's (unaffected by case)", async () => {
  //   const response: any = await request(app).get("/hills/munro");
  //   expect(response.status).toBe(200);
  //   expect(
  //     response.body.every((currentValue: any) => currentValue.M == 1)
  //   ).toBe(true);
  // });

  it("GET /hills/marilyn should return a list of munro's (unaffected by case)", async () => {
    const response: any = await request(app).get("/hills/marilyn");
    expect(response.status).toBe(200);
    expect(
      response.body.every((currentValue: any) => currentValue.Ma == 1)
    ).toBe(true);
  });
  it("GET /hills/hump should return a list of munro's (unaffected by case)", async () => {
    const response: any = await request(app).get("/hills/hump");
    expect(response.status).toBe(200);
    expect(
      response.body.every((currentValue: any) => currentValue.Hu == 1)
    ).toBe(true);
  });
  it("GET /hills/simm should return a list of munro's (unaffected by case)", async () => {
    const response: any = await request(app).get("/hills/simm");
    expect(response.status).toBe(200);
    expect(
      response.body.every((currentValue: any) => currentValue.Sim == 1)
    ).toBe(true);
  });

  // TODO: bad dataset need to refactor
  //   it("GET /hills/dodd should return a list of munro's (unaffected by case)", async () => {
  //     const response: any = await request(app).get("/hills/dodd");
  //     expect(response.status).toBe(200);
  //     expect(
  //       response.body.every((currentValue: any) => currentValue.5 == 1)
  //     ).toBe(true);
  //   });
});

// response.body.every((currentValue: any) =>  currentValue.Classification.includes("M"))

// response.body.every((currentValue: any) => currentValue.M = 1)
