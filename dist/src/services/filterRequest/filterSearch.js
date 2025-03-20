function getSearch(SearchQuery) {
    if (SearchQuery) {
        const searchString = SearchQuery.replace(/\s/g, "");
        if (/^[A-Za-z]+$/.test(searchString)) {
            return {
                $or: [
                    { Name: { $regex: SearchQuery } },
                    { County: { $regex: SearchQuery } },
                ],
            };
        }
        else if (/^\d+$/.test(searchString)) {
            let searchNumbers = parseInt(searchString);
            return { Number: searchNumbers };
        }
        else {
            console.log("mix of numbers and letters");
            // TODO: error needed ?
        }
    }
    return;
}
export { getSearch };
