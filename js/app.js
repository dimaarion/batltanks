import Preload from "./classes/Preload";
import PhaserMatterCollisionPlugin from "phaser-matter-collision-plugin";
import StartScene from "./classes/StartScene";
import Location_1 from "./classes/Location_1";





const config = {
  type: Phaser.AUTO,
  parent: 'Tanks',
  width: window.innerWidth,
  height: window.innerHeight,
  backgroundColor: "#fff",
  physics: {
    scene:[
      {
        plugin: PhaserMatterCollisionPlugin, // The plugin class
        key: "matterCollision", // Where to store in Scene.Systems, e.g. scene.sys.matterCollision
        mapping: "matterCollision" // Where to store in the Scene, e.g. scene.matterCollision

      }
    ],
    default: 'matter',
    matter: {
      debug: true,
      gravity: {
        x: 0,
        y: 0
      },
    }
  },
  audio: {
    disableWebAudio: false
  },
  scene: [Preload,StartScene,Location_1],
};

const game = new Phaser.Game(config);

window.addEventListener('resize', event => {
  console.log(window.innerWidth)
  game.scale.resize(window.innerWidth, window.innerHeight);
}, false);

