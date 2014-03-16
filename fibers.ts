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

var graphicsDevice = TurbulenzEngine.createGraphicsDevice( {} );
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

inputDevice.addEventListener("keydown", function(keycode){
    if (keycode === inputDevice.keyCodes.LEFT)
    {
        player.walkLeft();
    } else if (keycode === inputDevice.keyCodes.RIGHT)
    {
        player.walkRight();
    } else
    {
        console.log(keycode);
    }
});

inputDevice.addEventListener("keyup", function(keycode){
    player.stopWalking();
});

// this must be called inside of draw2D.begin!
function drawLayer(tileSet, layerData)
{
    if (layerData)
    {
        var tileIndex:number = 0;
        for (; tileIndex < tileSet.mapWidth*tileSet.mapHeight; tileIndex += 1)
        {
            var tileGID:number = layerData[tileIndex];
            var drawObject = tileSet.tileDrawObject(tileIndex, tileGID, player.getPosition());
            if (drawObject)
            {
                draw2D.draw(drawObject);
            }
        }
    }
}

function update()
{
    if (graphicsDevice.beginFrame())
    {
        player.update();

        graphicsDevice.clear( bgColor, 1.0 );

        draw2D.begin();

        if (tileset.isLoaded())
        {
            tileset.getLayers().forEach(function(layer){
                if (layer.data)
                {
                    drawLayer(tileset, layer.data);
                }
            });
        }

        draw2D.end();

        graphicsDevice.endFrame();
    }
}

TurbulenzEngine.setInterval( update, 1000/60 );
