import Body from "./Body";

export default class Bot extends Body {


  constructor(x, y, name, head = 'Gun_01', corpus = 'Hull_01') {
    super(x, y, name, head, corpus);
    this.bot = 1
    this.attack = 10
  }

  takeDamageBot(body, amount) {
    body.health -= amount;
    if (body.health < 0) body.health = 0;
  }

  move(){
    this.trackAngle()
    this.liveDraw()
  }

}
