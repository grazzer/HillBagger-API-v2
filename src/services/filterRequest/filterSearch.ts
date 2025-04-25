function getSearch(SearchQuery: string) {
  if (SearchQuery) {
    const searchString: string = SearchQuery.split(" ").join("");
    return {
      OR: [
        { Name_Searchable: { contains: searchString.toLowerCase() } },
        { County_Searchable: { contains: searchString.toLowerCase() } },
        { Number_Searchable: { contains: searchString } },
      ],
    };
  }
}

export { getSearch };
