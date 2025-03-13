function getDirection(req, res, next) {
  switch (req.query.d) {
    case "n1":
      req.query.direction = { Number: 1 };
      break;
    case "n-1":
      req.query.direction = { Number: -1 };
      break;
    case "a1":
      req.query.direction = { Name: 1 };
      break;
    case "a-1":
      req.query.direction = { Name: -1 };
      break;
    case "h1":
      req.query.direction = { Metres: -1 };
      break;
    case "h-1":
      req.query.direction = { Metres: 1 };
      break;
    case "l1":
      req.query.direction = { County: 1 };
      break;
    case "l-1":
      req.query.direction = { County: -1 };
      break;
    case "c1":
      req.query.direction = { Country: 1 };
      break;
    case "c-1":
      req.query.direction = { Country: -1 };
      break;
    case "t1":
      req.query.direction = { Classification: 1 };
      break;
    case "t-1":
      req.query.direction = { Classification: -1 };
      break;
    default:
      req.query.direction = { Number: 1 };
      break;
  }
  next();
  return;
}

module.exports = { getDirection };
