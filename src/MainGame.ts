import { MainScene } from "./MainScene";
declare function require(x: string): any;

//メインのゲーム画面
export class MainGame extends g.E {
	public reset: () => void;
	public setMode: (num: number) => void;

	constructor(scene: MainScene) {
		const tl = require("@akashic-extension/akashic-timeline");
		const timeline = new tl.Timeline(scene);
		const sizeW = 500;
		const sizeH = 360;
		super({ scene: scene, x: 0, y: 0, width: sizeW, height: sizeH, touchable: true });

		const bg = new g.FrameSprite({
			scene: scene,
			src: scene.assets["waku"] as g.ImageAsset,
			x: 120, y: 50,
			width: 260, height: 260,
			frames:[0,1]
		});
		this.append(bg);

		const base = new g.E({
			scene: scene,
			x: 10,
			y: 10
		});
		bg.append(base);

		const panels: g.Sprite[][] = [];
		const cursors: g.Sprite[][] = [];
		const panelNum = 3;
		const panelSize = 80;
		let panelCnt = 0;
		let stageNum = 0;
		const dx = [0, 0, 0, -1, 1];
		const dy = [0, -1, 1, 0, 0];
		for (let y = 0; y < panelNum; y++) {
			panels.push([]);
			cursors.push([]);
			for (let x = 0; x < panelNum; x++) {
				base.append(new g.Sprite({
					scene: scene,
					src: scene.assets["light"] as g.ImageAsset,
					x: panelSize * x,
					y: panelSize * y,
					width: panelSize,
					height: panelSize
				}));
				const panel = new g.Sprite({
					scene: scene,
					src: scene.assets["light"] as g.ImageAsset,
					x: panelSize * x,
					y: panelSize * y,
					width: panelSize,
					height: panelSize,
					srcX: 80,
					touchable: true
				});

				const cursor = new g.Sprite({
					scene: scene,
					src: scene.assets["light"] as g.ImageAsset,
					x: panelSize * x,
					y: panelSize * y,
					width: panelSize,
					height: panelSize,
					srcX: 160
				});
				cursors[y].push(cursor);
				base.append(cursor);

				panels[y].push(panel);
				base.append(panel);
				panel.pointDown.add(() => {
					if (!scene.isStart || isStop) return;
					reverse(x, y);
				});
			}
		}

		//クリア文字
		const sprClear = new g.Sprite({
			scene: scene,
			src: scene.assets["clear"],
			height: 80,
			x: 150,
			y: 120
		});
		this.append(sprClear);

		//５箇所反転
		const reverse = (x: number, y: number) => {
			for (let i = 0; i < 5; i++) {
				const px = x + dx[i];
				const py = y + dy[i];
				if (px >= 0 && py >= 0 && px < panelNum && py < panelNum) {
					const panel = panels[py][px];
					const num = 1 - panel.tag;
					panel.tag = num;

					const cursor = cursors[py][px];
					cursor.show();

					timeline.create().every((a: number, b: number) => {
						if (num === 0) {
							panel.opacity = 1 - b;
						} else {
							panel.opacity = b;
						}
						panel.modified();
					}, 100).call(() => {
						cursor.hide();
					});

					if (num === 0) {
						panelCnt--;
					} else {
						panelCnt++;
					}
				}
			}

			scene.playSound("se_move");

			//すべて点灯
			if (panelCnt === panelNum * panelNum) {
				scene.addScore(1000);
				sprClear.show();
				isStop = true;
				bg.frameNumber = 1;
				bg.modified();
				timeline.create().wait(1500).call(() => {
					if (scene.isStart) {
						next();
					}
				});

				scene.playSound("se_clear");
			}
		};

		let isStop = false;
		this.pointDown.add((e) => {
			if (!scene.isStart || isStop) return;
		});

		this.pointMove.add((e) => {
			if (!scene.isStart || isStop) return;
		});

		this.pointUp.add((e) => {
			if (!scene.isStart || isStop) return;
		});

		const next = () => {
			sprClear.hide();
			panelCnt = 0;
			for (let y = 0; y < panelNum; y++) {
				for (let x = 0; x < panelNum; x++) {
					const panel = panels[y][x];
					let num = scene.random.get(0, 1);
					if (panelCnt === panelNum * panelNum - 1) num = 0;
					panel.tag = num;
					panel.opacity = 0;
					panel.modified();
					timeline.create().every((a: number, b: number) => {
						if (num === 1) {
							panel.opacity = b;
						}
						panel.modified();
					}, 200);

					panelCnt += num;
					const cursor = cursors[y][x];
					cursor.hide();
				}
			}
			stageNum++;
			scene.setStage(stageNum);
			isStop = false;
			bg.frameNumber = 0;
			bg.modified();
		};

		//終了イベント
		scene.finishEvent = () => {
			if (!isStop) {
				scene.addScore(panelCnt * 100);
				bg.frameNumber = 1;
				bg.modified();
				scene.playSound("se_clear");
			}
		};

		//リセット
		this.reset = () => {
			stageNum = 0;
			next();
		};

	}
}
