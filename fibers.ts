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

var graphicsDevice = TurbulenzEngine.createGraphicsDevice( {} );
var inputDevice = TurbulenzEngine.createInputDevice( {} );

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
var viewport:number[] = [];
draw2D.getViewport(viewport);
var height:number = viewport[3]-viewport[1];
var width:number = viewport[2]-viewport[0];

// the tileset device manages the tiled maps
var tileset = new Tileset("test.json", graphicsDevice, TurbulenzEngine);


// next we build a player, including the rigid body, sprite, and managing object
var playerParams:any = {
    x: 0,
    y: 0,
    width: 64,
    height: 128,
    color: [0.0, 1.0, 1.0, 1.0],
    scale: [0.25, 0.25]
};
var playerSprite:Draw2DSprite = Draw2DSprite.create(playerParams);
var playerVertices:number[] = physicsDevice.createRectangleVertices(0, 0, 64, 128);
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
var player:Player = new Player(playerSprite, playerBody, [width/2, 25]);

// add the player to the world
dynamicWorld.addRigidBody(playerBody);


// add event listeners
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


// run the game
function update()
{
    var i:number = 0;
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
