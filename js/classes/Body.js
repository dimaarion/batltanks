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
  speedPule = 1000
  velocity
  activePoint = true
  dx = null
  dy = null
  cam
  bot = 0
  namePule = "pule"
  nameSensor = "sensor"
  countPule = 0
  countTanks = 0;
  speed = 2
  rotations = 0.01;
  attack = 10
  radiusSensor = 300
  constraint = {
    main: null,
    head: null,
    muzzle: null,
    corpus: null,
    pule: null,
    live: null,
    sensor: null,
    track:[],
    burning:null
  }
  highlight
  sensorHighlight
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
    this.highlight = this.scene.add.graphics();
    this.highlight.lineStyle(4, 0xff0000, 1); // Красная обводка (толщина 4)

    this.sensorHighlight = this.scene.add.graphics();
    this.sensorHighlight.lineStyle(4, 0x808080, 0.5);


    this.constraint.track = [{x:40,y:0},{x:-40,y:0}].map((el)=>this.scene.matter.add.sprite(this.x,this.y,"track","run-track",{isSensor:true,cP:el}).play("run-track").stop().setScale(0.7))
    this.constraint.corpus = this.scene.matter.add.sprite(this.x, this.y, this.corpusImg, 0, {label: this.name}).setRectangle(200, 200, {label: this.name,pX:this.x,pY:this.y,highlight:false,health:this.live}).setScale(this.scale).setDepth(1).setName(this.name);
    this.constraint.head = this.scene.matter.add.sprite(this.x, this.y, this.headImg, 0, {label: "head"}).setSensor(true).setScale(this.scale).setDepth(2);
    this.constraint.sensor = this.scene.matter.add.circle(this.x, this.y, this.radiusSensor, {
      isSensor: true,
      label: this.nameSensor,
      positionBot:{x:0,y:0},
      headObject:this.constraint.head

    })
    this.constraint.burning = this.scene.matter.add.sprite(this.x,this.y,"pule-blast","burning",{isSensor:true}).setDepth(10)
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
    this.scene.matter.add.constraint(this.constraint.head, this.constraint.burning, 0, 1);
    this.constraint.track.forEach((el)=>{

      this.scene.matter.add.constraint(this.constraint.corpus, el, 0, 1,{
        pointA: {
          x: 0,
          y: 0,
        },
        pointB: {
          x: el.body.cP.x,
          y: el.body.cP.y,
        },
        damping: 0,
        angularStiffness: 1
      });
    })
    this.constraint.track.forEach((el)=>{
    el.body.angle = this.constraint.corpus.body.angle;
    })
    this.cam = this.scene.cameras.main;
    this.cursorKeys = scene.input.keyboard.createCursorKeys();

    this.control.left = scene.input.keyboard.addKey('A');  // Get key object
    this.control.right = scene.input.keyboard.addKey('D');
    this.control.up = scene.input.keyboard.addKey('W');
    this.control.down = scene.input.keyboard.addKey('S');
    this.control.space = scene.input.keyboard.addKey('SPACE');

    this.timer = this.scene.time.addEvent({
      delay: 1000,                // ms
      callback: () => {
        this.pule()
      },
      //args: [],
      callbackScope: this,
      loop: true,
      paused:true
    });

  }



  trackAngle(){
    this.constraint.track.forEach((el)=>{
      el.body.angle = this.constraint.corpus.body.angle;
    })
  }

  draw() {
    this.trackAngle()
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
    this.constraint.track.forEach((el)=>{

      if(this.target !== null){
        el.play("run-track",true)
      }else {
        el.stop()
      }

    })

    if(this.constraint.corpus.body.highlight){
      this.highlight.clear()
      this.sensorHighlight.clear()
      this.highlight.lineStyle(4, 0xff0000, 1)
      this.highlight.strokeCircle(this.constraint.corpus.body.position.x, this.constraint.corpus.body.position.y, 100);
      this.sensorHighlight.lineStyle(4, 0x808080, 0.5);
      this.sensorHighlight.strokeCircle(this.constraint.head.body.position.x, this.constraint.head.body.position.y, this.radiusSensor);
    }else {
      this.highlight.clear()
      this.sensorHighlight.clear()
     // this.highlight.lineStyle(4, 0xff0000, 0)
     // this.sensorHighlight.lineStyle(4, 0x808080, 0);
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
      this.scene.matter.world.engine.world.bodies.filter((el) => el.label === this.namePule).forEach((pule) => {
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

  rotateHead(body,x, y,active = false){


    const dx = x - body.position.x;
    const dy = y - body.position.y;

    const angle = Math.atan2(dy, dx) + Math.PI / 2;
    const currentAngle = body.angle;
    // Рассчитываем разницу углов
    let angleDiff = angle - currentAngle;

    // Нормализуем разницу углов для корректного направления вращения
    angleDiff = Phaser.Math.Angle.Wrap(angleDiff);
    const angularSpeed = 0.2; // Подбери подходящее значение для скорости
    this.scene.matter.body.setAngularVelocity(body, angleDiff * angularSpeed);

    //this.scene.matter.body.setAngle(body, angle);
  }

  pule() {
          this.constraint.pule = this.scene.matter.add
            .sprite(this.constraint.sensor.headObject.body.position.x, this.constraint.sensor.headObject.body.position.y, 'pule', "pule", {label: this.namePule,attack:this.attack,bot:this.bot}).setScale(0.8)
            .setSensor(true).setDepth(2)
          .play("pule-departure-run").once('animationcomplete', () => {
            this.constraint.pule.setTexture("pule"); // Останавливаем анимацию
            });
          const dx = this.constraint.sensor.positionBot.x - this.constraint.sensor.headObject.body.position.x;
          const dy = this.constraint.sensor.positionBot.y - this.constraint.sensor.headObject.body.position.y;
          const angle = Math.atan2(dy, dx) + Math.PI / 2;
          this.scene.matter.body.setAngle(this.constraint.pule.body, angle);
          const length = Math.sqrt(dx * dx + dy * dy);
          const speed = 10; // Можно менять скорость
          const velocity = {x: (dx / length) * speed, y: (dy / length) * speed};
          const distance = Math.sqrt(dx * dx + dy * dy);
          const moveX = this.constraint.sensor.headObject.body.position.x + (dx / distance) * 50;
          const moveY = this.constraint.sensor.headObject.body.position.y + (dy / distance) * 50;
          this.constraint.pule.setPosition(moveX, moveY)
          this.scene.matter.setVelocity(this.constraint.pule.body, velocity.x, velocity.y);
  }

  liveDraw() {
    let healthWidth = this.constraint.corpus.body.health;
    this.healthBar.clear();
    this.healthBar.fillStyle(0x00ff00, 1);  // Зеленый
    if (healthWidth < 50) {
      this.healthBar.fillStyle(0xffff00, 1);
    }
    if (healthWidth < 20) {
      this.healthBar.fillStyle(0xff0000, 1);
    }
    if (healthWidth < 1){
      this.constraint.burning.play("burning",true)
    }
    this.healthBar.fillRect(this.constraint.corpus.body.position.x - 50, this.constraint.corpus.body.position.y - 80, healthWidth, 10);
  }

  takeDamage(body, amount) {
    body.health -= amount;
    if (body.health < 0) body.health = 0;
  }




}


