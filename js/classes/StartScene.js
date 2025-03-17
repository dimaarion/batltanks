import * as Phaser from "phaser";
export default class StartScene extends Phaser.Scene{
  constructor() {
    super("Start");
  }

create(){
  this.scene.start("Location_1");
}
}
