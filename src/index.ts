import * as Phaser from "phaser";

class Rack extends Phaser.GameObjects.GameObject {
  sprite: Phaser.GameObjects.Sprite;
  initialPosition: Phaser.Math.Vector2;
  capacity: number;
  currentMiners: number;
  miners: Miner[];
  constructor(scene: MainScene, x: number, y: number, image: string, capacity) {
    super(scene, "Rack");
    this.capacity = capacity;
    this.currentMiners = 0;
    this.miners = [];
    this.sprite = scene.add
      .sprite(x, y, image)
      .setInteractive({ draggable: true });
    this.sprite.displayHeight = 40;
    this.sprite.displayWidth = 30;
    scene.panel.add(this.sprite);

    // Set up events for drag start and end
    this.sprite.on("dragstart", () => {
      this.initialPosition = new Phaser.Math.Vector2(
        this.sprite.x,
        this.sprite.y
      );

      this.sprite.setScale(1.2);
    });

    this.sprite.on("dragend", () => {
      if (!this.isValidToDrop(scene)) {
        this.sprite.setScale(0.5);
        // Return to initial position if not dropped on the drop zone
        this.sprite.x = this.initialPosition.x;
        this.sprite.y = this.initialPosition.y;
      } else {
        this.sprite.setScale(1.3);
        scene.racks.push(this);
      }
    });

    scene.input.setDraggable(this.sprite);
  }
  private isValidToDrop(scene: MainScene): boolean {
    if (scene.racks.length >= 8) return false;

    // check overlap
    const newRackBounds = this.sprite.getBounds();
    const overlap = scene.racks.some((rack: Rack) => {
      if (rack !== this) {
        const existingRackBounds = rack.sprite.getBounds();
        return Phaser.Geom.Intersects.RectangleToRectangle(
          newRackBounds,
          existingRackBounds
        );
      }
      return false;
    });

    if (overlap) {
      return false;
    }
    // Check if the rack overlap with the room drop zone
    const rackBounds = this.sprite.getBounds();
    const dropZoneBounds = scene.roomDropZone.getBounds();
    return Phaser.Geom.Intersects.RectangleToRectangle(
      rackBounds,
      dropZoneBounds
    );
  }

  dropMiner(miner: Miner) {
    if (this.miners.length < this.capacity) {
      this.miners.push(miner);
    }
  }
}

class Miner extends Phaser.GameObjects.GameObject {
  sprite: Phaser.GameObjects.Sprite;

  constructor(scene: MainScene, x: number, y: number, image: string) {
    super(scene, "Miner");
    this.sprite = scene.add
      .sprite(x, y, image)
      .setInteractive({ draggable: true });
    this.sprite.displayHeight = 30;
    this.sprite.displayWidth = 70;

    scene.panel.add(this.sprite);

    this.sprite.on("dragend", () => {
      this.checkDrop(scene);
    });

    scene.input.setDraggable(this.sprite);
  }

  private checkDrop(scene: MainScene) {
    // Check if the miner is dropped on any rack in the drop zone
    const droppedOnRack: Rack = scene.racks.find((rack: Rack) => {
      const minerBounds = this.sprite.getBounds();
      const rackBounds = rack.sprite.getBounds();
      const overlappingMiner = rack.miners.find(
        (miner) =>
          miner !== this &&
          Phaser.Geom.Intersects.RectangleToRectangle(
            miner.sprite.getBounds(),
            minerBounds
          )
      );
      return (
        Phaser.Geom.Intersects.RectangleToRectangle(minerBounds, rackBounds) &&
        !overlappingMiner &&
        rack.miners.length < rack.capacity
      );
    });

    if (droppedOnRack) {
      droppedOnRack.dropMiner(this);
    } else {
      // Return to initial position if not dropped on a rack
      this.sprite.x = this.sprite.input.dragStartX;
      this.sprite.y = this.sprite.input.dragStartY;
    }
  }
}

type RackType = {
  name: string;
  capacity: number;
};
class MainScene extends Phaser.Scene {
  public roomDropZone!: Phaser.GameObjects.Zone;

  panel: Phaser.GameObjects.Container;
  racksInStore: RackType[] = [];
  minersInStore: string[] = [];
  racks: Rack[] = [];
  miners: Phaser.GameObjects.Image[];

  private gameWidth: number;
  private gameHeight: number;

  constructor() {
    super({ key: "MainScene" });
    this.racks = [];
    this.miners = [];
    this.racksInStore = [
      { name: "rack_3", capacity: 3 },
      { name: "rack_3", capacity: 3 },
      { name: "rack_3", capacity: 3 },
      { name: "rack_3", capacity: 3 },
      { name: "rack_4", capacity: 4 },
      { name: "rack_4", capacity: 4 },
      { name: "rack_4", capacity: 4 },
      { name: "rack_4", capacity: 4 },
      { name: "rack_4", capacity: 4 },
    ];

    this.minersInStore = [
      "aurum",
      "cp_106",
      "crypto_neko",
      "dj_roller",
      "game_boy",
      "shifter",
      "think_tronik",
    ];
  }

  preload() {
    this.gameWidth = this.sys.game.config.width as number;
    this.gameHeight = this.sys.game.config.height as number;

    this.load.image("avatar", "assets/avatar.png");
    this.load.image("background", "assets/bg.png");
    //racks
    this.load.image("rack_3", "assets/rack_3.png");
    this.load.image("rack_4", "assets/rack_4.png");

    //miners
    this.load.image("aurum", "assets/aurum.png");
    this.load.image("cp_106", "assets/cp_106.png");
    this.load.image("crypto_neko", "assets/crypto_neko.png");
    this.load.image("dj_roller", "assets/dj_roller.png");
    this.load.image("etherilliant", "assets/etherilliant.png");
    this.load.image("first_class", "assets/first_class.png");
    this.load.image("game_boy", "assets/game_boy.png");
    this.load.image("shifter", "assets/shifter.png");
    this.load.image("steamwheedle", "assets/steamwheedle.png");
    this.load.image("think_tronik", "assets/think_tronik.png");
  }

  create() {
    var background = this.add.image(0, 0, "background").setOrigin(0, 0);
    var gameWidth = Number(this.sys.game.config.width);
    var gameHeight = Number(this.sys.game.config.height);
    background.setScale(
      gameWidth / background.width,
      gameHeight / background.height
    );

    // Add Avatar
    var avatar = this.add.image(200, 424, "avatar");
    avatar.setOrigin(0.5, 0.5);
    avatar.displayHeight = 55;
    avatar.displayWidth = 55;

    //add bottom panel
    this.panel = this.add.container(0, gameHeight - 60);
    const panelBackground = this.add.graphics();
    panelBackground.fillStyle(0x222222, 0.7);
    panelBackground.fillRect(0, 0, gameWidth, 60);
    this.panel.add(panelBackground);

    //racks
    this.racksInStore.forEach((rack, i) => {
      new Rack(this, 40 + i * 40, 30, rack.name, rack.capacity);
    });

    //miners
    this.minersInStore.forEach((miner, i) => {
      new Miner(this, 80 + this.racksInStore.length * 40 + i * 80, 30, miner);
    });

    this.setupDragInput();
    this.createRoomDropZone();
  }

  setupDragInput() {
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

  createRoomDropZone() {
    const dropZoneX = this.gameWidth / 3;

    this.roomDropZone = this.add
      .zone(dropZoneX, 0, this.gameWidth / 2, this.gameHeight - 60)
      .setOrigin(0, 0);
    this.roomDropZone.setInteractive();

    this.input.on("gameobjectover", (pointer, gameObject) => {
      if (gameObject === this.roomDropZone) {
      }
    });

    this.input.on("gameobjectout", (pointer, gameObject) => {
      if (gameObject === this.roomDropZone) {
      }
    });

    this.input.on("drop", (pointer, gameObject) => {
      if (gameObject === this.roomDropZone) {
      }
    });
  }
}

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: window.innerWidth - 300,
  height: window.innerHeight,
  parent: "room-container",
  scene: MainScene,
  scale: {
    mode: Phaser.Scale.ScaleModes.RESIZE,
    autoCenter: Phaser.Scale.Center.CENTER_BOTH,
  },
};

const game = new Phaser.Game(config);
