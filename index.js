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

  let boxes = [new HamBox("A"), new HamBox("B"), new HamBox("C")];
  generateDistCosts(boxes);
  printRoutes(boxes);
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
            new DistCost(box.id, boxes[j].id, Math.floor(Math.random() * 100))
          );
        }
      }
    }
  }
}

function printRoutes(boxes) {
  console.log(boxes);
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
