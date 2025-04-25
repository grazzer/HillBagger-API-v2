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
            classification = { Ma: true };
            break;
        case "hump":
            classification = { Hu: true };
            break;
        case "simm":
            classification = { Sim: true };
            break;
        case "dodd":
            classification = { Dod: true };
            break;
        case "munro":
            classification = { M: true };
            break;
        case "munro_top":
            classification = { MT: true };
            break;
        case "furth":
            classification = { F: true };
            break;
        case "corbett":
            classification = { C: true };
            break;
        case "graham":
            classification = { G: true };
            break;
        case "donald":
            classification = { D: true };
            break;
        case "donald_top":
            classification = { DT: true };
            break;
        case "hewitt":
            classification = { Hew: true };
            break;
        case "nuttall":
            classification = { N: true };
            break;
        case "dewey":
            classification = { Dew: true };
            break;
        case "donald_dewey":
            classification = { DDew: true };
            break;
        case "highland_five":
            classification = { HF: true };
            break;
        case "zero":
            classification = { Zero: true };
            break;
        case "one":
            classification = { One: true };
            break;
        case "two":
            classification = { Two: true };
            break;
        case "three":
            classification = { Three: true };
            break;
        case "four":
            classification = { Four: true };
            break;
        case "wainwright":
            classification = { W: true };
            break;
        case "wainwright_outlying":
            classification = { WO: true };
            break;
        case "birkett":
            classification = { B: true };
            break;
        case "synge":
            classification = { Sy: true };
            break;
        case "fellranger":
            classification = { Fel: true };
            break;
        // case "ethel":
        //   classification = { E: true };
        //   break;
        case "county_top":
            classification = { CoU: true };
            break;
        case "london":
            classification = { CoL: true };
            break;
        case "islands_of_britain":
            classification = { SIB: true };
            break;
        case "dillon":
            classification = { Dil: true };
            break;
        case "arderin":
            classification = { A: true };
            break;
        case "vandeleur-lynam":
            classification = { VL: true };
            break;
        case "other":
            classification = { O: true };
            break;
        case "unclassified":
            classification = { Un: true };
            break;
        case "trump":
            classification = { Tu: true };
            break;
        case "murdo":
            classification = { Mur: true };
            break;
        case "corbett_top":
            classification = { CT: true };
            break;
        case "graham_top":
            classification = { GT: true };
            break;
        case "bridge":
            classification = { Bg: true };
            break;
        case "yeaman":
            classification = { Y: true };
            break;
        case "clem":
            classification = { Cm: true };
            break;
        case "carn":
            classification = { Ca: true };
            break;
        case "binnion":
            classification = { Bin: true };
            break;
        case "all":
            break;
        default:
            break;
    }
    return classification;
}
export { getClassification };
