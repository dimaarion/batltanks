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
  cam
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
    live: null
  }
  headImg
  corpusImg
  healthBar
  cursorKeys
  control = {
    left: false,
    right: false,
    up: false,
    down: false
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
    this.scene = scene;

    this.healthBar = this.scene.add.graphics();
    this.healthBar.fillStyle(0x00ff00, 1);
    this.healthBar.fillRect(this.x - 50, this.y - 80, 100, 10);
    this.healthBar.setDepth(100);

    const M = Phaser.Physics.Matter.Matter;
    this.constraint.corpus = this.scene.matter.add.sprite(this.x, this.y, this.corpusImg, 0, {label: "tank" + this.name}).setRectangle(200, 200).setScale(0.7).setDepth(1);
    this.constraint.head = this.scene.matter.add.sprite(this.x, this.y, this.headImg, 0, {label: "tank" + this.name}).setSensor(true).setScale(0.7).setDepth(2);
    this.constraint.corpus.health = this.live;
    this.constraint.main = this.scene.matter.add.constraint(this.constraint.corpus, this.constraint.head, 0.01, 1, {
      pointA: {
        x: 0,
        y: 40,
      },
      pointB: {
        x: 0,
        y: 40,
      },
      damping: 0,
      angularStiffness: 1
    }).label = "tank"


    this.cam = this.scene.cameras.main;
    this.cam.startFollow(this.constraint.corpus, true);
    this.cam.setBounds(0, 0, this.scene.widthInPixels, this.scene.heightInPixels);
    this.scene.cameras.main.setBounds(0, 0, this.scene.map.widthInPixels, this.scene.map.heightInPixels);
    this.scene.matter.world.setBounds(0, 0, this.scene.map.widthInPixels, this.scene.map.heightInPixels);

    this.cursorKeys = scene.input.keyboard.createCursorKeys();

    this.control.left = scene.input.keyboard.addKey('A');  // Get key object
    this.control.right = scene.input.keyboard.addKey('D');
    this.control.up = scene.input.keyboard.addKey('W');
    this.control.down = scene.input.keyboard.addKey('S');

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

    this.scene.input.on('pointerdown', function (pointer) {
      this.constraint.pule = this.scene.matter.add
        .sprite(this.constraint.head.body.position.x, this.constraint.head.body.position.y, 'pule', "pule", {label: "pule"}).setScale(0.8)
        .setSensor(true).play("pule-departure-run").once('animationcomplete', () => {
          this.constraint.pule.setTexture("pule"); // Останавливаем анимацию
        });
      let touchX = pointer.x;
      let touchY = pointer.y;
      this.worldXY = pointer.positionToCamera(this.cam);
      const dx = this.worldXY.x - this.constraint.head.body.position.x;
      const dy = this.worldXY.y - this.constraint.head.body.position.y;
      const angle = Math.atan2(dy, dx) + Math.PI / 2;
      this.scene.matter.body.setAngle(this.constraint.pule.body, angle);
      const length = Math.sqrt(dx * dx + dy * dy);
      const speed = 10; // Можно менять скорость
      const velocity = {x: (dx / length) * speed, y: (dy / length) * speed};
      const distance = Math.sqrt(dx * dx + dy * dy);
      const moveX = this.constraint.head.body.position.x + (dx / distance) * 110;
      const moveY = this.constraint.head.body.position.y + (dy / distance) * 110;
      this.constraint.pule.setPosition(moveX, moveY)
      this.scene.matter.setVelocity(this.constraint.pule.body, velocity.x, velocity.y);
    }, this);


    this.scene.matter.world.on('collisionstart', (event) => {
      event.pairs.forEach((pair) => {
        if (pair.bodyB.gameObject && pair.bodyB.label === "pule") {
          pair.bodyB.gameObject.play("pule-blast-run").once("animationcomplete", () => {
            this.scene.matter.setVelocity(pair.bodyB, 0, 0);

          })
        }
        if (pair.bodyB.label === "pule" && pair.bodyA.label === "tank" + this.name) {
          this.takeDamage(this.attack)
        }

      });
    });


  }

  draw() {


    let pointer = this.scene.input.activePointer;
    let worldXY = pointer.positionToCamera(this.cam);

    const dx = worldXY.x - this.constraint.corpus.body.position.x;
    const dy = worldXY.y - this.constraint.corpus.body.position.y;

    // Вычисляем угол в радианах
    const angle = Math.atan2(dy, dx) + Math.PI / 2;

    // Устанавливаем угол объекту
    this.scene.matter.body.setAngle(this.constraint.head.body, angle);
    const speed = 18; // Можно менять скорость
    const velocity = {x: (dx / length) * speed, y: (dy / length) * speed};
    const distance = Math.sqrt(dx * dx + dy * dy);


    if (this.control.left.isDown || this.cursorKeys.left.isDown) {
      this.scene.matter.setAngularVelocity(this.constraint.corpus.body, -this.rotations)
    }
    if (this.control.right.isDown || this.cursorKeys.right.isDown) {
      this.scene.matter.setAngularVelocity(this.constraint.corpus.body, this.rotations)
    }
    const vx = this.speed * Math.cos(this.constraint.corpus.body.angle + Math.PI / 2);
    const vy = this.speed * Math.sin(this.constraint.corpus.body.angle + Math.PI / 2);
    if (this.control.up.isDown || this.cursorKeys.up.isDown) {
      this.scene.matter.setVelocity(this.constraint.corpus.body, -vx, -vy);
    }
    if (this.control.down.isDown || this.cursorKeys.down.isDown) {
      this.scene.matter.setVelocity(this.constraint.corpus.body, vx, vy);
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


