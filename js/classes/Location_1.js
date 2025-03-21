import Phaser from "phaser"
import Body from "./Body";
export default class Location_1 extends Phaser.Scene{
  map
  cam
  body = new Body(500,500,"tank_1")
  body2 = new Body(800,500,"tank_1")
  constructor() {
    super("Location_1");
  }

  create(){
    this.map = this.make.tilemap({key: 'map'});
    let tiles = this.map.addTilesetImage("location_1", "tiles");
    this.layer = this.map.createLayer("ground", tiles, 0, 0);
    this.layer.setCollisionByProperty({collides: true});
    this.map.setCollisionByExclusion(-1, true);
    this.matter.world.setBounds(this.map.widthInPixels, this.map.heightInPixels);
    this.matter.world.createDebugGraphic();
    this.matter.world.drawDebug = true;
    this.cam = this.cameras.main;
    this.body.setup(this);
    this.body2.setup(this);

    let pointer = this.input.activePointer;
    let worldXY = pointer.positionToCamera(this.cam);

    let pointT = this.matter.add.sprite(100, 100, 'runPoint',0,{isSensor:true,label:'cursor-state'}).play("runPoint")
    let pointM = this.matter.add.circle(worldXY.x, worldXY.y, 100,{isSensor:true,label:'cursor-move'});

    this.input.on('pointerdown', function(pointer){
      let worldXY = pointer.positionToCamera(this.cam);
       pointT.setPosition(worldXY.x,worldXY.y)

    }, this);




  }

  update(time, delta) {
    this.body.draw()
    this.body2.draw()
  }

}
