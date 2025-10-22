function createFindQuery(searchQuery: any, classificationQuery: any) {
  let findQuery: any = {};
  if (searchQuery) {
    Object.keys(searchQuery).forEach(function eachKey(key) {
      const k: string = key;
      const v: any = searchQuery[key];
      findQuery[k] = v;
    });
  }
  if (classificationQuery) {
    Object.keys(classificationQuery).forEach(function eachKey(key) {
      const k: string = key;
      const v: any = classificationQuery[key];
      findQuery[k] = v;
    });
  }
  return findQuery;
}

export { createFindQuery };
