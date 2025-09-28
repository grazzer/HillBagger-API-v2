import request from "supertest";
import { app } from "../../src/app.js";

//Integration tests for the hills endpoint

// Test if database is responding
describe("hills endpoint", () => {
  it("GET /hills/all should return a list of hills", async () => {
    const response: any = await request(app).get("/hills/all");
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.hills)).toBe(true);
  });
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
        const response: any = await request(app).get("/hills/" + input[0]);
        expect(response.status).toBe(200);
        expect(
          response.body.hills.every(
            (currentValue: any) => currentValue[input[1]] == true
          )
        ).toBe(true);
      }
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
        const response: any = await request(app).get("/hills/" + input[0]);
        expect(response.status).toBe(200);
        expect(
          response.body.hills.every(
            (currentValue: any) => currentValue.Country == input[1]
          )
        ).toBe(true);
      }
    );
  });
});

// test each classification default and incorrect query for their correct filtering of the data
describe("hills endpoint classification - default", () => {
  it("GET /hills/RandomString should return a list of all hills", async () => {
    const response: any = await request(app).get("/hills/RandomString");
    expect(response.status).toBe(200);
    let list: any[] = [];
    response.body.hills.forEach((object: any) => {
      list.push(object.Number);
    });
    expect(isAscending(list)).toBe(true);
  });
  it("GET /hills/all should return a list of all hills", async () => {
    const response: any = await request(app).get("/hills/all");
    expect(response.status).toBe(200);
    let list: any[] = [];
    response.body.hills.forEach((object: any) => {
      list.push(object.Number);
    });
    expect(isAscending(list)).toBe(true);
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
        const response: any = await request(app).get(
          "/hills/all?d=" + input[1]
        );
        expect(response.status).toBe(200);
        expect(checkDirectionInt(response.body.hills, input)).toBe(true);
      }
    );
  });
});

// test default direction for correct ordering of the data
describe("hills endpoint classification - default", () => {
  it("GET /hills/all?d='RandomString' should return a list of all hills ordered by number", async () => {
    const response: any = await request(app).get("/hills/all?d=randomString");
    expect(response.status).toBe(200);
    let list: any[] = [];
    response.body.hills.forEach((object: any) => {
      list.push(object.Number);
    });
    expect(isAscending(list)).toBe(true);
  });
});

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

// functions to determine order

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
      "GET /hills/all?s=" +
        input +
        " should return a list of hills where either the Name or county contain " +
        input,
      async () => {
        const response: any = await request(app).get("/hills/all?s=" + input);
        expect(response.status).toBe(200);
        expect(response.body.hills.length > 0).toBe(true);
        expect(
          response.body.hills.every(
            (currentValue: any) =>
              currentValue.Name_Searchable.includes(
                input.toLowerCase().split(" ").join("")
              ) ||
              currentValue.County_Searchable.includes(
                input.toLowerCase().split(" ").join("")
              )
          )
        ).toBe(true);
      }
    );
  });
  it("GET /hills/all?s=1 should return a list of hills where the number contains 1", async () => {
    const response: any = await request(app).get("/hills/all?s=1");
    expect(response.status).toBe(200);
    expect(response.body.hills.length > 0).toBe(true);
    expect(
      response.body.hills.every((currentValue: any) =>
        currentValue.Number_Searchable.includes(1)
      )
    ).toBe(true);
  });
  it("GET /hills/all?s=1a should return an empty list of hills", async () => {
    const response: any = await request(app).get("/hills/all?s=1a");
    expect(response.status).toBe(200);
    expect(response.body.hills.length).toBe(0);
  });
});

// test that the pagination parameter returns the correct section of results
//TODO: change 20 value to variable if needed
describe("hills endpoint pagination", () => {
  const searchList = [0, 1, 5, 400];
  searchList.forEach((input) => {
    it(
      "GET /hills/all?p=" +
        input +
        " should return a list of hills beginning with hill number" +
        input * 20,
      async () => {
        const response: any = await request(app).get("/hills/all?p=" + input);
        expect(response.status).toBe(200);
        expect(response.body.hills.length > 0).toBe(true);
        expect(response.body.hills[0].Number).toBe(input * 20 + 1);
      }
    );
  });
});

// requires change to classification, maybe.
describe("hills by ID endpoint ", () => {
  it("GET /hills/'ID' should return a list of hills", async () => {
    const response: any = await request(app).get("/hills/all");
    expect(response.status).toBe(200);
    expect(response.body.hills.length == 1).toBe(true);
    expect(response.body.hills.length).toBe(1);
    expect(response.body.hills[0].name == "Ben Nevis [Beinn Nibheis]").toBe(
      true
    );
    expect(response.body.hills[0].name).toBe("Ben Nevis [Beinn Nibheis]");
  });
});
