import * as Phaser from "phaser";
import Action from "./Action";

export default class Body {
  x = 200
  y = 200
  botPosition = {x: 0, y: 0}
  scene;
  name
  keyObjects  = null
  corpus
  velocity
  activePoint = true
  dx = null
  dy = null
  cam
  countPule = 0
  countTanks = 0;
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
    sensor: null
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
    space: false
  }
  headSensor = null
  timer
  live = 100
  target
  worldXY = {x:0,y:0}
  action = new Action();

  constructor(x, y, name, head = 'Gun_01', corpus = 'Hull_01') {
    this.x = x;
    this.y = y;
    this.name = name;
    this.headImg = head;
    this.corpusImg = corpus
  }


  setup(scene) {

    this.countTanks += 1;
    this.scene = scene;
    this.healthBar = this.scene.add.graphics();
    this.healthBar.fillStyle(0x00ff00, 1);
    this.healthBar.fillRect(this.x - 50, this.y - 80, 100, 10);
    this.healthBar.setDepth(100);

    console.log(this.name)

    this.constraint.corpus = this.scene.matter.add.sprite(this.x, this.y, this.corpusImg, 0, {label: this.name}).setRectangle(200, 200, {label: this.name,pX:this.x,pY:this.y}).setScale(this.scale).setDepth(1).setName(this.name);
    this.constraint.head = this.scene.matter.add.sprite(this.x, this.y, this.headImg, 0, {label: "head"}).setSensor(true).setScale(this.scale).setDepth(2);
    this.constraint.sensor = this.scene.matter.add.circle(this.x, this.y, 300, {
      isSensor: true,
      label: "sensor",
      positionBot:{x:0,y:0},
      headObject:this.constraint.head

    })
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

  this.headSensor = this.scene.matter.add.constraint(this.constraint.head, this.constraint.sensor, 0, 1);
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





    this.scene.matter.world.on('collisionstart', (event) => {
      event.pairs.forEach((pair) => {
        if (pair.bodyA.label.match(/bot/i) && pair.bodyB.label === "pule") {
          pair.bodyB.gameObject.play("pule-blast-run").once("animationcomplete", () => {
            this.scene.matter.setVelocity(pair.bodyB, 0, 0);

          })
        }
        if (pair.bodyB.label === "pule" && /bot_corpus_/i.test(pair.bodyA.label)) {
          this.takeDamage(this.attack)
        }
        if (/sensor_tank_/i.test(pair.bodyB.label) && /bot_corpus/i.test(pair.bodyB.label)) {

        }

        if (pair.bodyB.label === "cursor-state" && /cursor-move/i.test(pair.bodyA.label)) {
          // this.scene.matter.setVelocity(pair.bodyA, 0, 0);
          //  this.dx = null;
          // this.dy = null;
        }
        if (pair.bodyA.label === "cursor-state" && pair.bodyB.label.match(/tank_corpus/i)) {
          //  this.scene.matter.setVelocity(pair.bodyB, 0, 0);
          // this.dx = null
          //  this.dy = null
        }
        if (pair.bodyB === this.constraint.corpus.body  && /cursor-move/i.test(pair.bodyA.label)) {
         // this.keyObjects = pair.bodyB;
        }
        if (pair.bodyA === this.constraint.corpus.body  && /cursor-move/i.test(pair.bodyB.label)) {
         // this.keyObjects = pair.bodyA;
        }



      });
    });

    this.scene.matter.world.on('collisionactive', (event) => {
      event.pairs.forEach((pair) => {


      })
    })


    this.scene.matter.world.on("collisionend", (event) => {
      event.pairs.forEach((pair) => {

      });
    })




  }

  draw() {
    if(this.timer){

    }

  this.dx = this.constraint.corpus.body.pX - this.constraint.corpus.body.position.x;
  this.dy = this.constraint.corpus.body.pY - this.constraint.corpus.body.position.y;
  this.moveTo(this.constraint.corpus.body,  this.constraint.corpus.body.pX, this.constraint.corpus.body.pY)


  // Вычисляем угол в радианах
  const angle = Math.atan2(this.dy, this.dx) + Math.PI / 2;

  // Вычисляем текущий угол объекта
  const currentAngle = this.constraint.corpus.body.angle;

  // Рассчитываем разницу углов
  let angleDiff = angle - currentAngle;

  // Нормализуем разницу углов для корректного направления вращения
  angleDiff = Phaser.Math.Angle.Wrap(angleDiff);

  // Устанавливаем угловую скорость
  const angularSpeed = 0.1; // Подбери подходящее значение для скорости
  this.scene.matter.body.setAngularVelocity(this.constraint.corpus.body, angleDiff * angularSpeed);
  const length = Math.sqrt(this.dx * this.dx + this.dy * this.dy);
  const speed = 5; // Можно менять скорость
  const velocity = {x: (this.dx / length) * speed, y: (this.dy / length) * speed};
  const distance = Math.sqrt(this.dx * this.dx + this.dy * this.dy);

  if (this.target) {
    const distance = Phaser.Math.Distance.Between(this.constraint.corpus.body.position.x, this.constraint.corpus.body.position.y, this.target.x, this.target.y);

    if (distance < 200) { // Если близко к цели, останавливаем
      this.scene.matter.setVelocity(this.constraint.corpus.body, 0, 0);
      this.target = null; // Убираем цель
    }
  }

    this.movePule()
    this.liveDraw()
  }

  moveTo(body, targetX, targetY) {
    const speed = 5; // Скорость движения
    const angle = Phaser.Math.Angle.Between(body.position.x, body.position.y, targetX, targetY);

    const velocityX = Math.cos(angle) * speed;
    const velocityY = Math.sin(angle) * speed;

    this.scene.matter.setVelocity(body, velocityX, velocityY);
    this.target = {x: targetX, y: targetY}; // Запоминаем цель
  }


  movePule(){
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
  }

  pule(body,x, y,active = false) {
    if(active){
      this.timer = this.scene.time.addEvent({
        delay: 1000,                // ms
        callback: () => {

          this.constraint.pule = this.scene.matter.add
            .sprite(body.position.x, body.position.y, 'pule', "pule", {label: "pule"}).setScale(0.8)
            .setSensor(true)
          //.play("pule-departure-run").once('animationcomplete', () => {
          //  this.constraint.pule.setTexture("pule"); // Останавливаем анимацию
          //  });
          const dx = x - body.position.x;
          const dy = y - body.position.y;
          const angle = Math.atan2(dy, dx) + Math.PI / 2;
          this.scene.matter.body.setAngle(this.constraint.pule.body, angle);
          this.scene.matter.body.setAngle(body, angle);
          const length = Math.sqrt(dx * dx + dy * dy);
          const speed = 10; // Можно менять скорость
          const velocity = {x: (dx / length) * speed, y: (dy / length) * speed};
          const distance = Math.sqrt(dx * dx + dy * dy);
          const moveX = body.position.x + (dx / distance) * 110;
          const moveY = body.position.y + (dy / distance) * 110;
          this.constraint.pule.setPosition(moveX, moveY)
          this.scene.matter.setVelocity(this.constraint.pule.body, velocity.x, velocity.y);

        },
        //args: [],
        callbackScope: this,
        loop: active
      });
      this.timer.paused = false
    }else {
      this.timer.paused = true
    }

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


  headRotation(body, x, y) {
    console.log(body)
    let dx = x - body.position.x;
    let dy = y - body.position.y;

    // Вычисляем угол в радианах
    const angle = Math.atan2(dy, dx) + Math.PI / 2;

    // Вычисляем текущий угол объекта
    const currentAngle = name.angle;

    // Рассчитываем разницу углов
    let angleDiff = angle - currentAngle;

    // Нормализуем разницу углов для корректного направления вращения
    angleDiff = Phaser.Math.Angle.Wrap(angleDiff);

    // Устанавливаем угловую скорость
    const angularSpeed = 0.1; // Подбери подходящее значение для скорости
    this.scene.matter.body.setAngularVelocity(body, angleDiff * angularSpeed);


  }


}


