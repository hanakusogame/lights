"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
//メインのゲーム画面
var MainGame = /** @class */ (function (_super) {
    __extends(MainGame, _super);
    function MainGame(scene) {
        var _this = this;
        var tl = require("@akashic-extension/akashic-timeline");
        var timeline = new tl.Timeline(scene);
        var sizeW = 500;
        var sizeH = 360;
        _this = _super.call(this, { scene: scene, x: 0, y: 0, width: sizeW, height: sizeH, touchable: true }) || this;
        var bg = new g.FrameSprite({
            scene: scene,
            src: scene.assets["waku"],
            x: 120, y: 50,
            width: 260, height: 260,
            frames: [0, 1]
        });
        _this.append(bg);
        var base = new g.E({
            scene: scene,
            x: 10,
            y: 10
        });
        bg.append(base);
        var panels = [];
        var cursors = [];
        var panelNum = 3;
        var panelSize = 80;
        var panelCnt = 0;
        var stageNum = 0;
        var dx = [0, 0, 0, -1, 1];
        var dy = [0, -1, 1, 0, 0];
        var _loop_1 = function (y) {
            panels.push([]);
            cursors.push([]);
            var _loop_2 = function (x) {
                base.append(new g.Sprite({
                    scene: scene,
                    src: scene.assets["light"],
                    x: panelSize * x,
                    y: panelSize * y,
                    width: panelSize,
                    height: panelSize
                }));
                var panel = new g.Sprite({
                    scene: scene,
                    src: scene.assets["light"],
                    x: panelSize * x,
                    y: panelSize * y,
                    width: panelSize,
                    height: panelSize,
                    srcX: 80,
                    touchable: true
                });
                var cursor = new g.Sprite({
                    scene: scene,
                    src: scene.assets["light"],
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
                panel.pointDown.add(function () {
                    if (!scene.isStart || isStop)
                        return;
                    reverse(x, y);
                });
            };
            for (var x = 0; x < panelNum; x++) {
                _loop_2(x);
            }
        };
        for (var y = 0; y < panelNum; y++) {
            _loop_1(y);
        }
        //クリア文字
        var sprClear = new g.Sprite({
            scene: scene,
            src: scene.assets["clear"],
            height: 80,
            x: 150,
            y: 120
        });
        _this.append(sprClear);
        //５箇所反転
        var reverse = function (x, y) {
            var _loop_3 = function (i) {
                var px = x + dx[i];
                var py = y + dy[i];
                if (px >= 0 && py >= 0 && px < panelNum && py < panelNum) {
                    var panel_1 = panels[py][px];
                    var num_1 = 1 - panel_1.tag;
                    panel_1.tag = num_1;
                    var cursor_1 = cursors[py][px];
                    cursor_1.show();
                    timeline.create().every(function (a, b) {
                        if (num_1 === 0) {
                            panel_1.opacity = 1 - b;
                        }
                        else {
                            panel_1.opacity = b;
                        }
                        panel_1.modified();
                    }, 100).call(function () {
                        cursor_1.hide();
                    });
                    if (num_1 === 0) {
                        panelCnt--;
                    }
                    else {
                        panelCnt++;
                    }
                }
            };
            for (var i = 0; i < 5; i++) {
                _loop_3(i);
            }
            scene.playSound("se_move");
            //すべて点灯
            if (panelCnt === panelNum * panelNum) {
                scene.addScore(1000);
                sprClear.show();
                isStop = true;
                bg.frameNumber = 1;
                bg.modified();
                timeline.create().wait(1500).call(function () {
                    if (scene.isStart) {
                        next();
                    }
                });
                scene.playSound("se_clear");
            }
        };
        var isStop = false;
        _this.pointDown.add(function (e) {
            if (!scene.isStart || isStop)
                return;
        });
        _this.pointMove.add(function (e) {
            if (!scene.isStart || isStop)
                return;
        });
        _this.pointUp.add(function (e) {
            if (!scene.isStart || isStop)
                return;
        });
        var next = function () {
            sprClear.hide();
            panelCnt = 0;
            for (var y = 0; y < panelNum; y++) {
                var _loop_4 = function (x) {
                    var panel = panels[y][x];
                    var num = scene.random.get(0, 1);
                    if (panelCnt === panelNum * panelNum - 1)
                        num = 0;
                    panel.tag = num;
                    panel.opacity = 0;
                    panel.modified();
                    timeline.create().every(function (a, b) {
                        if (num === 1) {
                            panel.opacity = b;
                        }
                        panel.modified();
                    }, 200);
                    panelCnt += num;
                    var cursor = cursors[y][x];
                    cursor.hide();
                };
                for (var x = 0; x < panelNum; x++) {
                    _loop_4(x);
                }
            }
            stageNum++;
            scene.setStage(stageNum);
            isStop = false;
            bg.frameNumber = 0;
            bg.modified();
        };
        //終了イベント
        scene.finishEvent = function () {
            if (!isStop) {
                scene.addScore(panelCnt * 100);
                bg.frameNumber = 1;
                bg.modified();
                scene.playSound("se_clear");
            }
        };
        //リセット
        _this.reset = function () {
            stageNum = 0;
            next();
        };
        return _this;
    }
    return MainGame;
}(g.E));
exports.MainGame = MainGame;
