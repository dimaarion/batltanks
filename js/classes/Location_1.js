import Phaser from "phaser"
import Body from "./Body";
import Bot from "./Bot";

export default class Location_1 extends Phaser.Scene {
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
    space: false
  }
  cursorKeys
  tankName = 'tank_corpus_1'
  activeObject = undefined
  edgeThreshold = 100;
  block
  cameraSpeed = 4;
  body = [new Body(100, 500, "tank_corpus_1"), new Body(300, 500, "tank_corpus_2"), new Body(600, 500, "tank_corpus_3")]

  bodyBot = [new Bot(1000, 500, "bot_corpus_1"),new Bot(1500, 500, "bot_corpus_2")]

  constructor() {
    super("Location_1");
  }

  create() {
    this.map = this.make.tilemap({key: 'map',tileWidth: 32, tileHeight: 32 });
    let tiles = this.map.addTilesetImage("location_1", "tiles", 32, 32, 0, 0);
    this.layer = this.map.createLayer("ground", tiles, 0, 0);
    this.block = this.map.createLayer("block", tiles, 0, 0);
    this.layer.setCollisionByProperty({collides: true});
    this.map.setCollisionByExclusion(-1, true);
    this.matter.world.convertTilemapLayer(this.block);
    this.matter.world.createDebugGraphic();
    this.matter.world.drawDebug = false;
    this.cam = this.cameras.main;
    this.cameras.main.zoom = 1;
    this.matter.world.setBounds(0,0,this.map.widthInPixels, this.map.heightInPixels);
    this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
    this.cameras.main.roundPixels = true;
    this.body.forEach((el) => {
      el.setup(this);
    })
    this.bodyBot.forEach((el) => {
      el.setup(this);
    })

    this.cursorKeys = this.input.keyboard.createCursorKeys();
    this.control.space = this.input.keyboard.addKey('space');


    let pointer = this.input.activePointer;
    let worldXY = pointer.positionToCamera(this.cam);

    this.pointT = this.matter.add.sprite(100, 100, 'runPoint', 0, {
      isSensor: true,
      label: 'cursor-state'
    }).play("runPoint")
    this.pointM = this.matter.add.sprite(worldXY.x, worldXY.y, "point-move", 0, {label: 'cursor-move'}).setCircle(50, {label: "cursor-move"}).setSensor(true).setName("cursor");

    this.matter.world.on("collisionstart", (event) => {
      event.pairs.forEach((pair) => {
        if (pair.bodyA.label.match(/bot/i) && pair.bodyB.label === "pule") {
          pair.bodyB.gameObject.play("pule-blast-run").once("animationcomplete", () => {
            this.matter.setVelocity(pair.bodyB, 0, 0);

          })
        }
        if (pair.bodyA.label.match(/tank/i) && pair.bodyB.label === "pule") {
          pair.bodyB.gameObject.play("pule-blast-run").once("animationcomplete", () => {
            this.matter.setVelocity(pair.bodyB, 0, 0);

          })
        }

        if (pair.bodyA.label.match(/tank_corpus/i) && pair.bodyB.label === "cursor-move") {
          this.activePoint = true
          this.input.on('pointerdown', (pointer) => {
            this.activeObject = pair.bodyA.label

            this.body.forEach((el) => {
              if (el.constraint.corpus.body === pair.bodyA) {
                el.constraint.corpus.body.highlight = true;
              } else {
                el.constraint.corpus.body.highlight = false;
              }

            })
          });


        }
        if (pair.bodyB.label.match(/tank_corpus/i) && pair.bodyA.label === "cursor-move") {
          this.activePoint = true
          this.input.on('pointerdown', (pointer) => {
            this.activeObject = pair.bodyB.label
          });


        }
        if (/pule/i.test(pair.bodyB.label) && pair.bodyB.bot === 0 && pair.bodyA.label.match(/bot/i)) {

          this.bodyBot.filter((el)=>el.constraint.corpus.body === pair.bodyA).forEach((el) => {
            el.takeDamageBot(pair.bodyA,pair.bodyB.attack)
          })
        }
        if (/pule/i.test(pair.bodyB.label) && pair.bodyB.bot === 1 && pair.bodyA.label.match(/tank/i)) {
          this.body.filter((el)=>el.constraint.corpus.body === pair.bodyA).forEach((el) => {
            el.takeDamage(pair.bodyA,pair.bodyB.attack)
          })
        }

      });
    })
    this.matter.world.on("collisionactive", (event) => {
      event.pairs.forEach((pair) => {
        if (/sensor/i.test(pair.bodyA.label) && pair.bodyB.label.match(/bot/i)) {
          this.body.filter((el) => el.constraint.sensor === pair.bodyA).forEach((el) => {
            if(el.constraint.corpus.body.health < 1){
              el.timer.paused = true
            }else {
              if(pair.bodyB.health === 0){
                el.timer.paused = true
              }else {
                el.timer.paused = false
                el.constraint.sensor.positionBot = pair.bodyB.position
                el.rotateHead(pair.bodyA.headObject.body, pair.bodyB.position.x, pair.bodyB.position.y, true)
              }

            }


          })

        }
        if (/sensor/i.test(pair.bodyB.label) && pair.bodyA.label.match(/tank/i)) {
          this.bodyBot.filter((el) => el.constraint.sensor === pair.bodyB).forEach((el) => {
            if(el.constraint.corpus.body.health < 1){
              el.timer.paused = true
            }else {
              if(pair.bodyA.health === 0){
                el.timer.paused = true
              }else {
                el.timer.paused = false
                el.constraint.sensor.positionBot = pair.bodyA.position
                el.rotateHead(pair.bodyB.headObject.body, pair.bodyA.position.x, pair.bodyA.position.y, true)
              }

            }

          })

        }
      })
    })

    this.matter.world.on("collisionend", (event) => {
      event.pairs.forEach((pair) => {
        if ((pair.bodyA.label.match(/tank_corpus/i) && pair.bodyB.label === "cursor-move") || (pair.bodyB.label.match(/tank_corpus/i) && pair.bodyA.label === "cursor-move")) {
          // this.activePoint = true
          this.activePoint = false
        }
        if (/sensor/i.test(pair.bodyA.label) && pair.bodyB.label.match(/bot/i)) {
          this.body.filter((el) => el.constraint.sensor === pair.bodyA).forEach((el) => {
            el.timer.paused = true
            if(el.constraint.corpus.body.health > 1) {
              el.constraint.sensor.positionBot = pair.bodyB.position
              if(pair.bodyB.health !== 0) {
                el.rotateHead(pair.bodyA.headObject.body, pair.bodyB.position.x, pair.bodyB.position.y, false)
              }
            }

          })

        }

        if (/sensor/i.test(pair.bodyB.label) && pair.bodyA.label.match(/tank/i)) {
          this.bodyBot.filter((el) => el.constraint.sensor === pair.bodyB).forEach((el) => {
            el.timer.paused = true
            if(el.constraint.corpus.body.health > 1) {
              el.constraint.sensor.positionBot = pair.bodyA.position
              if(pair.bodyA.health !== 0) {
              el.rotateHead(pair.bodyB.headObject.body, pair.bodyA.position.x, pair.bodyA.position.y, false)
                }
            }
          })

        }


      });
    })

    this.input.on('pointerdown', (pointer) => {
      let worldXY = pointer.positionToCamera(this.cam);
      if (!this.activePoint) {
        this.tankName = this.activeObject
        this.body.filter((el) => el.constraint.corpus.body.label === this.activeObject && el.constraint.corpus.body.health > 1).forEach((el) => {
          el.constraint.corpus.body.pX = worldXY.x;
          el.constraint.corpus.body.pY = worldXY.y;

        })
      }
      this.body.forEach((el)=>{
        if(el.constraint.corpus.body.label === this.activeObject){
        //  this.cam.startFollow(el.constraint.corpus, true);
        }
      })
    });


  }

  update(time, delta) {

    let pointer = this.input.activePointer;
    let worldXY = pointer.positionToCamera(this.cam);
    if (this.control.space.isDown) {
      if (pointer.x < this.edgeThreshold) {
        this.cam.scrollX -= this.cameraSpeed;
      }
      if (pointer.x > this.game.config.width - this.edgeThreshold) {
        this.cam.scrollX += this.cameraSpeed;
      }
      if (pointer.y > this.game.config.height - this.edgeThreshold) {
        this.cam.scrollY += this.cameraSpeed;
      }
      if (pointer.y < this.edgeThreshold) {
        this.cam.scrollY -= this.cameraSpeed;
      }
    }


    if (pointer.isDown && !this.activePoint) {
      this.pointT.setPosition(worldXY.x, worldXY.y)
    }
    this.pointM.setPosition(worldXY.x, worldXY.y)

    this.body.filter((name) => name.constraint.corpus.body.label).forEach((el) => {
      el.draw()
    })
    this.bodyBot.filter((name) => name.constraint.corpus.body.label).forEach((el) => {
      el.move()
    })


  }

}
