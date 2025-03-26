module.exports = {
    //... // your previous configurations
    extensionsToTreatAsEsm: [".ts"],
    globals: {
        "ts-jest": {
            //... // your other configurations here
            useESM: true,
        },
    },
    moduleNameMapper: {
        "^(\\.{1,2}/.*)\\.js$": "$1",
    },
    preset: "ts-jest",
    testEnvironment: "node",
    testMatch: ["**/tests/**/*.test.ts"], // Only test files inside `tests/` folder
};
export {};
