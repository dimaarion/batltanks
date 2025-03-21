import Phaser from "phaser";
export default class Preload extends Phaser.Scene{
  constructor() {
    super('Preloader');
  }


  preload() {
    this.load.image('tiles', './img/sprites/location_1.png');
    this.load.tilemapTiledJSON('map', './img/tiled/location_1.json');


    this.load.image("Hull_01", './img/sprites/PNG/Hulls_Color_A/Hull_01.png');
    this.load.image("Gun_01", './img/sprites/PNG/Weapon_Color_A/Gun_01.png');
    this.load.image("Gun_01_A", './img/sprites/PNG/Weapon_Color_A/Gun_01_A.png');
    this.load.image("pule", './img/sprites/pule.png');
    this.load.spritesheet('pule-blast', './img/sprites/pule-blast.png', {
      frameWidth: 64,
      frameHeight: 64
    });
    this.load.spritesheet('pule-departure', './img/sprites/pule-departure.png', {
      frameWidth: 64,
      frameHeight: 64
    });
    this.load.spritesheet('image-point', './img/sprites/pule-on.png', {
      frameWidth: 64,
      frameHeight: 64
    });





  }

  create(){
    this.scene.start('Start');
    this.anims.create({
      key: 'runPoint',
      frames: this.anims.generateFrameNumbers('image-point', {start: 0, end: 3}),
      frameRate: 5,
      repeat: -1
    });
  }

}
