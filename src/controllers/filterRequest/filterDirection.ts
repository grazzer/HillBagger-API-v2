function getDirection(directionQuery: any) {
  let direction: any = {};
  switch (directionQuery) {
    case "n1":
      direction = { Number: "asc" };
      break;
    case "n-1":
      direction = { Number: "desc" };
      break;
    case "a1":
      direction = { Name: "asc" };
      break;
    case "a-1":
      direction = { Name: "desc" };
      break;
    case "h1":
      direction = { Metres: "asc" };
      break;
    case "h-1":
      direction = { Metres: "desc" };
      break;
    case "l1":
      direction = { County: "asc" };
      break;
    case "l-1":
      direction = { County: "desc" };
      break;
    case "c1":
      direction = { Country: "asc" };
      break;
    case "c-1":
      direction = { Country: "desc" };
      break;
    case "t1":
      direction = { Classification: "asc" };
      break;
    case "t-1":
      direction = { Classification: "desc" };
      break;
    default:
      direction = { Number: "asc" };
      break;
  }
  return direction;
}

export { getDirection };
