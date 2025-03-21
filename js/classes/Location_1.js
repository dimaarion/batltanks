import Phaser from "phaser"
import Body from "./Body";
export default class Location_1 extends Phaser.Scene{
  map
  cam
  pointT
  activePoint = true
  pointM
  lastX
  lastY
  velX = 0
  velY = 0
  mouseX
  mouseY
  control = {
    left: false,
    right: false,
    up: false,
    down: false,
    space:false
  }
  cursorKeys
  tankName = 'tank_corpus_1'
  activeObject = 'tank_corpus_1'
  edgeThreshold = 100;
  cameraSpeed = 4;
  body = new Body(500,500,"tank_corpus_1")
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
    this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);

    this.matter.world.createDebugGraphic();
    this.matter.world.drawDebug = true;
    this.cam = this.cameras.main;

   // this.body.setup(this);


    this.cursorKeys = this.input.keyboard.createCursorKeys();
    this.control.space = this.input.keyboard.addKey('space');


    let pointer = this.input.activePointer;
    let worldXY = pointer.positionToCamera(this.cam);

    this.pointT = this.matter.add.sprite(100, 100, 'runPoint',0,{isSensor:true,label:'cursor-state'}).play("runPoint")
    this.pointM = this.matter.add.sprite(worldXY.x, worldXY.y, "point-move",0,{label:'cursor-move'}).setCircle(50,{label:"cursor-move"}).setSensor(true).setName("cursor");

   this.matter.world.on("collisionstart",(event)=>{
     event.pairs.forEach((pair) => {


       if (pair.bodyA.label.match(/tank_corpus/i) && pair.bodyB.label === "cursor-move") {
         this.activePoint = false
         this.activeObject = pair.bodyA.label
         console.log(this.tankName)
       }
       if (pair.bodyB.label.match(/tank_corpus/i) && pair.bodyA.label === "cursor-move") {
         this.activePoint = false
         this.activeObject = pair.bodyB.label
         console.log(this.tankName)
       }
     });
   })
    this.matter.world.on("collisionend",(event)=>{
      event.pairs.forEach((pair) => {
        if ((pair.bodyA.label.match(/tank_corpus/i) && pair.bodyB.label === "cursor-move") || (pair.bodyB.label.match(/tank_corpus/i) && pair.bodyA.label === "cursor-move")) {
          this.activePoint = true
        }
      });
    })

    this.input.on('pointerdown', (pointer) => {
      this.tankName = this.activeObject
     if(pointer.x < 200){
       this.body.setup(this);
     }
    });



  }

  update(time, delta) {

    let pointer = this.input.activePointer;
    let worldXY = pointer.positionToCamera(this.cam);
if(this.control.space.isDown){
  if(pointer.x < this.edgeThreshold){
    this.cam.scrollX -= this.cameraSpeed;
  }
  if(pointer.x > this.game.config.width - this.edgeThreshold){
    this.cam.scrollX +=  this.cameraSpeed;
  }
  if(pointer.y > this.game.config.height - this.edgeThreshold){
    this.cam.scrollY += this.cameraSpeed;
  }
  if(pointer.y < this.edgeThreshold){
    this.cam.scrollY -= this.cameraSpeed;
  }
}


    if(pointer.isDown && this.activePoint){
      this.pointT.setPosition(worldXY.x,worldXY.y)
    }
    this.pointM.setPosition(worldXY.x,worldXY.y)


    this.matter.world.engine.world.bodies.filter((el)=>el.gameObject && el.label === this.tankName).forEach((tank) => {
      this.body.draw(tank)
    })


  }

}
