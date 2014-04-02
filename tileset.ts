/// <reference path="jslib-modular/tzdraw2d.d.ts" />
/// <reference path="jslib-modular/physics2d.d.ts" />

/// <reference path="rigidSprite.ts"/>

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

    // store physics objects for easy access
    physicsDevice:Physics2DDevice;
    world:Physics2DWorld;

    // this will store every rigidsprite object in the layers.
    // Iterating over the list will allow for computing physics, displaying, etc.
    rigidSprites:RigidSprite[];

    mapLoadedCallback: (jsonData) => void;

    constructor( mapFilename:string, graphicsDevice:any,
                 engine:any)
    {
        this.mapLoadedCallback = (jsonData) => {
            if (jsonData)
            {
                var mapData = JSON.parse( jsonData );
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
                this.imageRows = Math.floor((imageHeight - this.margin)/(this.tileHeight + this.spacing));
                this.imageCols = Math.floor((imageWidth - this.margin)/(this.tileWidth + this.spacing));
                this.firstGID = tileSet.firstgid; // global id of tilekk
                this.tileSet = tileSet;

                // setup texture
                var textureURL = BASE_MAP_URL + tileSet.image;

                graphicsDevice.createTexture({
                    src: textureURL,
                    mipmaps: true,
                    onload: (texture) => {
                        if (texture)
                        {
                            this.mapTexture = texture;
                        }
                    }
                });
            }
        }

        engine.request(BASE_MAP_URL + mapFilename,
            this.mapLoadedCallback);
    }

    setTexture(rigidSprite:RigidSprite)
    {
        rigidSprite.sprite.setTexture(this.mapTexture);
        var textureRectangle:number[] = this.getTileCoordinatesForIndex(rigidSprite.gid)
        rigidSprite.sprite.setTextureRectangle(textureRectangle);
        console.log("Rect is " + textureRectangle);
    }

    isLoaded():boolean
    {
        return (this.mapData != null);
    }


    /*
     * Method: loadObjectLayer
     *
     * Loads all of the objects in a given object layer, building rigidSprites for each element.
     * Each rigidSprite successfully built is then added to this.rigidSprites.
     * A number of checks are done to make sure that all the objects properties match our expectations.
     */
    loadObjectLayer(layer:any, physicsDevice:Physics2DDevice, world:Physics2DWorld) {
        if (layer.objects)
        {
            var numObjects:number = layer.objects.length;
            for (var i:number = 0; i < numObjects; i++) {
                var obj:any = layer.objects[i];
                // for each object, make a sprite if it is visible
                if (obj.visible && obj.hasOwnProperty("height") && obj.hasOwnProperty("width")
                    && obj.hasOwnProperty("x") && obj.hasOwnProperty("y") && obj.hasOwnProperty("properties"))
                {
                    var rigidSprite:RigidSprite = null;
                    // build the sprite
                    // what is the interaction between defined color and texture?
                    var spriteParams:Draw2DSpriteParams = {
                        height: obj.height,
                        width: obj.width,
                        x: obj.x,
                        y: obj.y,
                        color: [1.0, this.layerNum/5.0, 0.0, 1.0]
                    };
                    var sprite:Draw2DSprite = Draw2DSprite.create(spriteParams);

                    // build the body
                    if (obj.properties.hasOwnProperty("rigidBody") && obj.properties.shape === "rectangle")
                    {
                        var vertices:number[][] = physicsDevice.createRectangleVertices(obj.x, obj.y, obj.width, obj.height);

                        var shape:Physics2DShape = physicsDevice.createPolygonShape({
                            vertices: vertices
                        });
                        var body:Physics2DRigidBody = physicsDevice.createRigidBody({
                            type: obj.properties.rigidBody,
                            shapes: [shape],
                            mass: (obj.properties.mass ? obj.properties.mass : 1)
                        });
                        // add the body to the world
                        world.addRigidBody(body);

                        rigidSprite = new RigidSprite(sprite, [obj.x, obj.y], obj.gid, body);
                        console.log("Made physics obj!");
                    }
                    else
                    {
                        console.log("Not making rigid body for object because properties are not valid");
                        rigidSprite = new RigidSprite(sprite, [obj.x, obj.y], obj.gid);
                    }

                    // if the map is already loaded, set the texture
                    // what happens if the map is not loaded?
//                    if (this.isLoaded())
//                    {
//                        this.setTexture(rigidSprite);
//                    }
                    // store this rigid sprite
                    this.rigidSprites.push(rigidSprite);
                }
                else
                {
                    console.log("Not loading object from layer because keys/values are bad.");

                };
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
        if (layer.data)
        {
            var numObjects:number = layer.data.length;
            for (var i:number = 0; i < numObjects; i++) {
                // for each object, make a sprite if it is visible
                var rigidSprite:RigidSprite = null;
                // build the sprite
                var screenCoords:number[] = this.getScreenCoordinatesForIndex(i);
                var spriteParams:Draw2DSpriteParams = {
                    x: screenCoords[0],
                    y: screenCoords[1],
                    width: screenCoords[2],
                    height: screenCoords[3],
                    color: [1.0, this.layerNum/5.0, 0.0, 1.0]
                };
                var sprite:Draw2DSprite = Draw2DSprite.create(spriteParams);
                rigidSprite = new RigidSprite(sprite, [screenCoords[0], screenCoords[1]], layer.data[i]);

                // if the map is already loaded, set the texture
//                if (this.isLoaded())
//                {
//                    this.setTexture(rigidSprite);
//                }

                // store this rigid sprite
                this.rigidSprites.push(rigidSprite);
            }
            this.layerNum++;
        }
    }

    loadMap( physicsDevice:Physics2DDevice, world:Physics2DWorld)
    {
        this.ranLoadMap = true;
        this.mapData.layers.forEach((layer) =>
        {
            if (layer.type === "objectgroup")
            {
                this.loadObjectLayer(layer, physicsDevice, world);
            }
            else if (layer.type === "tilelayer")
            {
                this.loadTileLayer(layer);
            }
        });
    }

    /*
     * Method: draw
     *
     * Draws all sprites in rigidSprites to the screen
     */
    draw(draw2D:Draw2D)
    {
        var num:number = this.rigidSprites.length;
        for(var i:number = num-1; i >= 0; i--) {
            var rigidSprite:RigidSprite = this.rigidSprites[i];
            if (!rigidSprite.sprite.getTexture() && this.mapTexture)
            {
                this.setTexture(rigidSprite);
            }
            this.rigidSprites[i].draw(draw2D);
        }
    }

    /*
     * Method: getTileCoordinatesForIndex
     *
     * Returns the coordinates in the map texture of the given tile ID (gid).
     */
    getTileCoordinatesForIndex( tileGID:number ):number[]
    {
        var tileSetIndex:number = tileGID - this.firstGID;
        var tileSetCol:number = tileSetIndex % this.imageCols;
        var tileSetRow:number = Math.floor(tileSetIndex / this.imageCols);
        // We expect [437, 161] for tile [0,0]
        var tileSetX:number = tileSetCol * (this.tileWidth + this.spacing) + this.margin;
        var tileSetY:number = tileSetRow * (this.tileHeight + this.spacing) + this.margin;

        return [tileSetX, tileSetY, tileSetX+this.tileWidth, tileSetY+this.tileHeight];
    }

    getScreenCoordinatesForIndex( tileIndex:number ):number[]
    {
        var tileMapCol:number = tileIndex % this.mapWidth;
        var tileMapRow:number = Math.floor(tileIndex / this.mapWidth);
        var tileMapX:number = tileMapCol*this.tileWidth;
        var tileMapY:number = tileMapRow*this.tileHeight;

        return [tileMapX, tileMapY, tileMapX+this.tileWidth, tileMapY + this.tileHeight];
    }

////////////////////////////////////////////////////////////////////////////////////////////////////
// Everything below here is depricated, I believe.
////////////////////////////////////////////////////////////////////////////////////////////////////

    drawLayers( draw2D:Draw2D, playerPosition:number[] )
    {
        this.mapData.layers.forEach((layer) =>
        {
            if (layer.type === "tilelayer")
            {
                this.drawTileLayer( draw2D, layer, playerPosition );
            } else if (layer.type === "objectgroup")
            {
                this.drawObjectLayer( draw2D, layer, playerPosition );
            }
        });
    }

    // this must be called inside of draw2D.begin!
    drawObjectLayer( draw2D:Draw2D, layer, playerPosition:number[] )
    {
        if (layer.objects)
        {
            var tileCount:number = layer.objects.length;
            for (var tileIndex:number = 0; tileIndex < tileCount; tileIndex += 1)
            {
                var layerObject = layer.objects[tileIndex];
                var tileGID = layerObject.gid;
                if (tileGID)
                {
                    var x:number = layerObject.x;
                    var y:number = layerObject.y - layerObject.height;
                    var drawObject = this.tileDrawObjectAtPos( x, y, tileGID, playerPosition );
                    if (drawObject)
                    {
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
    }

    // this must be called inside of draw2D.begin!
    drawTileLayer( draw2D:Draw2D, layer, playerPosition:number[] )
    {
        var tileIndex:number = 0;
        var tileCount:number =  this.mapWidth*this.mapHeight;

        if (layer.data)
        {
            for (; tileIndex < tileCount; tileIndex += 1)
            {
                var tileGID:number = layer.data[tileIndex];
                var drawObject = this.tileDrawObjectAtIndex( tileIndex, tileGID, playerPosition );
                if (drawObject)
                {
                    draw2D.draw(drawObject);
                }
            }
        }
    }

    tileDrawObjectAtPos( x:number, y:number, tileGID:number, origin:number[]):any
    {
        var tileSetIndex:number = tileGID - this.firstGID;
        var tileSetCol:number = tileSetIndex % this.imageCols;
        var tileSetRow:number = Math.floor(tileSetIndex / this.imageCols);
        // We expect [437, 161] for tile [0,0]
        var tileSetX:number = tileSetCol * (this.tileWidth + this.spacing) + this.margin;
        var tileSetY:number = tileSetRow * (this.tileHeight + this.spacing) + this.margin;

        var destX = x - origin[0];
        var destY = y - origin[1];

        if (this.mapTexture)
        {
            return {
                texture: this.mapTexture,
                sourceRectangle: [tileSetX, tileSetY,
                    tileSetX+this.tileWidth,
                    tileSetY+this.tileHeight],
                destinationRectangle: [destX, destY,
                    destX+this.tileWidth,
                    destY+this.tileHeight]
            };
        } else
        {
            return null;
        }
    }

    // return an object to be passed to draw2D.draw() given a tile index
    // on a map (index 0 = top left of a map)
    tileDrawObjectAtIndex( tileIndex:number, tileGID:number, origin:number[]):any
    {
        var tileMapCol:number = tileIndex % this.mapWidth;
        var tileMapRow:number = Math.floor(tileIndex / this.mapWidth);
        var tileMapX:number = tileMapCol*this.tileWidth;
        var tileMapY:number = tileMapRow*this.tileHeight;

        var x:number = tileMapX;
        var y:number = tileMapY;

        return this.tileDrawObjectAtPos( x, y, tileGID, origin );
    }
}

