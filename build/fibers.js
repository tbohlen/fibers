var Player = (function () {
    function Player() {
        this.SPEED = 2;
        this.position = [0, 0];
        this.vx = 0;
    }
    Player.prototype.getPosition = function () {
        return this.position;
    };

    Player.prototype.stopWalking = function () {
        this.vx = 0;
    };

    Player.prototype.walkLeft = function () {
        this.vx = -1 * this.SPEED;
    };

    Player.prototype.walkRight = function () {
        this.vx = this.SPEED;
    };

    Player.prototype.update = function () {
        this.position[0] += this.vx;
        if (this.position[0] < 0) {
            this.position[0] = 0;
        }
    };
    return Player;
})();
var BASE_MAP_URL = "assets/maps/";

var Tileset = (function () {
    function Tileset(mapFilename, graphicsDevice, engine) {
        var _this = this;
        this.mapLoadedCallback = function (jsonData) {
            if (jsonData) {
                var mapData = JSON.parse(jsonData);
                _this.mapWidth = mapData.width;
                _this.mapHeight = mapData.height;
                _this.tileWidth = mapData.tilewidth;
                _this.tileHeight = mapData.tileheight;
                _this.mapData = mapData;

                // setup tiles
                var tileSet = mapData.tilesets[0];
                var imageHeight = tileSet.imageheight;
                var imageWidth = tileSet.imagewidth;
                _this.margin = tileSet.margin;
                _this.spacing = tileSet.spacing;
                _this.imageRows = Math.floor((imageHeight - _this.margin) / (_this.tileHeight + _this.spacing));
                _this.imageCols = Math.floor((imageWidth - _this.margin) / (_this.tileWidth + _this.spacing));
                _this.firstGID = tileSet.firstgid; // global id of tilekk
                _this.tileSet = tileSet;

                // setup texture
                var textureURL = BASE_MAP_URL + tileSet.image;

                graphicsDevice.createTexture({
                    src: textureURL,
                    mipmaps: true,
                    onload: function (texture) {
                        if (texture) {
                            _this.mapTexture = texture;
                        }
                    }
                });
            }
        };

        engine.request(BASE_MAP_URL + mapFilename, this.mapLoadedCallback);
    }
    Tileset.prototype.isLoaded = function () {
        return (this.mapData != null);
    };

    Tileset.prototype.getLayers = function () {
        return this.mapData.layers;
    };

    // return an object to be passed to draw2D.draw() given a tile index
    // on a map (index 0 = top left of a map)
    Tileset.prototype.tileDrawObject = function (tileIndex, tileGID, origin) {
        var tileMapCol = tileIndex % this.mapWidth;
        var tileMapRow = Math.floor(tileIndex / this.mapWidth);
        var tileMapX = tileMapCol * this.tileWidth;
        var tileMapY = tileMapRow * this.tileHeight;

        var tileSetIndex = tileGID - this.firstGID;
        var tileSetCol = tileSetIndex % this.imageCols;
        var tileSetRow = Math.floor(tileSetIndex / this.imageCols);

        // We expect [437, 161] for tile [0,0]
        var tileSetX = tileSetCol * (this.tileWidth + this.spacing) + this.margin;
        var tileSetY = tileSetRow * (this.tileHeight + this.spacing) + this.margin;

        var destX = tileMapX - origin[0];
        var destY = tileMapY - origin[1];

        if (this.mapTexture) {
            return {
                texture: this.mapTexture,
                sourceRectangle: [
                    tileSetX, tileSetY,
                    tileSetX + this.tileWidth,
                    tileSetY + this.tileHeight],
                destinationRectangle: [
                    destX, destY,
                    destX + this.tileWidth,
                    destY + this.tileHeight]
            };
        } else {
            return null;
        }
    };
    return Tileset;
})();
/// <reference path="jslib-modular/canvas.d.ts" />
/// <reference path="jslib-modular/debug.d.ts" />
/// <reference path="jslib-modular/fontmanager.d.ts" />
/// <reference path="jslib-modular/physics2d.d.ts" />
/// <reference path="jslib-modular/tzdraw2d.d.ts" />
/// <reference path="jslib-modular/turbulenz.d.ts" />
/// <reference path="jslib-modular/tzdraw2d.d.ts" />
/// <reference path="jslib-modular/utilities.d.ts" />
/// <reference path="jslib-modular/vmath.d.ts" />
/// <reference path="player.ts"/>
/// <reference path="tileset.ts"/>
/*global WebGLTurbulenzEngine*/
TurbulenzEngine = WebGLTurbulenzEngine.create({
    canvas: document.getElementById("canvas")
});

var graphicsDevice = TurbulenzEngine.createGraphicsDevice({});
var inputDevice = TurbulenzEngine.createInputDevice({});

var draw2D = Draw2D.create({
    graphicsDevice: graphicsDevice
});
var success = draw2D.configure({
    scaleMode: 'scale',
    viewportRectangle: [0, 0, 320, 240]
});

var bgColor = [0.0, 0.0, 0.0, 1.0];

var viewport = draw2D.getScreenSpaceViewport();

var tileset = new Tileset("test.json", graphicsDevice, TurbulenzEngine);

var player = new Player();

inputDevice.addEventListener("keydown", function (keycode) {
    if (keycode === inputDevice.keyCodes.LEFT) {
        player.walkLeft();
    } else if (keycode === inputDevice.keyCodes.RIGHT) {
        player.walkRight();
    } else {
        console.log(keycode);
    }
});

inputDevice.addEventListener("keyup", function (keycode) {
    player.stopWalking();
});

function update() {
    if (graphicsDevice.beginFrame()) {
        player.update();

        graphicsDevice.clear(bgColor, 1.0);

        draw2D.begin();

        if (tileset.isLoaded()) {
            tileset.getLayers().forEach(function (layer) {
                if (layer.data) {
                    var tileIndex = 0;
                    for (; tileIndex < tileset.mapWidth * tileset.mapHeight; tileIndex += 1) {
                        var tileGID = layer.data[tileIndex];
                        var drawObject = tileset.tileDrawObject(tileIndex, tileGID, player.getPosition());
                        if (drawObject) {
                            draw2D.draw(drawObject);
                        }
                    }
                }
            });
        }

        draw2D.end();

        graphicsDevice.endFrame();
    }
}

TurbulenzEngine.setInterval(update, 1000 / 60);
