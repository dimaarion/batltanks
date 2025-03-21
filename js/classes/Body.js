import * as Phaser from "phaser";
import Action from "./Action";

export default class Body {
  x = 200
  y = 200
  scene;
  name
  keyObjects
  corpus
  velocity
  activePoint = true
  dx = null
  dy = null
  cam
  countTanks = 0;
  worldXY
  speed = 2
  rotations = 0.01;
  attack = 10
  constraint = {
    main: null,
    head: null,
    muzzle: null,
    corpus: null,
    pule: null,
    live: null,
    sensor:null
  }
  headImg
  corpusImg
  healthBar
  cursorKeys
  scale = 0.5
  control = {
    left: false,
    right: false,
    up: false,
    down: false,
    space:false
  }

  live = 100

  action = new Action();

  constructor(x, y, name,head = 'Gun_01',corpus= 'Hull_01') {
    this.x = x;
    this.y = y;
    this.name = name;
    this.headImg = head;
    this.corpusImg = corpus
  }


  setup(scene) {

this.countTanks += 1;
this.name = "tank_corpus_" + this.countTanks
    this.scene = scene;
    this.healthBar = this.scene.add.graphics();
    this.healthBar.fillStyle(0x00ff00, 1);
    this.healthBar.fillRect(this.x - 50, this.y - 80, 100, 10);
    this.healthBar.setDepth(100);

console.log(this.name)
    this.constraint.sensor = this.scene.matter.add.circle(this.x,this.y,300,{isSensor:true,label:"sensor_tank_" + this.countTanks})
    this.constraint.corpus = this.scene.matter.add.sprite(this.x, this.y, this.corpusImg, 0, {label:this.name}).setRectangle(200, 200,{label:this.name}).setScale(this.scale).setDepth(1).setName(this.name);
    this.constraint.head = this.scene.matter.add.sprite(this.x, this.y, this.headImg, 0, {label: "head_tank_" + this.countTanks}).setSensor(true).setScale(this.scale).setDepth(2);
    this.constraint.corpus.health = this.live;
    this.constraint.main = this.scene.matter.add.constraint(this.constraint.corpus, this.constraint.head, 0.01, 1, {
      pointA: {
        x: 0,
        y: 20,
      },
      pointB: {
        x: 0,
        y: 30,
      },
      damping: 0,
      angularStiffness: 1
    })
    this.scene.matter.add.constraint(this.constraint.corpus,this.constraint.sensor,0,1);
    this.cam = this.scene.cameras.main;
    this.cursorKeys = scene.input.keyboard.createCursorKeys();

    this.control.left = scene.input.keyboard.addKey('A');  // Get key object
    this.control.right = scene.input.keyboard.addKey('D');
    this.control.up = scene.input.keyboard.addKey('W');
    this.control.down = scene.input.keyboard.addKey('S');
    this.control.space = scene.input.keyboard.addKey('SPACE');


    this.scene.anims.create({
      key: 'pule-blast-run',
      frames: this.scene.anims.generateFrameNumbers('pule-blast', {start: 0, end: 8}),
      frameRate: 10,
      repeat: 0
    });

    this.scene.anims.create({
      key: 'pule-departure-run',
      frames: this.scene.anims.generateFrameNumbers('pule-departure', {start: 0, end: 3}),
      frameRate: 50,
      repeat: 0
    });






    this.scene.input.on('pointerdown', function(pointer){
      let worldXY = pointer.positionToCamera(this.cam);
      this.dx = worldXY.x - this.constraint.corpus.body.position.x;
      this.dy = worldXY.y - this.constraint.corpus.body.position.y;
      // ...
    }, this);




    this.scene.matter.world.on('collisionstart', (event) => {
      const nameTank = "tank" + this.name;
      event.pairs.forEach((pair) => {
        if (pair.bodyB.gameObject && pair.bodyB.label === "pule") {
          pair.bodyB.gameObject.play("pule-blast-run").once("animationcomplete", () => {
            this.scene.matter.setVelocity(pair.bodyB, 0, 0);

          })
        }
        if (pair.bodyB.label === "pule" && pair.bodyA.label) {
          this.takeDamage(this.attack)
        }
        if (/sensor_tank_/i.test(pair.bodyB.label)) {
          this.scene.matter.world.engine.world.bodies.filter((el)=>el.label === "head_tank_" + this.countTanks).forEach((tank) => {
            let timer = scene.time.addEvent({
              delay: 500,                // ms
              callback: ()=>{
                console.log(pair.bodyB.label +"/"+ "corpus_tank_" + this.countTanks)
             if(tank.gameObject.label !== "corpus_tank_" + this.countTanks){
              // this.pule(pair.bodyB.position.x,pair.bodyB.position.y,tank)
             }

              },
              //args: [],
              callbackScope: this,
              loop: true
            });
            console.log(pair.bodyA.label)
          })



        }

        if (pair.bodyB.label === "cursor-state" && /tank_corpus/i.test(pair.bodyA.label)) {
          this.scene.matter.setVelocity(pair.bodyA, 0, 0);
          this.dx = null;
          this.dy = null;
        }
        if (pair.bodyA.label === "cursor-state" && pair.bodyB.label.match(/tank_corpus/i)) {
          this.scene.matter.setVelocity(pair.bodyB, 0, 0);
          this.dx = null
          this.dy = null
        }
        if (pair.bodyB.gameObject && pair.bodyB.gameObject.name === "cursor" && pair.bodyA.label) {

        }

      });
    });

    this.scene.matter.world.on("collisionend",(event)=>{
      event.pairs.forEach((pair) => {

      });
    })

    this.scene.input.on('pointerdown', (pointer) => {
      this.activePoint = true
    });



  }

  draw(name = "tank_corpus_1") {

  let pointer = this.scene.input.activePointer;
  let worldXY = pointer.positionToCamera(this.cam);
  if(pointer.isDown){
    this.dx = worldXY.x - name.position.x;
    this.dy = worldXY.y - name.position.y;
  }

  if(this.dx !== null || this.dy !== null){

    // Вычисляем угол в радианах
    const angle = Math.atan2(this.dy, this.dx) + Math.PI / 2;

    // Вычисляем текущий угол объекта
    const currentAngle = name.angle;

    // Рассчитываем разницу углов
    let angleDiff = angle - currentAngle;

    // Нормализуем разницу углов для корректного направления вращения
    angleDiff = Phaser.Math.Angle.Wrap(angleDiff);

    // Устанавливаем угловую скорость
    const angularSpeed = 0.1; // Подбери подходящее значение для скорости
    this.scene.matter.body.setAngularVelocity(name, angleDiff * angularSpeed);
    const length = Math.sqrt(this.dx * this.dx + this.dy * this.dy);
    const speed = 5; // Можно менять скорость
    const velocity = {x: (this.dx / length) * speed, y: (this.dy / length) * speed};
    const distance = Math.sqrt(this.dx * this.dx + this.dy * this.dy);
    this.scene.matter.setVelocity(name, velocity.x, velocity.y);

}









    if (this.constraint.pule) {

      this.scene.matter.world.engine.world.bodies.filter((el) => el.label === "pule").forEach((pule) => {
        if (pule.speed < 1.5) {
          pule.gameObject.play("pule-blast-run", true)
        }
        if (pule.speed < 1) {
          this.scene.matter.world.remove(pule);
          pule.gameObject.destroy()
        }

      })


    }


    this.liveDraw()

  }

  pule(x,y,body){
    console.log(body)

    this.constraint.pule = this.scene.matter.add
      .sprite(body.position.x, body.position.y, 'pule', "pule", {label: "pule"}).setScale(0.8)
      .setSensor(true).play("pule-departure-run").once('animationcomplete', () => {
        this.constraint.pule.setTexture("pule"); // Останавливаем анимацию
      });
    const dx = x - body.position.x;
    const dy = y - body.position.y;
    const angle = Math.atan2(dy, dx) + Math.PI / 2;
    this.scene.matter.body.setAngle(this.constraint.pule.body, angle);
    const length = Math.sqrt(dx * dx + dy * dy);
    const speed = 10; // Можно менять скорость
    const velocity = {x: (dx / length) * speed, y: (dy / length) * speed};
    const distance = Math.sqrt(dx * dx + dy * dy);
    const moveX = body.position.x + (dx / distance) * 110;
    const moveY = body.position.y + (dy / distance) * 110;
    this.constraint.pule.setPosition(moveX, moveY)
    this.scene.matter.setVelocity(this.constraint.pule.body, velocity.x, velocity.y);
  }

  liveDraw() {
    let healthWidth = this.constraint.corpus.health;
    this.healthBar.clear();
    this.healthBar.fillStyle(0x00ff00, 1);  // Зеленый
    if (healthWidth < 50) {
      this.healthBar.fillStyle(0xffff00, 1);
    }
    if (healthWidth < 20) {
      this.healthBar.fillStyle(0xff0000, 1);
    }
    this.healthBar.fillRect(this.constraint.corpus.body.position.x - 50, this.constraint.corpus.body.position.y - 80, healthWidth, 10);
  }

  takeDamage(amount) {
    this.constraint.corpus.health -= amount;
    if (this.constraint.corpus.health < 0) this.constraint.corpus.health = 0;
  }


}


