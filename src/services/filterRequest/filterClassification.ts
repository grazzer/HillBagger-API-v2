function getClassification(classificationQuery: any) {
  let classification: any = {};
  switch (classificationQuery) {
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
      classification = { 5: 1 };
      break;
    case "munro":
      classification = { M: 1 };
      break;
    case "all":
      break;
    default:
      break;
  }
  return classification;
}

export { getClassification };

// Classification codes
// Ma	Marilyn
// Hu	Hump
// Sim	Simm
// 5	Dodd
// M	Munro
// MT	Munro Top
// F	Furth
// C	Corbett
// G	Graham
// D	Donald
// DT	Donald Top
// Hew	Hewitt
// N	Nuttall
// Dew	Dewey
// DDew	Donald Dewey
// HF	Highland Five
// 4	400-499m Tump
// 3	300-399m Tump (GB)
// 2	200-299m Tump (GB)
// 1	100-199m Tump (GB)
// 0	0-99m Tump (GB)
// W	Wainwright
// WO	Wainwright Outlying Fell
// B	Birkett
// Sy	Synge
// Fel	Fellranger
// E	Ethel
// CoH	County Top – Historic (pre-1974)
// CoA	County Top – Administrative (1974 to mid-1990s)
// CoU	County Top – Current County or Unitary Authority
// CoL	County Top – Current London Borough
// SIB	Significant Island of Britain
// Dil	Dillon
// A	Arderin
// VL	Vandeleur-Lynam
// O	Other list
// Un	unclassified
// prefixes
// s	sub
// x	deleted
// suffixes
// =	twin
// We identify deletions only for SMC lists, Grahams and Nuttalls. See Deleted Tops and Subs for details of these categories.

// Other searchable categories not shown in the classification field are as follows:

// Tu	Tump
// Mur	Murdo
// CT	Corbett Top
// GT	Graham Top
// B&L	Buxton & Lewis
// Bg	Bridge
// T100	Trail 100
// Y	Yeaman
// Cm	Clem
// Ca	Carn
// Bin	Binnion
