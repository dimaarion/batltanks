import Body from "./Body";

export default class Bot extends Body {
  target

  constructor(x, y, name, head = 'Gun_01', corpus = 'Hull_01') {
    super(x, y, name, head, corpus);
    this.bot = 1
    this.attack = 10
  }

  setup(scene) {
    super.setup(scene);

    this.target = { x: Phaser.Math.Between(100, 700), y: Phaser.Math.Between(100, 500) };

    this.scene.time.addEvent({
      delay: Phaser.Math.Between(1000,50000),
      loop: true,
      callback: () => {
        this.target = { x: Phaser.Math.Between(100, 700), y: Phaser.Math.Between(100, 500) };
      }
    });


  }

  takeDamageBot(body, amount) {
    body.health -= amount;
    if (body.health < 0) body.health = 0;
  }

  move(){
   // this.draw()
    this.trackAngle()
    this.liveDraw()
    this.movePule();
    if(this.constraint.corpus.body.health !== 0){
      this.moveToTarget(this.constraint.corpus, this.target, this.speed)
    }else {
      this.constraint.track.forEach((el) => {el.stop()})
    }

  }

  moveToTarget(tank, target, speed) {
let m = false
    const angleToTarget = Phaser.Math.Angle.Between(tank.x, tank.y, target.x, target.y) ;

    // Плавный поворот танка
    const angleDiff = Phaser.Math.Angle.Wrap(angleToTarget - (tank.rotation));

    tank.rotation += Phaser.Math.Clamp(angleDiff, -0.05, 0.05);

    // Движение вперёд
    if (Math.abs(angleDiff) < 0.2) { // Двигаемся только если почти повернулись
      const velocityX = Math.cos(tank.rotation - Math.PI / 2) * speed;
      const velocityY = Math.sin(tank.rotation - Math.PI / 2) * speed;
      tank.setVelocity(velocityX, velocityY);
      m = true
    }

    // Остановка, если достигли цели
    if (Phaser.Math.Distance.Between(tank.x, tank.y, target.x, target.y) < 10) {
      tank.setVelocity(0, 0);
      m = false
    }
    this.constraint.track.forEach((el) => {
      if (m) {
        el.play("run-track", true)
      } else {
        el.stop()
      }
    })

  }


}
