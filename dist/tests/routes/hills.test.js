var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// tests/userController.test.ts
import request from "supertest";
import { app } from "../../src/app.js"; // Assuming app.ts initializes Express
describe("hills endpoint", () => {
    it("GET /hills/all should return a list of hills", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield request(app).get("/hills/all");
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
    }));
});
describe("hills endpoint classification", () => {
    it("GET /hills/munro should return a list of munro's", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield request(app).get("/hills/munro");
        expect(response.status).toBe(200);
        expect(response.body.every((currentValue) => currentValue.M == 1)).toBe(true);
    }));
    // it("GET /hills/Munro should return a list of munro's (unaffected by case)", async () => {
    //   const response: any = await request(app).get("/hills/munro");
    //   expect(response.status).toBe(200);
    //   expect(
    //     response.body.every((currentValue: any) => currentValue.M == 1)
    //   ).toBe(true);
    // });
    it("GET /hills/marilyn should return a list of munro's (unaffected by case)", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield request(app).get("/hills/marilyn");
        expect(response.status).toBe(200);
        expect(response.body.every((currentValue) => currentValue.Ma == 1)).toBe(true);
    }));
    it("GET /hills/hump should return a list of munro's (unaffected by case)", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield request(app).get("/hills/hump");
        expect(response.status).toBe(200);
        expect(response.body.every((currentValue) => currentValue.Hu == 1)).toBe(true);
    }));
    it("GET /hills/simm should return a list of munro's (unaffected by case)", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield request(app).get("/hills/simm");
        expect(response.status).toBe(200);
        expect(response.body.every((currentValue) => currentValue.Sim == 1)).toBe(true);
    }));
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
