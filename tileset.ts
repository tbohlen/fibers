/// <reference path="jslib-modular/tzdraw2d.d.ts" />
/// <reference path="jslib-modular/physics2d.d.ts" />

/// <reference path="rigidSprite.ts"/>
/// <reference path="interfaces.ts"/>

var BASE_MAP_URL:string = "assets/maps/";

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
// only represent physics objects as sprites...

class Tileset {

    mapTexture:any;
    mapData:any;

    mapWidth:number;
    mapHeight:number;
    tileWidth:number;
    tileHeight:number;

    margin:number;
    spacing:number;
    imageRows:number;
    imageCols:number;
    firstGID:number;

    tileSet:any;

    ranLoadMap:boolean = false;
    layerNum:number = 3.0;

    // XXX: Don't modify!!
    game:GameObject;

    // this will store every rigidSprite object in the layers.
    // Iterating over the list will allow for computing physics, displaying, etc.
    rigidSprites:RigidSprite[];

    mapLoadedCallback:(jsonData) => void;

    /*
     * Constructor: Tileset
     * Takes the map filename in order to display the map to screen and the game
     * object in order to get access to various game-critical objects and properties.
     */
    constructor(mapFilename:string, game:GameObject) {
        this.game = game;

        this.mapLoadedCallback = (jsonData) => {
            if (jsonData) {
                var mapData = JSON.parse(jsonData);
                this.mapWidth = mapData.width;
                this.mapHeight = mapData.height;
                this.tileWidth = mapData.tilewidth;
                this.tileHeight = mapData.tileheight;
                this.mapData = mapData;
                this.rigidSprites = [];

                // setup tiles
                var tileSet = mapData.tilesets[0];
                var imageHeight:number = tileSet.imageheight;
                var imageWidth:number = tileSet.imagewidth;
                this.margin = tileSet.margin;
                this.spacing = tileSet.spacing;
                this.imageRows = Math.floor((imageHeight - this.margin) / (this.tileHeight + this.spacing));
                this.imageCols = Math.floor((imageWidth - this.margin) / (this.tileWidth + this.spacing));
                this.firstGID = tileSet.firstgid; // global id of tilekk
                this.tileSet = tileSet;

                // setup texture
                var textureURL = BASE_MAP_URL + tileSet.image;

                this.game.graphicsDevice.createTexture({
                    src: textureURL,
                    mipmaps: true,
                    onload: (texture) => {
                        if (texture) {
                            this.mapTexture = texture;
                        }
                    }
                });
            }
        }

        this.game.engine.request(BASE_MAP_URL + mapFilename,
            this.mapLoadedCallback);
    }

    setTexture(rigidSprite:RigidSprite) {
        var textureRectangle:number[] = this.getTileCoordinatesForIndex(rigidSprite.gid);
        rigidSprite.sprite.setTextureRectangle(textureRectangle);
        rigidSprite.sprite.setTexture(this.mapTexture);
    }

    isLoaded():boolean {
        return (this.mapData != null);
    }


    /*
     * Method: loadObjectLayer
     *
     * Loads all of the objects in a given object layer, building rigidSprites for each element.
     * Each rigidSprite successfully built is then added to this.rigidSprites.
     * A number of checks are done to make sure that all the objects properties match our expectations.
     */
    loadObjectLayer(layer:any) {
        if (layer.objects) {
            var numObjects:number = layer.objects.length;
            for (var i:number = 0; i < numObjects; i++) {
                var obj:any = layer.objects[i];
                // for each object, make a sprite if it is visible
                if (obj.visible && obj.hasOwnProperty("height") && obj.hasOwnProperty("width")
                    && obj.hasOwnProperty("x") && obj.hasOwnProperty("y") && obj.hasOwnProperty("properties")) {
                    var rigidSprite:RigidSprite = null;
                    // build the sprite
                    // what is the interaction between defined color and texture?
                    var spriteParams:Draw2DSpriteParams = {
                        height: obj.height,
                        width: obj.width,
                        x: obj.x,
                        y: obj.y,
                        color: [1.0, this.layerNum / 5.0, 0.0, 1.0]
                    };
                    console.log(spriteParams);
                    var sprite:Draw2DSprite = Draw2DSprite.create(spriteParams);

                    // build the body
                    if (obj.properties.hasOwnProperty("rigidBody") && obj.properties.shape === "rectangle") {
                        var vertices:number[][] = this.game.physicsDevice.createRectangleVertices(obj.x, obj.y, obj.x + obj.width, obj.y + obj.height);
                        var slipperyMaterial:Physics2DMaterial = this.game.physicsDevice.createMaterial({
                            elasticity: 0,
                            staticFriction: 0,
                            dynamicFriction: 0
                        });
                        var shape:Physics2DShape = this.game.physicsDevice.createPolygonShape({
                            vertices: vertices,
                            material: slipperyMaterial
                        });
                        var body:Physics2DRigidBody = this.game.physicsDevice.createRigidBody({
                            type: obj.properties.rigidBody,
                            shapes: [shape],
                            mass: (obj.properties.mass ? obj.properties.mass : 1)
                        });
                        // add the body to the world
                        this.game.physicsWorld.addRigidBody(body);

                        rigidSprite = new RigidSprite(sprite, [obj.x, obj.y], obj.gid, body);
                        console.log("Made physics obj!");
                    }
                    else {
                        console.log("Not making rigid body for object because properties are not valid");
                        rigidSprite = new RigidSprite(sprite, [obj.x, obj.y], obj.gid);
                    }
                    // store this rigid sprite
                    this.rigidSprites.push(rigidSprite);
                }
                else {
                    console.log("Not loading object from layer because keys/values are bad.");

                }
                ;
            }
            this.layerNum++;
        }
    }

    /*
     * Method: loadTileLayer
     *
     * Makes the tile layer into sprites, referencing the tile index to figure out where it should go.
     */
    loadTileLayer(layer:any) {
        if (layer.data) {
            var numObjects:number = layer.data.length;
            for (var i:number = 0; i < numObjects; i++) {
                // for each object, make a sprite if it is visible
                var rigidSprite:RigidSprite = null;
                // build the sprite
                var screenCoords:number[] = this.getScreenCoordinatesForIndex(i);
                var spriteParams:Draw2DSpriteParams = {
                    x: screenCoords[0],
                    y: screenCoords[1],
                    width: this.tileWidth,
                    height: this.tileHeight
                };
                var sprite:Draw2DSprite = Draw2DSprite.create(spriteParams);
                rigidSprite = new RigidSprite(sprite, [screenCoords[0], screenCoords[1]], layer.data[i]);

                // store this rigid sprite
                this.rigidSprites.push(rigidSprite);
            }
            this.layerNum++;
        }
    }

    loadMap() {
        console.log("loading map...")
        this.ranLoadMap = true;
        this.mapData.layers.forEach((layer) => {
            if (layer.type === "objectgroup") {
                this.loadObjectLayer(layer);
            }
            else if (layer.type === "tilelayer") {
                this.loadTileLayer(layer);
            }
        });
    }

    /*
     * Method: draw
     *
     * Draws all sprites in rigidSprites to the screen
     */
    draw(draw2D:Draw2D, offset:number[]) {
        var num:number = this.rigidSprites.length;
        for (var i:number = num - 1; i >= 0; i--) {
            var rigidSprite:RigidSprite = this.rigidSprites[i];
            if (!rigidSprite.sprite.getTexture() && this.mapTexture) {
                this.setTexture(rigidSprite);
            }
            this.rigidSprites[i].draw(draw2D, offset);
        }
    }

    /*
     * Method: getTileCoordinatesForIndex
     *
     * Returns the coordinates in the map texture of the given tile ID (gid).
     */
    getTileCoordinatesForIndex(tileGID:number):number[] {
        var tileSetIndex:number = tileGID - this.firstGID;
        var tileSetCol:number = tileSetIndex % this.imageCols;
        var tileSetRow:number = Math.floor(tileSetIndex / this.imageCols);
        // We expect [437, 161] for tile [0,0]
        var tileSetX:number = Math.round(tileSetCol * (this.tileWidth + this.spacing) + this.margin);
        var tileSetY:number = Math.round(tileSetRow * (this.tileHeight + this.spacing) + this.margin);

        return [tileSetX, tileSetY, tileSetX + this.tileWidth, tileSetY + this.tileHeight];
    }

    getScreenCoordinatesForIndex(tileIndex:number):number[] {
        var tileMapCol:number = tileIndex % this.mapWidth;
        var tileMapRow:number = Math.floor(tileIndex / this.mapWidth);
        var tileMapX:number = tileMapCol * this.tileWidth;
        var tileMapY:number = tileMapRow * this.tileHeight;

        return [tileMapX, tileMapY, tileMapX + this.tileWidth, tileMapY + this.tileHeight];
    }
}