function getSearch(SearchQuery) {
    if (SearchQuery) {
        const searchString = SearchQuery.split(" ").join("");
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
