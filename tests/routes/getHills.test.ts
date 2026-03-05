import request from "supertest";
import { app } from "../../src/app.js";

// helper functions to determine order
function isAscending(arr: number[]) {
  return arr.every(function (x, i) {
    return i === 0 || x >= arr[i - 1];
  });
}
function isDescending(arr: number[]) {
  return arr.every(function (x, i) {
    return i === 0 || x <= arr[i - 1];
  });
}
function isAlphabetic(arr: string[]) {
  let sortedList = arr.sort();
  return sortedList == arr;
}
function isReverseAlphabetic(arr: string[]) {
  let sortedList = arr.sort();
  sortedList = sortedList.reverse();
  return sortedList == arr;
}

function checkDirectionInt(array: [], input: string[]) {
  let list: any[] = [];
  array.forEach((object: any) => {
    list.push(object[input[0]]);
  });
  if (input[2] == "asc") {
    if (input[3] == "num") {
      return isAscending(list);
    }
    if (input[3] == "str") {
      return isAlphabetic(list);
    }
  }
  if (input[2] == "desc") {
    if (input[3] == "num") {
      return isDescending(list);
    }
    if (input[3] == "str") {
      return isReverseAlphabetic(list);
    }
  } else {
    return false;
  }
}

//Integration tests for the /hills/search endpoint

// vallidation tests for the query parameters
describe("hills endpoint validation", () => {
  it("where classification is an int", async () => {
    const response: any = await request(app)
      .get("/hills/search")
      .send({ classification: 1 });
    expect(response.status).toBe(422);
  });
  it("where classification is a bool", async () => {
    const response: any = await request(app)
      .get("/hills/search")
      .send({ classification: true });
    expect(response.status).toBe(422);
  });
  it("where direction is an int", async () => {
    const response: any = await request(app)
      .get("/hills/search")
      .send({ direction: 1 });
    expect(response.status).toBe(422);
  });
  it("where direction is a bool", async () => {
    const response: any = await request(app)
      .get("/hills/search")
      .send({ direction: true });
    expect(response.status).toBe(422);
  });
  it("where search is an int", async () => {
    const response: any = await request(app)
      .get("/hills/search")
      .send({ search: 1 });
    expect(response.status).toBe(422);
  });
  it("where search is a bool", async () => {
    const response: any = await request(app)
      .get("/hills/search")
      .send({ search: false });
    expect(response.status).toBe(422);
  });
  it("where search is a negative int ", async () => {
    const response: any = await request(app)
      .get("/hills/search")
      .send({ pagination: -1 });
    expect(response.status).toBe(422);
  });
  it("where search is a string", async () => {
    const response: any = await request(app)
      .get("/hills/search")
      .send({ pagination: "20" });
    expect(response.status).toBe(200);
  });
  it("where search is a string", async () => {
    const response: any = await request(app)
      .get("/hills/search")
      .send({ pagination: "ten" });
    expect(response.status).toBe(422);
  });
  it("where search is a bool", async () => {
    const response: any = await request(app)
      .get("/hills/search")
      .send({ pagination: false });
    expect(response.status).toBe(422);
  });
});

// Test basic response and data structure
it("GET /hills/all should return a list of hills", async () => {
  const response = await request(app).get("/hills/search");
  expect(response.status).toBe(200);
  expect(Array.isArray(response.body.data.hills)).toBe(true);
  expect(response.body.data.hills.length).toBe(20);
  expect(response.body.data.count).toBe(21291);
  let list: any[] = [];
  response.body.data.hills.forEach((object: any) => {
    list.push(object.Number);
  });
  expect(isAscending(list)).toBe(true);
});

// test each classification for their correct filtering of the data
describe("hills endpoint classification - type", () => {
  const classList = [
    ["marilyn", "Ma"],
    ["hump", "Hu"],
    ["simm", "Sim"],
    ["dodd", "Dod"],
    ["munro", "M"],
    ["Munro", "M"],
    ["munro_top", "MT"],
    ["furth", "F"],
    ["corbett", "C"],
    ["graham", "G"],
    ["donald", "D"],
    ["donald_top", "DT"],
    ["hewitt", "Hew"],
    ["nuttall", "N"],
    ["dewey", "Dew"],
    ["donald_dewey", "DDew"],
    ["highland_five", "HF"],
    //trump_400-499
    ["four", "Four"],
    //trump 300-399
    ["three", "Three"],
    //trump 200-299
    ["two", "Two"],
    //trump 100-199
    ["one", "One"],
    //trump 0-99
    ["zero", "Zero"],
    ["wainwright", "W"],
    ["wainwright_outlying", "WO"],
    ["birkett", "B"],
    ["synge", "Sy"],
    ["fellranger", "Fel"],
    ["county_top", "CoU"],
    ["london", "CoL"],
    ["islands_of_britain", "SIB"],
    ["dillon", "Dil"],
    ["arderin", "A"],
    ["vandeleur-lynam", "VL"],
    ["other", "O"],
    ["unclassified", "Un"],
    ["trump", "Tu"],
    ["murdo", "Mur"],
    ["corbett_top", "CT"],
    ["graham_top", "GT"],
    ["bridge", "Bg"],
    ["yeaman", "Y"],
    ["clem", "Cm"],
    ["binnion", "Bin"],
  ];

  classList.forEach((input) => {
    it(
      "GET /hills/" +
        input[0] +
        " should return a list of " +
        input[0] +
        " hills",
      async () => {
        const response: any = await request(app)
          .get("/hills/search")
          .send({ classification: input[0] });
        expect(response.status).toBe(200);
        expect(
          response.body.data.hills.every(
            (currentValue: any) => currentValue[input[1]] == true,
          ),
        ).toBe(true);
      },
    );
  });
});

// test each country for their correct filtering of the data
describe("hills endpoint classification - country", () => {
  const classList = [
    ["scotland", "S"],
    ["england", "E"],
    ["wales", "W"],
    ["ireland", "I"],
    ["isle_of_man", "M"],
    ["channel_islands", "C"],
    ["england_scotland_border", "ES"],
  ];

  classList.forEach((input) => {
    it(
      "GET /hills/" +
        input[0] +
        " should return a list of " +
        input[0] +
        " hills",
      async () => {
        const response: any = await request(app)
          .get("/hills/search")
          .send({ classification: input[0] });
        expect(response.status).toBe(200);
        expect(
          response.body.data.hills.every(
            (currentValue: any) => currentValue.Country == input[1],
          ),
        ).toBe(true);
      },
    );
  });
});

// test that an incorrect classification returns all hills ordered by number
describe("hills endpoint classification ", () => {
  it("with incorrect classification should return a list of all hills", async () => {
    const response: any = await request(app)
      .get("/hills/search")
      .send({ classification: "ARandomString" });
    expect(response.status).toBe(200);
    let list: any[] = [];
    response.body.data.hills.forEach((object: any) => {
      list.push(object.Number);
    });
    expect(isAscending(list)).toBe(true);
    expect(response.body.data.hills.length).toBe(20);
    expect(response.body.data.count).toBe(21291);
  });
});

// test each direction option for their correct ordering of the data
describe("hills endpoint direction", () => {
  const directionList = [
    //numerical
    ["Number", "n1", "asc", "num"],
    ["Number", "n-1", "desc", "num"],
    ["Metres", "h1", "asc", "num"],
    ["Metres", "h-1", "desc", "num"],
    // alphabetic
    ["Name", "a1", "asc", "str"],
    ["Name", "a-1", "desc", "str"],
    ["County", "l1", "asc", "str"],
    ["County", "l-1", "desc", "str"],
    ["Country", "c1", "asc", "str"],
    ["Country", "c-1", "desc", "str"],
    ["Classification", "t1", "asc", "str"],
    ["Classification", "t-1", "desc", "str"],
  ];

  directionList.forEach((input) => {
    it(
      "GET /hills/all?d=" +
        input[1] +
        " should return a list of hills " +
        input[2] +
        " by " +
        input[0],
      async () => {
        const response: any = await request(app)
          .get("/hills/search")
          .send({ direction: input[1] });
        expect(response.status).toBe(200);
        expect(checkDirectionInt(response.body.data.hills, input)).toBe(true);
        expect(response.body.data.hills.length).toBe(20);
        expect(response.body.data.count).toBe(21291);
      },
    );
  });
});

// test incorrect direction for correct ordering of the data
describe("hills endpoint direction ", () => {
  it("with incorrect direction should return a list of all hills ordered by number", async () => {
    const response: any = await request(app)
      .get("/hills/search")
      .send({ direction: "g-1" });
    expect(response.status).toBe(200);
    let list: any[] = [];
    response.body.data.hills.forEach((object: any) => {
      list.push(object.Number);
    });
    expect(isAscending(list)).toBe(true);
    expect(response.body.data.hills.length).toBe(20);
    expect(response.body.data.count).toBe(21291);
  });
});

// test that the Name and County attributes contain the search parameter
describe("hills endpoint search", () => {
  const searchList = [
    "Lom",
    "l O m",
    "Ben Chonzie",
    "ben chonzie",
    "benchonzie",
    "Aberdeenshire",
    "aberdeenshire",
    "aberd eenshire",
    "",
  ];
  searchList.forEach((input) => {
    it(
      "GET /hills/search" +
        input +
        " should return a list of hills where either the Name or county contain " +
        input,
      async () => {
        const response: any = await request(app)
          .get("/hills/search")
          .send({ search: input });
        expect(response.status).toBe(200);
        expect(response.body.data.hills.length > 0).toBe(true);
        expect(
          response.body.data.hills.every(
            (currentValue: any) =>
              currentValue.Name_Searchable.includes(
                input.toLowerCase().split(" ").join(""),
              ) ||
              currentValue.County_Searchable.includes(
                input.toLowerCase().split(" ").join(""),
              ),
          ),
        ).toBe(true);
      },
    );
  });
  it("GET /hills/all?s=1 should return a list of hills where the number contains 1", async () => {
    const response: any = await request(app)
      .get("/hills/search")
      .send({ search: "notARealHill" });
    expect(response.status).toBe(200);
    expect(response.body.data.hills.length).toBe(0);
  });
  it("GET /hills/all?s=1 should return a list of hills where the number contains 1", async () => {
    const response: any = await request(app)
      .get("/hills/search")
      .send({ search: "1" });
    expect(response.status).toBe(200);
    expect(response.body.data.hills.length > 0).toBe(true);
    expect(
      response.body.data.hills.every((currentValue: any) =>
        currentValue.Number_Searchable.includes(1),
      ),
    ).toBe(true);
  });
  it("GET /hills/all?s=1 should return a list of hills where the number contains 1", async () => {
    const response: any = await request(app)
      .get("/hills/search")
      .send({ search: "123" });
    expect(response.status).toBe(200);
    expect(response.body.data.hills.length > 0).toBe(true);
    expect(
      response.body.data.hills.every((currentValue: any) =>
        currentValue.Number_Searchable.includes(123),
      ),
    ).toBe(true);
  });
  it("GET /hills/all?s=1a should return an empty list of hills", async () => {
    const response: any = await request(app)
      .get("/hills/search")
      .send({ search: "1a" });
    expect(response.status).toBe(200);
    expect(response.body.data.hills.length).toBe(0);
  });
});

// test that the pagination parameter returns the correct section of results
describe("hills endpoint pagination", () => {
  const searchList = [0, 1, 5, 400, "10"];
  searchList.forEach((input) => {
    it(
      "GET /hills/all?p=" +
        input +
        " should return a list of hills beginning with hill number" +
        Number(input) * 20,
      async () => {
        const response: any = await request(app)
          .get("/hills/search")
          .send({ pagination: input });
        expect(response.status).toBe(200);
        expect(response.body.data.hills.length > 0).toBe(true);
        expect(response.body.data.hills[0].Number).toBe(Number(input) * 20 + 1);
      },
    );
  });
  it("when the pagination number exceeds the number of hills should return an empty list", async () => {
    const response: any = await request(app)
      .get("/hills/search")
      .send({ pagination: 2000 });
    expect(response.status).toBe(200);
    expect(response.body.data.hills.length).toBe(0);
  });
});
