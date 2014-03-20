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

// build the physics device to allow 2D constraint physics
var physicsDevice = Physics2DDevice.create();
var dynamicWorld = physicsDevice.createWorld({
    gravity: [0, 10],
    velocityIterations: 8,
    positionIterations: 8
});

var draw2D = Draw2D.create({
    graphicsDevice: graphicsDevice
});

var success = draw2D.configure({
    scaleMode: 'scale',
    viewportRectangle: [0, 0, 320, 240]
});

var bgColor = [0.0, 0.0, 0.0, 1.0];

// this is throwing an error... no idea why
var viewport:number[] = draw2D.getViewport();
var height:number = viewport[3]-viewport[1];
var width:number = viewport[2]-viewport[0];

var tileset = new Tileset("test.json", graphicsDevice, TurbulenzEngine);

// NOTE: nothing is actually wrong here even though the IDE complains. In the version of turbulenz we are using the
// scale is expected to be a single number but should actually be an array... IDK why
var playerSprite:any = Draw2DSprite.create({
    width: 100,
    height: 200,
    x: 0,
    y: 0,
    color: [0.0, 1.0, 1.0, 1.0],
    scale: [0.25, 0.25]
});

// create the player physics object
var playerVertices:number[] = physicsDevice.createRectangleVertices(0, 0, 100, 200);
var playerShape = physicsDevice.createPolygonShape({
    vertices: playerVertices
});
var playerBody = physicsDevice.createRigidBody({
    type: 'kinematic',
    shapes: [playerShape],
    mass: 10
});

// import an image to use as the player display and when loading is done set it as the player's texture
var playerTexture = graphicsDevice.createTexture({
    src: "assets/player/playerProfile.png",
    mipmaps: true,
    onload: function (texture)
    {
        if (texture != null)
        {
            //player.setTexture(texture);
            //player.setTextureRectangle([0, 0, texture.width, texture.height])
        }
    }
});

var player:Player = new Player(playerSprite, playerBody, [width/2, 25]);

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

function update()
{
    if (graphicsDevice.beginFrame())
    {
        dynamicWorld.step(1000/60); // I think this should go elsewhere... or be wrapped in a test and looped
        player.update();

        graphicsDevice.clear( bgColor, 1.0 );

        draw2D.begin();

        if (tileset.isLoaded())
        {
            tileset.drawLayers(draw2D, player.getPosition());
        }

        // draw the player to the screen
        player.draw(draw2D);

        draw2D.end();

        graphicsDevice.endFrame();
    }
}

TurbulenzEngine.setInterval( update, 1000/60 );
