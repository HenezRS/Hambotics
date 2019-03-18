class DistCost {
  constructor(idFrom, idTo, cost) {
    this.idFrom = idFrom;
    this.idTo = idTo;
    this.cost = cost;
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
  ];
  generateDistCosts(boxes);
  printRoutes(boxes);
  let routes = getAllRouteCombinations(boxes);
  calcRoutes(boxes, routes);
});

function generateDistCosts(boxes) {
  let box;
  let curDist;
  for (let i = 0; i < boxes.length; ++i) {
    box = boxes[i];
    for (let j = 0; j < boxes.length; ++j) {
      if (box.id !== boxes[j].id) {
        curDist = checkExistingDistCostBetweenBoxes(box, boxes[j]);
        if (curDist !== null) {
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

function printRoutes(boxes) {
  console.log(boxes);
  let main = document.getElementById("main");
  for (let i = 0; i < boxes.length; ++i) {
    let box = boxes[i];
    let node = document.createElement("p");
    let s = ""; //`Box ${box.id}:`;
    for (let j = 0; j < box.distCost.length; ++j) {
      s += ` [${box.distCost[j].idFrom} -> ${box.distCost[j].idTo} = ${
        box.distCost[j].cost
      }]`;
    }

    node.innerHTML = s;
    main.appendChild(node);
  }
}

function getAllRouteCombinations(boxes) {
  let idCollection = [];

  boxes.forEach(element => {
    idCollection.push(element.id);
  });

  return combo(idCollection);
}

function calcRoutes(boxes, routes) {
  for (let i = 0; i < routes.length; ++i) {
    let cost = 0;
    for (let j = 0; j < routes[i].length; ++j) {
      if (j > 0) {
        let box1 = getBoxById(boxes, routes[i][j - 1]);
        cost += getDistCost(box1, routes[i][j - 1], routes[i][j]);
        console.log(getDistCostString(box1, routes[i][j - 1], routes[i][j]));
      }
    }

    //add the return cost to first point
    let box1 = getBoxById(boxes, routes[i][routes[i].length - 1]);
    cost += getDistCost(box1, routes[i][routes[i].length - 1], routes[i][0]);
    console.log(
      getDistCostString(box1, routes[i][routes[i].length - 1], routes[i][0])
    );

    console.log(`${routes[i]}: ${cost}`);
  }
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

function getDistCostString(box, from, to) {
  for (let i = 0; i < box.distCost.length; ++i) {
    if (box.distCost[i].idFrom === from && box.distCost[i].idTo === to) {
      return `${from}->${to}: ${box.distCost[i].cost}`;
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
