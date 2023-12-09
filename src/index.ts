import * as Phaser from "phaser";
class MainScene extends Phaser.Scene {
  private draggableObjects: Phaser.GameObjects.Sprite[] = [];
  private dropZone!: Phaser.GameObjects.Zone;

  constructor() {
    super({ key: "MainScene" });
  }

  preload() {
    this.load.image("banana", "assets/banana.png");
    this.load.image("background", "assets/bg.png");
  }

  create() {
    this.add.image(0, 0, "background").setOrigin(0, 0);
    const blockWidth = 100; // Set the width of the blocks
    const blockHeight = 100; // Set the height of the blocks
    // Create draggable items
    for (let i = 0; i < 3; i++) {
      const draggableObject = this.add
        .sprite(100 + i * 150, 100, "banana")
        .setInteractive({ draggable: true });

      draggableObject.displayWidth = blockWidth;
      draggableObject.displayHeight = blockHeight;

      this.draggableObjects.push(draggableObject);

      this.input.setDraggable(draggableObject);

      this.input.on(
        "dragstart",
        (
          pointer: Phaser.Input.Pointer,
          gameObject: Phaser.GameObjects.GameObject
        ) => {}
      );

      this.input.on(
        "drag",
        (
          pointer: Phaser.Input.Pointer,
          gameObject: Phaser.GameObjects.GameObject,
          dragX: number,
          dragY: number
        ) => {
          if (gameObject instanceof Phaser.GameObjects.Sprite) {
            gameObject.x = dragX;
            gameObject.y = dragY;
          }
        }
      );

      this.input.on("dragend", () => {});
    }

    // drop zone
    this.dropZone = this.add
      .zone(400, 400, 600, 200)
      .setRectangleDropZone(600, 200);

    this.input.on(
      "drop",
      (
        pointer: Phaser.Input.Pointer,
        gameObject: Phaser.GameObjects.GameObject
      ) => {
        if (
          gameObject instanceof Phaser.GameObjects.Sprite &&
          this.dropZone.getBounds().contains(gameObject.x, gameObject.y)
        ) {
          const gridSpacing = 100;
          const snappedX = Math.round(gameObject.x / gridSpacing) * gridSpacing;
          const snappedY = Math.round(gameObject.y / gridSpacing) * gridSpacing;

          gameObject.x = snappedX;
          gameObject.y = snappedY;
        }
      }
    );
  }
}

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 500,
  scene: MainScene,
  scale: {
    mode: Phaser.Scale.ScaleModes.RESIZE,
    autoCenter: Phaser.Scale.Center.CENTER_BOTH,
  },
};

const game = new Phaser.Game(config);
