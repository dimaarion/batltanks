import * as Phaser from "phaser";

export default class Body {
  x = 200
  y = 200
  scene;
  keyObjects
  corpus
  velocity
  cam
  speed = 5
  constraint = {
    head: null,
    muzzle: null,
    corpus: null
  }

  control = {
    left: false,
    right: false,
    up: false,
    down: false
  }

  constructor(x, y) {
    this.x = x;
    this.y = y;
  }


  setup(scene) {
    this.scene = scene;
    const M = Phaser.Physics.Matter.Matter;

    this.constraint.corpus = this.scene.matter.add.image(this.x, this.y, 'Hull_01').setRectangle(200, 200);
    this.constraint.head = this.scene.matter.add.image(this.x, this.y, 'Gun_01').setSensor(true);

    this.scene.matter.add.constraint(this.constraint.corpus, this.constraint.head, 0.01, 1, {
      pointA: {
        x: 0,
        y: 50,
      },
      pointB: {
        x: 0,
        y: 50,
      },
      damping: 0,
      angularStiffness: 1
    })


    let constraint = this.constraint;
    let velocity = 0;
    this.scene.input.on('pointermove', function (pointer, currentlyOver) {
      const dx = pointer.x - constraint.head.body.position.x;
      const dy = pointer.y - constraint.head.body.position.y;

      // Вычисляем угол в радианах
      const angle = Math.atan2(dy, dx) + Math.PI / 2;

      // Устанавливаем угол объекту
      scene.matter.body.setAngle(constraint.head.body, angle);
      const speed = 18; // Можно менять скорость
      const velocity = { x: (dx / length) * speed, y: (dy / length) * speed };
      const distance = Math.sqrt(dx * dx + dy * dy);

    }, this);

    this.cam = this.scene.cameras.main;
    this.cam.startFollow(this.constraint.corpus.body, true);
    this.cam.setBounds(0, 0, this.scene.widthInPixels, this.scene.heightInPixels);
    this.scene.cameras.main.setBounds(0, 0, this.scene.map.widthInPixels, this.scene.map.heightInPixels);
    this.scene.matter.world.setBounds(0, 0, this.scene.map.widthInPixels, this.scene.map.heightInPixels);






    this.control.left = scene.input.keyboard.addKey('A');  // Get key object
    this.control.right = scene.input.keyboard.addKey('D');
    this.control.up = scene.input.keyboard.addKey('W');

  }

  draw() {
    if (this.control.left.isDown) {
      this.scene.matter.setAngularVelocity(this.constraint.corpus.body, -0.01)
    }
    if (this.control.right.isDown) {
      this.scene.matter.setAngularVelocity(this.constraint.corpus.body, 0.01)
    }
    if (this.control.up.isDown) {
      const vx = this.speed * Math.cos(this.constraint.corpus.body.angle + Math.PI / 2);
      const vy = this.speed * Math.sin(this.constraint.corpus.body.angle + Math.PI / 2);
      this.scene.matter.setVelocity(this.constraint.corpus.body, -vx,-vy);
    }


  }
}
