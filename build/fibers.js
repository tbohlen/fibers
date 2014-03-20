var Player = (function () {
    function Player(playerSprite, playerObject, position) {
        this.SPEED = 0.1;
        this.sprite = null;
        this.body = null;
        this.sprite = playerSprite;
        this.body = playerObject;
        this.body.setPosition(position);
    }
    // sets the texture used to display the character. If no texture is null, displays a white box
    Player.prototype.setTexture = function (texture) {
        if (this.sprite != null) {
            this.sprite.setTexture(texture);
        }
    };

    // just calls into sprite
    Player.prototype.setTextureRectangle = function (params) {
        if (this.sprite != null) {
            this.sprite.setTextureRectangle(params);
        }
    };

    Player.prototype.getPosition = function () {
        return this.body.getPosition();
    };

    Player.prototype.stopWalking = function () {
        var vel = this.body.getVelocity();
        this.body.setVelocity([0, vel[1]]);
    };

    Player.prototype.walkLeft = function () {
        var vel = this.body.getVelocity();
        this.body.setVelocity([-1 * this.SPEED, vel[1]]);
    };

    Player.prototype.walkRight = function () {
        var vel = this.body.getVelocity();
        this.body.setVelocity([this.SPEED, vel[1]]);
    };

    Player.prototype.update = function () {
    };

    // draws the player's sprite to the screen
    Player.prototype.draw = function (draw2D) {
        var pos = this.body.getPosition();
        this.sprite.x = pos[0];
        this.sprite.y = pos[1];
        draw2D.drawSprite(this.sprite);
    };
    return Player;
})();
var BASE_MAP_URL = "assets/maps/";

// @TODO: Add support for multiple layers
// later, multiple tilesets
// do something clever with transparent color to blend:
// need to maintain a list of the actual Sprite objects
// so we can attach physics attributes to them
// convert this to a 2-pass setup:
// 1. create a list of layers of draw2dsprites,
// then redraw the sprites
// Tips for making proper tilesets in Tiled.app:
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
                // this should be upon creation
                //                var rigidBodyType:string = layerObject.properties.rigidBody;
                //                if (rigidBodyType)
                //                {
                //                }
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

    //    loadMap( draw2D:Draw2D )
    //    {
    //        this.mapData.layers.forEach((layer) =>
    //            if (layer.type === "tilelayer")
    //            {
    //                Draw2DSprite[] tiles = this.createTileLayer( draw2D, layer );
    //                this.layers.append(tiles);
    //            } else if (layer.type === "objectgroup")
    //            {
    //                Draw2DSprite[] objects = this.createObjectLayer( draw2D, layer );
    //                this.layers.append(objects);
    //            }
    //        );
    //    }
    Tileset.prototype.drawLayers = function (draw2D, playerPosition) {
        var _this = this;
        this.mapData.layers.forEach(function (layer) {
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
//var ctx:any = canvas.getContext("2d");
//ctx.webkitImageSmoothingEnabled = false;
var graphicsDevice = TurbulenzEngine.createGraphicsDevice({});
var inputDevice = TurbulenzEngine.createInputDevice({});

// build the physics device to allow 2D constraint physics
var physicsDevice = Physics2DDevice.create();
var dynamicWorld = physicsDevice.createWorld({
    gravity: [0, 0.01],
    velocityIterations: 8,
    positionIterations: 8
});

// this object draws everything to the screen
var draw2D = Draw2D.create({
    graphicsDevice: graphicsDevice
});

var success = draw2D.configure({
    scaleMode: 'scale',
    viewportRectangle: [0, 0, 320, 240]
});

var bgColor = [0.0, 0.0, 0.0, 1.0];

// store information about the size of the screen
var viewport = [];
draw2D.getViewport(viewport);
var height = viewport[3] - viewport[1];
var width = viewport[2] - viewport[0];

// the tileset device manages the tiled maps
var tileset = new Tileset("test.json", graphicsDevice, TurbulenzEngine);

// next we build a player, including the rigid body, sprite, and managing object
var playerParams = {
    x: 0,
    y: 0,
    width: 64,
    height: 128,
    color: [0.0, 1.0, 1.0, 1.0],
    scale: [0.25, 0.25]
};
var playerSprite = Draw2DSprite.create(playerParams);
var playerVertices = physicsDevice.createRectangleVertices(0, 0, 64, 128);
var playerShape = physicsDevice.createPolygonShape({
    vertices: playerVertices
});
var playerBody = physicsDevice.createRigidBody({
    type: 'dynamic',
    shapes: [playerShape],
    mass: 10
});

// import an image to use as the player display and when loading is done set it as the player's texture
//var layerTexture = graphicsDevice.createTexture({
//src: "assets/player/playerProfile.png",
//mipmaps: true,
//onload: function (texture)
//{
//if (texture != null)
//{
//player.setTexture(texture);
//player.setTextureRectangle([0, 0, texture.width, texture.height])
//}
//}
//});
var player = new Player(playerSprite, playerBody, [width / 2, 25]);

// add the player to the world
dynamicWorld.addRigidBody(playerBody);

// add event listeners
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

// run the game
function update() {
    var i = 0;
    if (graphicsDevice.beginFrame()) {
        dynamicWorld.step(1000 / 60); // I think this should go elsewhere... or be wrapped in a test and looped
        player.update();

        graphicsDevice.clear(bgColor, 1.0);

        draw2D.begin();

        if (tileset.isLoaded()) {
            tileset.drawLayers(draw2D, player.getPosition());
        }

        // draw the player to the screen
        player.draw(draw2D);

        draw2D.end();

        graphicsDevice.endFrame();
    }
}

TurbulenzEngine.setInterval(update, 1000 / 60);
//# sourceMappingURL=fibers.js.map
