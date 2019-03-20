export class Route {
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
    //console.log(`Total cost: ${costTotal}`);
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

export class HamBox {
  constructor(id) {
    this.id = id;
    this.distCost = [];
  }
  addDistCost(distCost) {
    this.distCost.push(distCost);
  }
}
