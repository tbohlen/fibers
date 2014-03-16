var BASE_MAP_URL:string = "assets/maps/";

// @TODO: Add support for multiple layers
// later, multiple tilesets
// do something clever with transparent color to blend:

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

    mapLoadedCallback: (jsonData) => void;

    constructor( mapFilename:string, graphicsDevice:any,
                 engine:any )
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

    isLoaded():boolean
    {
        return (this.mapData != null);
    }

    getLayers():any[]
    {
        return this.mapData.layers;
    }

    // this must be called inside of draw2D.begin!
    drawObjectLayer( draw2D:Draw2D, layer )
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
                    var y:number = layerObject.y;
                    var drawObject = this.tileDrawObjectAtPos( x, y, tileGID, player.getPosition() );
                    if (drawObject)
                    {
                        draw2D.draw(drawObject);
                    }
                }
            }
        }
    }

    // this must be called inside of draw2D.begin!
    drawTileLayer( draw2D:Draw2D, layer )
    {
        var tileIndex:number = 0;
        var tileCount:number =  this.mapWidth*this.mapHeight;

        if (layer.data)
        {
            for (; tileIndex < tileCount; tileIndex += 1)
            {
                var tileGID:number = layer.data[tileIndex];
                var drawObject = this.tileDrawObjectAtIndex( tileIndex, tileGID, player.getPosition() );
                if (drawObject)
                {
                    draw2D.draw(drawObject);
                }
            }
        }
    }

    drawLayers( draw2D:Draw2D )
    {
        this.getLayers().forEach((layer) =>
        {
            if (layer.type === "tilelayer")
            {
                this.drawTileLayer( draw2D, layer );
            } else if (layer.type === "objectgroup")
            {
                this.drawObjectLayer( draw2D, layer );
            }
        });
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