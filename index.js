class Route {
  constructor() {
    this.distCost = [];
    this.costTotal = 0;
  }

  print() {
    let costTotal = 0;
    for (let i = 0; i < this.distCost.length; ++i) {
      this.distCost[i].print();
      costTotal += this.distCost[i].cost;
    }
    console.log(`Total cost: ${costTotal}`);
  }

  toString() {
    let s = "";
    for (let i = 0; i < this.distCost.length; ++i) {
      s += this.distCost[i].toString();
    }
    //console.log(`Total cost: ${this.costTotal}`);
    return `${s} : TOTAL: ${this.costTotal}`;
  }

  calcTotalCost() {
    this.costTotal = 0;
    for (let i = 0; i < this.distCost.length; ++i) {
      this.costTotal += this.distCost[i].cost;
    }
  }
}

class DistCost {
  constructor(idFrom, idTo, cost) {
    this.idFrom = idFrom;
    this.idTo = idTo;
    this.cost = cost;
  }

  print() {
    console.log(`${this.idFrom}>${this.idTo}: ${this.cost}`);
  }

  toString() {
    return `${this.idFrom}>${this.idTo} (${this.cost})   |`;
  }
}

class HamBox {
  constructor(id) {
    this.id = id;
    this.distCost = [];
  }
  addDistCost(distCost) {
    this.distCost.push(distCost);
  }
}

window.addEventListener("load", function() {
  console.log("Hambotic: ONLINE");

  let boxes = [
    new HamBox("A"),
    new HamBox("B"),
    new HamBox("C"),
    new HamBox("D")
    //new HamBox("E")
  ];
  let startId = "A";

  generateDistCosts(boxes);
  let routesString = getAllRouteCombinations(boxes);
  console.log(routesString);
  routesString = filterRoutesByStartId(routesString, startId);
  let routes = calcRoutes(boxes, routesString);
  //console.log(routes);

  let bestRoute;
  let bestCost = Infinity;
  for (let i = 0; i < routes.length; ++i) {
    routes[i].calcTotalCost();

    if (routes[i].costTotal < bestCost) {
      bestRoute = routes[i];
      bestCost = routes[i].costTotal;
    }
  }

  routes.sort(function(a, b) {
    return a.costTotal - b.costTotal;
  });

  for (let i = 0; i < routes.length; ++i) {
    routes[i].print();
  }

  printBoxDistances(boxes);
  printRoutes(routes);

  placeBoxInputElements(boxes);
});

function placeBoxInputElements(boxes) {
  boxes.forEach(element => {
    let eName = document.createElement("p");
    eName.innerHTML = `Box ${element.id}`;
    eName.className += "name";

    let eDiv = document.createElement("div");
    eDiv.className += `box-${element.id} box`;
    eDiv.appendChild(eName);
    for (let i = 0; i < boxes.length; ++i) {
      let eInput = document.createElement("input");
      eInput.setAttribute("placeholder", `To ${boxes[i].id}..`);
      eInput.setAttribute("type", "number");
      eInput.className += `dist from-${element.id} to-${boxes[i].id}`;

      if (element.id === boxes[i].id) {
        eInput.setAttribute("disabled", "true");
      } else {
        eInput.setAttribute(
          "value",
          `${getDistCost(element, element.id, boxes[i].id)}`
        );
      }

      eDiv.appendChild(eInput);
    }

    let container = document.getElementById("container");
    container.appendChild(eDiv);
  });
}

function generateDistCosts(boxes) {
  let box;
  let curDist;
  for (let i = 0; i < boxes.length; ++i) {
    box = boxes[i];
    for (let j = 0; j < boxes.length; ++j) {
      if (box.id !== boxes[j].id) {
        curDist = checkExistingDistCostBetweenBoxes(box, boxes[j]);

        //check to see if the distance between these 2 nodes has already been decided.
        //this check has been cancelled because the requirements mention:
        //"The cost for moving Hamotic between B -> A may not necessarily be the same as A -> B."
        if (false && curDist !== null) {
          box.addDistCost(new DistCost(box.id, boxes[j].id, curDist));
        } else {
          box.addDistCost(
            new DistCost(
              box.id,
              boxes[j].id,
              1 + Math.floor(Math.random() * 20)
            )
          );
        }
      }
    }
  }
}

function printRoutes(routes) {
  let output = document.getElementById("output");
  let node = document.createElement("ol");
  node.style.color = "red";
  let s = "";

  for (let i = 0; i < routes.length; ++i) {
    let li = document.createElement("li");
    let route = routes[i];
    s = route.toString();
    li.innerHTML = s;
    output.appendChild(li);
  }

  output.appendChild(node);
}

function printBoxDistances(boxes) {
  console.log(boxes);
  let output = document.getElementById("output");
  for (let i = 0; i < boxes.length; ++i) {
    let box = boxes[i];
    let node = document.createElement("h4");
    let s = ""; //`Box ${box.id}:`;
    for (let j = 0; j < box.distCost.length; ++j) {
      s += ` [${box.distCost[j].idFrom} -> ${box.distCost[j].idTo} = ${
        box.distCost[j].cost
      }]`;
    }

    node.innerHTML = s;
    output.appendChild(node);
  }
}

function filterRoutesByStartId(routesString, startId) {
  let routesNew = [];

  routesString.forEach(element => {
    if (element[0] === startId) {
      routesNew.push(element);
    }
  });
  return routesNew;
}

function getAllRouteCombinations(boxes, startId) {
  let idCollection = [];

  boxes.forEach(element => {
    //if (element.id === startId) {
    idCollection.push(element.id);
    //}
  });

  return combo(idCollection);
}

function calcRoutes(boxes, routesString) {
  let routes = [];
  for (let i = 0; i < routesString.length; ++i) {
    let cost = 0;
    routes[i] = new Route();
    for (let j = 0; j < routesString[i].length; ++j) {
      if (j > 0) {
        let box1 = getBoxById(boxes, routesString[i][j - 1]);
        cost += getDistCost(box1, routesString[i][j - 1], routesString[i][j]);
        routes[i].distCost.push(
          getDistCostAsDistCost(
            box1,
            routesString[i][j - 1],
            routesString[i][j]
          )
        );
        //console.log(getDistCostString(box1, routes[i][j - 1], routes[i][j]));
      }
    }

    //add the return cost to first point
    let box1 = getBoxById(boxes, routesString[i][routesString[i].length - 1]);
    cost += getDistCost(
      box1,
      routesString[i][routesString[i].length - 1],
      routesString[i][0]
    );
    routes[i].distCost.push(
      getDistCostAsDistCost(
        box1,
        routesString[i][routesString[i].length - 1],
        routesString[i][0]
      )
    );
    //console.log(
    //  getDistCostString(box1, routes[i][routes[i].length - 1], routes[i][0])
    //);

    //console.log(`${routesString[i]}: ${cost}`);
  }

  return routes;
}

function getBoxById(boxes, id) {
  for (let i = 0; i < boxes.length; ++i) {
    if (boxes[i].id === id) {
      return boxes[i];
    }
  }
  return null;
}

function getDistCost(box, from, to) {
  for (let i = 0; i < box.distCost.length; ++i) {
    if (box.distCost[i].idFrom === from && box.distCost[i].idTo === to) {
      return box.distCost[i].cost;
    }
  }
  return null;
}

function getDistCostAsDistCost(box, from, to) {
  for (let i = 0; i < box.distCost.length; ++i) {
    if (box.distCost[i].idFrom === from && box.distCost[i].idTo === to) {
      //return `${from}->${to}: ${box.distCost[i].cost}`;
      return new DistCost(from, to, box.distCost[i].cost);
    }
  }
  return null;
}

function checkExistingDistCostBetweenBoxes(box1, box2) {
  let boxId1 = box1.id;
  let boxId2 = box2.id;
  for (let i = 0; i < box1.distCost.length; ++i) {
    if (box1.distCost[i].idTo === boxId2) {
      return box1.distCost[i].cost;
    }
  }
  for (let i = 0; i < box2.distCost.length; ++i) {
    if (box2.distCost[i].idTo === boxId1) {
      return box2.distCost[i].cost;
    }
  }

  return null;
}

//https://stackoverflow.com/questions/40654895/javascript-generating-all-combinations-of-an-array-considering-the-order
//Author: Keith
/*
combo() takes an array and returns a 2D array containing all possible sequences.
*/
function combo(c) {
  var r = [],
    len = c.length;
  tmp = [];
  function nodup() {
    var got = {};
    for (var l = 0; l < tmp.length; l++) {
      if (got[tmp[l]]) return false;
      got[tmp[l]] = true;
    }
    return true;
  }
  function iter(col, done) {
    var l, rr;
    if (col === len) {
      if (nodup()) {
        rr = [];
        for (l = 0; l < tmp.length; l++) rr.push(c[tmp[l]]);
        r.push(rr);
      }
    } else {
      for (l = 0; l < len; l++) {
        tmp[col] = l;
        iter(col + 1);
      }
    }
  }
  iter(0);
  return r;
}
