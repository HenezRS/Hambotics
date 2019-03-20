/*
--- H A M B O T I C S --- Author: Henry Saal

Special Thanks: combo() function from StackOverflow user Keith.

--- HOW TO USE ---
Most controls are in the html DOM.
- On first load: 
    ~ There will be 4 boxes (starting bay 'A', box 'B', box 'C' and box 'D')
    ~ Each distance cost will be randomly filled with a value 1 to 20
    ~ By default, the top 5 quickest routes will be listed. Changed by 'Limit Top Results' field
- Change distance costs between boxes by filling the appropriate text fields.
- Use 'Recalculate' button to take the new inputs and print out the correct "Shortest Routes"
- Use 'Random All' button to automatically fill each DistCost
- Use 'Add Box' and 'Remove Box' to manipulate the number of boxes.
    ~ There can't be less than 2 boxes.
    ~ There can't be more boxes than the number of ID chars contained in 'boxIndexes' below.


--- WHAT I'D DO WITH MORE TIME ---
- Make the DOM look nicer. The HTML CSS is pretty hacky. Even fulfil the extra Canvas milestone
- Use a proper algorithm for mapping efficient routes. This program just calculates all possibilities and
  filters for the most relevant. It would get extremely slow as you add boxes.
- rewrite the combo() function found from stackoverflow by user Keith to be my own
- remove boxes and routes vars from the global scope. For most of the project they were scoped and passed
  around but towards the end I made them global in the interest of time. Wouldn't be good for scalability
*/

import { HamBox, Route, DistCost } from "./models.js";

let boxes;
let routes;
let boxIndexes = ["A", "B", "C", "D", "E", "F", "G", "H"];
let startId = "A";
let boxCount = 4;
let boxMin = 2;
let boxMax = boxIndexes.length;

//Program starts here when the DOM is ready
window.addEventListener("load", function() {
  console.log("Hambotic: ONLINE");

  document.getElementById("calc").addEventListener("click", recalculateClick);
  document.getElementById("rand").addEventListener("click", randomClick);
  document.getElementById("add").addEventListener("click", addBoxClick);
  document.getElementById("remove").addEventListener("click", removeBoxClick);

  restart();
});

//recalculateClick() called by the Recalculate button click
//takes all the user inputs from the view and reruns the routes/boxes calculations
function recalculateClick() {
  recalculateAll(boxes);
  clearFrontContainer();
  processAll(boxes);
}

//randomClick() called by the Random All button
//randomises all DistCost input fields and reloads the DOM to reflect
function randomClick() {
  randomAll(boxes);
  clearFrontContainer();
  processAll(boxes);
}

//addBoxClick() called by the Add Box button
//reloads everything with +1 boxes if the box limit has not been hit
function addBoxClick() {
  if (boxCount < boxMax) {
    boxCount = Math.max(boxMin, Math.min(boxCount + 1, boxMax));
    clearFrontContainer();
    restart();
  }
}

//removeBoxClick() called by the Remove Box button
//reloads everything with -1 boxes. Will not trigger if the resulting box count would be less than 2
function removeBoxClick() {
  if (boxCount > boxMin) {
    boxCount = Math.max(boxMin, Math.min(boxCount - 1, boxMax));
    clearFrontContainer();
    restart();
  }
}

//randomAll() gives random dist costs to all boxes
function randomAll(boxes) {
  let box1;
  let box2;
  for (let i = 0; i < boxes.length; ++i) {
    box1 = boxes[i];
    for (let j = 0; j < boxes.length; ++j) {
      box2 = boxes[j];

      if (box1.id !== box2.id) {
        setDistCostBetweenBoxes(box1, box2, 1 + Math.floor(Math.random() * 20));
      }
    }
  }
}

//recalculateAll() takes user input from the DOM fields and gives the updated
//DistCost values to our HamBox's
function recalculateAll(boxes) {
  let box1;
  let box2;
  for (let i = 0; i < boxes.length; ++i) {
    box1 = boxes[i];
    for (let j = 0; j < boxes.length; ++j) {
      box2 = boxes[j];

      let node = document.getElementsByClassName(
        `dist from-${box1.id} to-${box2.id}`
      );
      let s = node[0].value;

      if (box1.id !== box2.id) {
        //console.log(parseInt(s));
        setDistCostBetweenBoxes(box1, box2, parseInt(s));
        //setDistCostBetweenBoxes(box1, box2, 1);
      }
    }
  }
}

//Restart() called on window load & whenever AddBox()/DeleteBox() is called
//Reinitialises all HamBox objects and generates new random values for all DistCosts.
function restart() {
  boxes = [];

  for (let i = 0; i < boxCount; ++i) {
    boxes.push(new HamBox(boxIndexes[i]));
  }

  generateDistCosts(boxes);
  processAll(boxes);
}

//processAll() called after each box has been given its complete set of DistCost data.
//We take the HamBox's and create Route objects that store our output data.
function processAll(boxes) {
  let routesString = getAllRouteCombinations(boxes);

  routesString = filterRoutesByStartId(routesString, startId);
  routes = calcRoutes(boxes, routesString);

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

  printRoutes(routes);

  placeBoxInputElements(boxes);
}

//placeBoxInputElements() uses our HamBox objects to add the necissary DOM input elements
//onto the view
function placeBoxInputElements(boxes) {
  let containerHead = document.getElementsByClassName("container-head");
  let eFill = document.createElement("p");
  eFill.innerHTML = ` `;
  eFill.className += "head";
  containerHead[0].appendChild(eFill);

  boxes.forEach(element => {
    let eName = document.createElement("p");
    eName.innerHTML = `Box ${element.id}`;

    if (element.id === "A") {
      eName.innerHTML = `Bay ${element.id}`;
    }

    eName.className += "name";

    let eDiv = document.createElement("div");
    eDiv.className += `box-${element.id} box`;
    eDiv.appendChild(eName);
    for (let i = 0; i < boxes.length; ++i) {
      let eInput = document.createElement("input");
      eInput.setAttribute("placeholder", `To ${boxes[i].id}..`);
      eInput.setAttribute("type", "number");
      eInput.setAttribute("min", "0");
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

    let eHead = document.createElement("p");
    eHead.innerHTML = `To ${element.id}`;
    eHead.className += "head";

    containerHead[0].appendChild(eHead);
  });
  let eBr = document.createElement("br");
  containerHead[0].appendChild(eBr);
  eBr = document.createElement("br");
  containerHead[0].appendChild(eBr);
}

//clearFrontContainer() removes all updatable DOM elements so that new ones
//can be placed to reflect changes made to the number of HamBox's and therefore DistCost input fields
function clearFrontContainer() {
  let div = document.getElementById("container");
  while (div.firstChild) {
    div.removeChild(div.firstChild);
  }

  div = document.getElementById("output");
  while (div.firstChild) {
    div.removeChild(div.firstChild);
  }

  div = document.getElementsByClassName("container-head");
  while (div[0].firstChild) {
    div[0].removeChild(div[0].firstChild);
  }
}

//generateDistCosts() is a more powerful randomAll() for this program
//it randomises all DistCosts for boxes but also sanitises the number of DistCost objects.
//this needs to be triggered on window load and whenever a box is added or removed.
//Perhaps this and randomAll() could be combined with a flag distinguishing the needs.
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

//printRoutes() takes our formatted Route objects and outputs the string details
//into our DOM list elements
function printRoutes(routes) {
  let output = document.getElementById("output");
  let list = document.createElement("ol");
  let s = "";

  let filter = document.getElementById("filter");
  let filterLimit = Math.max(1, Math.min(filter.value, routes.length));

  for (let i = 0; i < filterLimit; ++i) {
    let li = document.createElement("li");
    let route = routes[i];
    s = route.toString();
    li.innerHTML = s;
    list.appendChild(li);
  }

  output.appendChild(list);
}

//---!!!DEPRECIATED!!! printBoxDistances() outputted HamBox DistCost info directly from HamBox objects
//Now I use printRoutes that uses our more comprehensive Routes objects.
function printBoxDistances(boxes) {
  //console.log(boxes);
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

//filterRoutesByStartId() ensures we only output Routes that begin from our 'Bay XYZ' since
//this is where Hambotic begins its search. where XYZ is the starting ID
function filterRoutesByStartId(routesString, startId) {
  let routesNew = [];

  routesString.forEach(element => {
    if (element[0] === startId) {
      routesNew.push(element);
    }
  });
  return routesNew;
}

//getAllRouteCombinations() is the first step from translating HamBox info into more formatted Route objects.
//we put it through Keith's combo() to get all possible route combinations as strings.
function getAllRouteCombinations(boxes) {
  let idCollection = [];

  boxes.forEach(element => {
    idCollection.push(element.id);
  });

  return combo(idCollection);
}

//calcRoutes() uses all possible Route combinations given by getAllRouteCombinations()
//converts the routesString[]s into Route objects that contain all the info we need from HamBox's
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

//getBoxById() simple boxes[] lookup given a HamBox.id
function getBoxById(boxes, id) {
  for (let i = 0; i < boxes.length; ++i) {
    if (boxes[i].id === id) {
      return boxes[i];
    }
  }
  return null;
}

//getDistCost() looks up a DistCost.cost given a box and a valid from/to pairing
function getDistCost(box, from, to) {
  for (let i = 0; i < box.distCost.length; ++i) {
    if (box.distCost[i].idFrom === from && box.distCost[i].idTo === to) {
      return box.distCost[i].cost;
    }
  }
  return null;
}

//getDistCostAsDistCost() works like an overload for getDistCost() that returns an object copy
function getDistCostAsDistCost(box, from, to) {
  for (let i = 0; i < box.distCost.length; ++i) {
    if (box.distCost[i].idFrom === from && box.distCost[i].idTo === to) {
      //return `${from}->${to}: ${box.distCost[i].cost}`;
      return new DistCost(from, to, box.distCost[i].cost);
    }
  }
  return null;
}

//checkExistingDistCostBetweenBoxes() is technically DEPRECIATED. It would be used to ensure that
//2 HamBox's that had identical-but-reversed DistCosts would be given the same distance value
//This however is not necissarily the case as per the project requirement
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

//setDistCostBetweenBoxes() configure a valid DistCost for the distance between 2 HamBox's
function setDistCostBetweenBoxes(box1, box2, newCost) {
  let boxId1 = box1.id;
  let boxId2 = box2.id;
  for (let i = 0; i < box1.distCost.length; ++i) {
    if (box1.distCost[i].idTo === boxId2) {
      box1.distCost[i].cost = newCost;
      return true;
    }
  }
  return false;
}

//https://stackoverflow.com/questions/40654895/javascript-generating-all-combinations-of-an-array-considering-the-order
//Author: Keith
/*
combo() takes an array and returns a 2D array containing all possible sequences.
*/
function combo(c) {
  let r = [],
    len = c.length;
  let tmp = [];
  function nodup() {
    let got = {};
    for (let l = 0; l < tmp.length; l++) {
      if (got[tmp[l]]) return false;
      got[tmp[l]] = true;
    }
    return true;
  }
  function iter(col, done) {
    let l, rr;
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
