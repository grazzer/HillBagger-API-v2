function getClassification(classificationQuery) {
    let classification = {};
    switch (classificationQuery.toLowerCase()) {
        // search by country
        case "scotland":
            classification = { Country: "S" };
            break;
        case "england":
            classification = { Country: "E" };
            break;
        case "wales":
            classification = { Country: "W" };
            break;
        case "ireland":
            classification = { Country: "I" };
            break;
        case "isle_of_man":
            classification = { Country: "M" };
            break;
        case "channel_islands":
            classification = { Country: "C" };
            break;
        case "england_scotland_border":
            classification = { Country: "ES" };
            break;
        // search by classification
        case "marilyn":
            classification = { Ma: 1 };
            break;
        case "hump":
            classification = { Hu: 1 };
            break;
        case "simm":
            classification = { Sim: 1 };
            break;
        case "dodd":
            classification = { Dod: 1 };
            break;
        case "munro":
            classification = { M: 1 };
            break;
        case "munro_top":
            classification = { MT: 1 };
            break;
        case "furth":
            classification = { F: 1 };
            break;
        case "corbett":
            classification = { C: 1 };
            break;
        case "graham":
            classification = { G: 1 };
            break;
        case "donald":
            classification = { D: 1 };
            break;
        case "donald_top":
            classification = { DT: 1 };
            break;
        case "hewitt":
            classification = { Hew: 1 };
            break;
        case "nuttall":
            classification = { N: 1 };
            break;
        case "dewey":
            classification = { Dew: 1 };
            break;
        case "donald_dewey":
            classification = { DDew: 1 };
            break;
        case "highland_five":
            classification = { HF: 1 };
            break;
        case "zero":
            classification = { Zero: 1 };
            break;
        case "one":
            classification = { One: 1 };
            break;
        case "two":
            classification = { Two: 1 };
            break;
        case "three":
            classification = { Three: 1 };
            break;
        case "four":
            classification = { Four: 1 };
            break;
        case "wainwright":
            classification = { W: 1 };
            break;
        case "wainwright_outlying":
            classification = { WO: 1 };
            break;
        case "birkett":
            classification = { B: 1 };
            break;
        case "synge":
            classification = { Sy: 1 };
            break;
        case "fellranger":
            classification = { Fel: 1 };
            break;
        // case "ethel":
        //   classification = { E: 1 };
        //   break;
        case "county_top":
            classification = { CoU: 1 };
            break;
        case "london":
            classification = { CoL: 1 };
            break;
        case "islands_of_britain":
            classification = { SIB: 1 };
            break;
        case "dillon":
            classification = { Dil: 1 };
            break;
        case "arderin":
            classification = { A: 1 };
            break;
        case "vandeleur-lynam":
            classification = { VL: 1 };
            break;
        case "other":
            classification = { O: 1 };
            break;
        case "unclassified":
            classification = { Un: 1 };
            break;
        case "trump":
            classification = { Tu: 1 };
            break;
        case "murdo":
            classification = { Mur: 1 };
            break;
        case "corbett_top":
            classification = { CT: 1 };
            break;
        case "graham_top":
            classification = { GT: 1 };
            break;
        case "bridge":
            classification = { Bg: 1 };
            break;
        case "yeaman":
            classification = { Y: 1 };
            break;
        case "clem":
            classification = { Cm: 1 };
            break;
        case "carn":
            classification = { Ca: 1 };
            break;
        case "binnion":
            classification = { Bin: 1 };
            break;
        case "all":
            break;
        default:
            break;
    }
    return classification;
}
export { getClassification };
