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

// @TODO: Add support for multiple layers
// later, multiple tilesets
// do something clever with transparent color to blend:
// need to maintain a list of the actual Sprite objects
// so we can attach physics attributes to them
// Tips for making proper tilesets in tiled.app:
// Ensure that objects have a width and height!
// Double click an object on the map and set its w/h in tiles!
// So a 1-tile image will have width = 1, height = 1
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

    // this must be called inside of draw2D.begin!
    Tileset.prototype.drawObjectLayer = function (draw2D, layer, playerPosition) {
        if (layer.objects) {
            var tileCount = layer.objects.length;
            for (var tileIndex = 0; tileIndex < tileCount; tileIndex += 1) {
                var layerObject = layer.objects[tileIndex];
                var tileGID = layerObject.gid;
                if (tileGID) {
                    var x = layerObject.x;
                    var y = layerObject.y - layerObject.height;
                    var drawObject = this.tileDrawObjectAtPos(x, y, tileGID, playerPosition);
                    if (drawObject) {
                        draw2D.draw(drawObject);
                    }
                }
            }
        }
    };

    // this must be called inside of draw2D.begin!
    Tileset.prototype.drawTileLayer = function (draw2D, layer, playerPosition) {
        var tileIndex = 0;
        var tileCount = this.mapWidth * this.mapHeight;

        if (layer.data) {
            for (; tileIndex < tileCount; tileIndex += 1) {
                var tileGID = layer.data[tileIndex];
                var drawObject = this.tileDrawObjectAtIndex(tileIndex, tileGID, playerPosition);
                if (drawObject) {
                    draw2D.draw(drawObject);
                }
            }
        }
    };

    Tileset.prototype.drawLayers = function (draw2D, playerPosition) {
        var _this = this;
        this.getLayers().forEach(function (layer) {
            if (layer.type === "tilelayer") {
                _this.drawTileLayer(draw2D, layer, playerPosition);
            } else if (layer.type === "objectgroup") {
                _this.drawObjectLayer(draw2D, layer, playerPosition);
            }
        });
    };

    Tileset.prototype.tileDrawObjectAtPos = function (x, y, tileGID, origin) {
        var tileSetIndex = tileGID - this.firstGID;
        var tileSetCol = tileSetIndex % this.imageCols;
        var tileSetRow = Math.floor(tileSetIndex / this.imageCols);

        // We expect [437, 161] for tile [0,0]
        var tileSetX = tileSetCol * (this.tileWidth + this.spacing) + this.margin;
        var tileSetY = tileSetRow * (this.tileHeight + this.spacing) + this.margin;

        var destX = x - origin[0];
        var destY = y - origin[1];

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

    // return an object to be passed to draw2D.draw() given a tile index
    // on a map (index 0 = top left of a map)
    Tileset.prototype.tileDrawObjectAtIndex = function (tileIndex, tileGID, origin) {
        var tileMapCol = tileIndex % this.mapWidth;
        var tileMapRow = Math.floor(tileIndex / this.mapWidth);
        var tileMapX = tileMapCol * this.tileWidth;
        var tileMapY = tileMapRow * this.tileHeight;

        var x = tileMapX;
        var y = tileMapY;

        return this.tileDrawObjectAtPos(x, y, tileGID, origin);
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
var canvas = document.getElementById("canvas");

TurbulenzEngine = WebGLTurbulenzEngine.create({
    canvas: canvas
});

//var ctx:any = canvas.getContext("2d");
//ctx.webkitImageSmoothingEnabled = false;
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
            tileset.drawLayers(draw2D, player.getPosition());
        }

        draw2D.end();

        graphicsDevice.endFrame();
    }
}

TurbulenzEngine.setInterval(update, 1000 / 60);
//# sourceMappingURL=fibers.js.map
