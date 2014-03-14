TurbulenzEngine = WebGLTurbulenzEngine.create({
    canvas: document.getElementById("canvas")
});

var graphicsDevice = TurbulenzEngine.createGraphicsDevice( {} );
var draw2D = Draw2D.create({
    graphicsDevice: graphicsDevice
});

var bgColor = [0.0, 0.0, 0.0, 1.0];

var sprite = Draw2DSprite.create({
    width: 100,
    height: 100,
    x: graphicsDevice.width / 2,
    y: graphicsDevice.height / 2,
    color: [1.0, 1.0, 1.0, 1.0],
    rotation: Math.PI / 4
});

var PI2 = Math.PI * 2;
var rotateAngle = PI2 / 360; // 1 deg per frame
var viewport = draw2D.getScreenSpaceViewport();




// function tileLeft( index )
// {
//     return (index*(spacing + tileWidth) + margin) % imageWidth;
// }

// function tileTop( index )
// {
//     return Math.floor((index*(spacing + tileWidth) + margin)
//                       / imageWidth)*tileHeight;
// }

// var currentTop = 0;
// while (currentTop < imageHeight)
// {
//     var left = tileLeft(currentIndex);
//     var top = tileTop(currentIndex);
//     var tileGID = firstGID + currentIndex;
//     mapSprites[tileGID] = Draw2DSprite.create({
//         width: tileWidth,
//         height: tileHeight,
//         x: graphicsDevice.width / 2,
//         y: graphicsDevice.height / 2,
//         color: [1.0, 1.0, 1.0, 1.0],
//         textureRectangle: [top, left, tileWidth, tileHeight]
//     });
//     currentTop = top;
//     currentIndex += 1;
// }

function update()
{
    sprite.rotation += rotateAngle;
    sprite.rotation %= PI2; // Wrap rotation at PI * 2

    if (graphicsDevice.beginFrame())
    {
        graphicsDevice.clear( bgColor, 1.0 );

        draw2D.begin();

        if (mapData)
        {
            var mapWidth = mapData.width;
            var mapHeight = mapData.height;
            var tileWidth = mapData.tilewidth;
            var tileHeight = mapData.tileheight;
            var imageHeight = tileSet.imageheight;
            var imageWidth = tileSet.imagewidth;

            var margin = tileSet.margin;
            var spacing = tileSet.spacing;
            var imageRows = Math.floor((imageHeight - margin)/(tileHeight + spacing));
            var imageCols = Math.floor((imageWidth - margin)/(tileWidth + spacing));
            var firstGID = tileSet.firstgid; // global id of tilekk

            mapData.layers.forEach(function(layer){
                if (layer.data)
                {
                    var tileIndex = 0;
                    for (; tileIndex < mapWidth*mapHeight; tileIndex += 1)
                    {
                        var tileMapCol = tileIndex % mapWidth;
                        var tileMapRow = Math.floor(tileIndex / mapWidth);
                        var tileMapX = tileMapCol*tileWidth;
                        var tileMapY = tileMapRow*tileHeight;

                        //var drawPoint = draw2D.viewportMap(tileX, tileY);
                        var tileGID = layer.data[tileIndex];
                        var tileSetIndex = tileGID - firstGID;
                        var tileSetCol = tileSetIndex % imageCols;
                        var tileSetRow = Math.floor(tileSetIndex / imageCols);
                        // We expect [437, 161] for tile [0,0]
                        var tileSetX = tileSetCol * (tileWidth + spacing) + margin;
                        var tileSetY = tileSetRow * (tileHeight + spacing) + margin;

                        if (mapTexture)
                        {
                            draw2D.draw({
                                texture: mapTexture,
                                sourceRectangle: [tileSetX, tileSetY,
                                                  tileSetX+tileWidth,
                                                  tileSetY+tileHeight],
                                destinationRectangle: [tileMapX, tileMapY,
                                                       tileMapX+tileWidth,
                                                       tileMapY+tileHeight]
                            });
                        }
                    }
                }
            });
        }

        //draw2D.drawSprite( sprite );
        draw2D.end();

        graphicsDevice.endFrame();
    }
}

TurbulenzEngine.setInterval( update, 1000/60 );


// want an object to encapsulate maps...
// json filename
// loading and parsing json => loading texture
// creating array of sprites

var mapTexture;
var mapData;
var tileSet;

function mapLoadedCallback( jsonData )
{
    if (jsonData)
    {
        mapData = JSON.parse( jsonData );

        // setup tiles
        tileSet = mapData.tilesets[0]

        // setup texture
        var textureURL = "assets/maps/" + tileSet.image;
        console.log(textureURL);

        graphicsDevice.createTexture({
            src: textureURL,
            mipmaps: true,
            onload: function (texture){
                if (texture)
                {
                    mapTexture = texture;

                    sprite.setTexture(texture);
                    sprite.setTextureRectangle( [0, 0,
                                                 texture.width,
                                                 texture.height] );
                }
            }
        });
    }
}

TurbulenzEngine.request( "assets/maps/test.json", mapLoadedCallback );
