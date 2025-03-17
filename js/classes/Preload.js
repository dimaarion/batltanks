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
  }

  create(){
    this.scene.start('Start');
  }

}
