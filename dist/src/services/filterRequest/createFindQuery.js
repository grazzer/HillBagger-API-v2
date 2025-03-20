function createFindQuery(searchQuery, classificationQuery) {
    let findQuery = {};
    if (searchQuery) {
        Object.keys(searchQuery).forEach(function eachKey(key) {
            const k = key;
            const v = searchQuery[key];
            findQuery[k] = v;
        });
    }
    if (classificationQuery) {
        Object.keys(classificationQuery).forEach(function eachKey(key) {
            const k = key;
            const v = classificationQuery[key];
            findQuery[k] = v;
        });
    }
    return findQuery;
}
export { createFindQuery };
