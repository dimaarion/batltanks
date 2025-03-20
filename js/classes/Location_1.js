import Phaser from "phaser"
import Body from "./Body";
export default class Location_1 extends Phaser.Scene{
  map
  body = new Body(500,500,"tank_1")

  constructor() {
    super("Location_1");
  }

  create(){
    this.map = this.make.tilemap({key: 'map'});
    let tiles = this.map.addTilesetImage("location_1", "tiles");
    this.layer = this.map.createLayer("ground", tiles, this.game.config.width / 2 - 320, 0);
    this.layer.setCollisionByProperty({collides: true});
    this.map.setCollisionByExclusion(-1, true);
    this.matter.world.setBounds(this.game.config.width / 2 - 320, this.map.heightInPixels);
    this.matter.world.createDebugGraphic();
    this.matter.world.drawDebug = true;

    this.body.setup(this)






  }

  update(time, delta) {
    this.body.draw()

  }

}
