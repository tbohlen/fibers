/// <reference path="jslib-modular/tzdraw2d.d.ts" />
/// <reference path="jslib-modular/physics2d.d.ts" />

/// <reference path="rigidSprite.ts"/>
/// <reference path="interfaces.ts"/>
/// <reference path="platform.ts"/>
/// <reference path="knitCube.ts"/>
/// <reference path="chain.ts"/>
/// <reference path="tool.ts"/>
/// <reference path="rectangle.ts"/>
/// <reference path="checkpoint.ts"/>
/// <reference path="spawn.ts"/>

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

// TO MAKE PHYSICS OBJECTS IN TILED:
// give the object property "rigidBody" = "kinematic"/"dynamic"
// and property "shape" = "rectangle"
// we will add more shapes and physics types soon.
// i.e. polygon, dynamic/kinematic...
// material...
// "climbable" = true

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

    buildables:any = {};
    tools:any = {};

    // XXX: Don't modify!!
    game:GameObject;

    // this will store every rigidSprite object in the layers.
    // Iterating over the list will allow for computing physics, displaying, etc.
    rigidSprites:RigidSprite[];

    slipperyMaterial:Physics2DMaterial;

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
        };

        this.slipperyMaterial = this.game.physicsDevice.createMaterial({
            elasticity: 0,
            staticFriction: 0,
            dynamicFriction: 0
        });

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

    static isValidPhysicsObject(obj):boolean
    {
        return (obj.visible && obj.hasOwnProperty("height") && obj.hasOwnProperty("width") &&
                obj.hasOwnProperty("x") && obj.hasOwnProperty("y") && obj.hasOwnProperty("properties"));
    }

    loadObjectLayer(layer:any):void
    {
        if (layer.objects)
        {
            var numObjects:number = layer.objects.length;

            for (var i:number = 0; i < numObjects; i++) {
                var obj:any = layer.objects[i];
                if (!(obj.type in window))
                {
                    console.log("Could not create object of type: " + obj.type);
                    continue;
                }
                var rigidSprite = window[obj.type].constructFromTiled(obj, this, this.game);
                console.log("Created object of type: " + obj.type);

                if (rigidSprite != null)
                {
                    var rigidBodyType:string = obj.properties["rigidBody"];
                    if (rigidBodyType == "dynamic")
                    {
                        rigidSprite.body.setAsDynamic();
                    } else if (rigidBodyType == "kinematic")
                    {
                        rigidSprite.body.setAsKinematic();
                    } else if (rigidBodyType == "static")
                    {
                        rigidSprite.body.setAsStatic();
                    }
                    this.rigidSprites.push(rigidSprite);
                }

                // testing so that we can map up rectangles and tiles
                if (obj.type == "Tool" && obj.properties.hasOwnProperty("toolKey"))
                {
                    console.log("Adding tool");
                    this.tools[obj.properties.toolKey] = rigidSprite;
                }
                else if (obj.properties.hasOwnProperty("toolKey"))
                {
                    this.buildables[obj.properties.toolKey] = rigidSprite;
                }
            }
        }
    }

    /*
     * Method: loadTileLayer
     *
     * Makes the tile layer into sprites, referencing the tile index to figure out where it should go.
     */
    loadTileLayer(layer:any)
    {
        if (layer.data)
        {
            var numObjects:number = layer.data.length;
            for (var i:number = 0; i < numObjects; i++) {
                // for each object, make a sprite if it is visible
                var tileGID:number = layer.data[i];
                // build the sprite
                if (tileGID != 0) {
                    var screenCoords:number[] = this.getScreenCoordinatesForIndex(i);
                    var spriteParams:Draw2DSpriteParams = {
                        x: screenCoords[0],
                        y: screenCoords[1],
                        origin: [0, 0],
                        width: this.tileWidth,
                        height: this.tileHeight
                    };
                    var sprite:Draw2DSprite = Draw2DSprite.create(spriteParams);
                    var rigidSprite:RigidSprite = new RigidSprite({
                        sprite: sprite,
                        initialPos: [screenCoords[0], screenCoords[1]],
                        gid: tileGID
                    });

                    // store this rigid sprite
                    this.rigidSprites.push(rigidSprite);
                }
            }
        }
    }

    loadMap() {
        console.log("loading map!");
        this.ranLoadMap = true;
        var layerCount = this.mapData.layers.length;
        for (var i:number = 0; i < layerCount; i+=1)
        {
            var layer = this.mapData.layers[i];
            // the first sub array is buildable objects. The second is climbable
            var createdObjects:any[] = [[],[]];
            if (layer.type === "objectgroup")
            {
                this.loadObjectLayer(layer);
            }
            else if (layer.type === "tilelayer")
            {
                this.loadTileLayer(layer);
            }
            else
            {
                console.log(layer.type);
            }
        }

        console.log("mapping tools");
        for (var key in this.tools)
        {
            console.log("found key: " + key);
            if (this.buildables.hasOwnProperty(key))
            {
                console.log("Found match for key: " + key);
                (<Tool>this.tools[key]).buildable = this.buildables[key];
            }
        }
    }

    /*
     * Method: draw
     *
     * Draws all sprites in rigidSprites to the screen
     */
    draw(draw2D:Draw2D, offset:number[])
    {
        var num:number = this.rigidSprites.length;
        for (var i:number = 0; i < num; i+=1) {
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
