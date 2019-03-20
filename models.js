//Route objects are the completely formatted and User ready objects created with the
//HamBox and their associated DistCost objects.
export class Route {
  constructor() {
    this.distCost = [];
    this.costTotal = 0;
  }

  print() {
    for (let i = 0; i < this.distCost.length; ++i) {
      this.distCost[i].print();
    }
  }

  toString() {
    let s = "";
    for (let i = 0; i < this.distCost.length; ++i) {
      s += this.distCost[i].toString();
    }
    return `${s} : TOTAL: ${this.costTotal}`;
  }

  calcTotalCost() {
    this.costTotal = 0;
    for (let i = 0; i < this.distCost.length; ++i) {
      this.costTotal += this.distCost[i].cost;
    }
  }
}

//HamBox objects contain a collection of DistCosts and an ID
export class HamBox {
  constructor(id) {
    this.id = id;
    this.distCost = [];
  }
  addDistCost(distCost) {
    this.distCost.push(distCost);
  }
}

//DistCosts are contained within HamBox's. It stores relational information that tells
//HamBox's how far each other HamBox is from themselves.
export class DistCost {
  constructor(idFrom, idTo, cost) {
    this.idFrom = idFrom;
    this.idTo = idTo;
    this.cost = cost;
  }

  print() {
    console.log(`${this.idFrom}>${this.idTo}: ${this.cost}`);
  }

  toString() {
    return (
      `${this.idFrom}>${this.idTo} (${this.cost})` + "    ---   "
    ).replace(/ /g, "&nbsp;");
  }
}
