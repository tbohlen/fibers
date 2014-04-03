/// <reference path="jslib-modular/canvas.d.ts" />
/// <reference path="jslib-modular/debug.d.ts" />
/// <reference path="jslib-modular/fontmanager.d.ts" />
/// <reference path="jslib-modular/physics2d.d.ts" />
/// <reference path="jslib-modular/tzdraw2d.d.ts" />
/// <reference path="jslib-modular/turbulenz.d.ts" />
/// <reference path="jslib-modular/utilities.d.ts" />
/// <reference path="jslib-modular/vmath.d.ts" />

/// <reference path="player.ts"/>
/// <reference path="tileset.ts"/>
/// <reference path="rigidSprite.ts"/>
/// <reference path="platform.ts"/>
/// <reference path="interfaces.ts"/>


////////////////////////////////////////////////////////////////////////////////
// Create important objects and set up the game
////////////////////////////////////////////////////////////////////////////////
var graphicsDevice = TurbulenzEngine.createGraphicsDevice( {} );
var inputDevice = TurbulenzEngine.createInputDevice( {} );
// build the physics device to allow 2D constraint physics
var physicsDevice:Physics2DDevice = Physics2DDevice.create();
var dynamicWorld:Physics2DWorld = physicsDevice.createWorld({
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
    viewportRectangle: [0, 0, 640, 480]
});
// store information about the size of the screen
var viewport:number[] = [];
draw2D.getViewport(viewport);
var height:number = viewport[3]-viewport[1];
var width:number = viewport[2]-viewport[0];

var soundDevice:SoundDevice = TurbulenzEngine.createSoundDevice({});


///////////////////////////////////////////////////////////////////////////////
// The Game Object contains all high-level objects that support the game inself.
// Pretty much, put anything in here that you want to easily pass to a number of
// other objects.
///////////////////////////////////////////////////////////////////////////////
var game:GameObject = {
    engine : TurbulenzEngine,
    graphicsDevice : graphicsDevice,
    inputDevice: inputDevice,
    draw2D : draw2D,
    viewport : viewport,
    physicsDevice : physicsDevice,
    physicsWorld : dynamicWorld,
    debugMode : false
};


var bgColor = [0.0, 0.0, 0.0, 1.0];
// the tileset device manages the tiled maps
var tileset:Tileset = new Tileset("test.json", game);
// next we build a player, including the rigid body, sprite, and managing object
var playerParams:any = {
    x: 0,
    y: 0,
    width: 21,
    height: 21,
    color: [0.0, 1.0, 1.0, 1.0]
};
var playerSprite:Draw2DSprite = Draw2DSprite.create(playerParams);
var playerVertices:number[][] = physicsDevice.createRectangleVertices(-playerParams.width/2, -playerParams.height/2, playerParams.width/2, playerParams.height/2);

var playerShape:Physics2DShape = physicsDevice.createPolygonShape({
    vertices: playerVertices
});
var playerBody:Physics2DRigidBody = physicsDevice.createRigidBody({
    type: 'dynamic',
    shapes: [playerShape],
    mass: 10
});
var playerRigidSprite:RigidSprite = new RigidSprite(playerSprite, [0, 0], 0, playerBody);
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
var player:Player = new Player(playerRigidSprite, [width/2, 0]);
// add the player to the world
dynamicWorld.addRigidBody(playerBody);
// make platform, currently only used for testing
//TODO: remove this at some point and replace by generalized data structure
var platform = new Platform(physicsDevice, dynamicWorld);


// add event listeners
inputDevice.addEventListener("keydown", function(keycode){
    if (keycode === inputDevice.keyCodes.LEFT)
    {
        player.walkLeft();
    } else if (keycode === inputDevice.keyCodes.RIGHT)
    {
        player.walkRight();
    } else if (keycode === inputDevice.keyCodes.UP)
    {
        player.jump();
    } else if (keycode === inputDevice.keyCodes.W)
    {
        platform.rigidSprite.body.setVelocity([0, -1]);
    } else if (keycode === inputDevice.keyCodes.A)
    {
        platform.rigidSprite.body.setVelocity([-1, 0]);
    } else if (keycode === inputDevice.keyCodes.S)
    {
        platform.rigidSprite.body.setVelocity([0, 1]);
    } else if (keycode === inputDevice.keyCodes.D)
    {
        platform.rigidSprite.body.setVelocity([1, 0]);
    } else if (keycode === inputDevice.keyCodes.M)
    {
        game.debugMode = !game.debugMode;
        console.log ("Toggled debug to " + game.debugMode);
    } else
    {
        console.log(keycode);
    }
});

inputDevice.addEventListener("keyup", function(keycode){
    player.stopWalking();
    platform.rigidSprite.body.setVelocity([0, 0]);
    console.log("number of rigid bodies: " + dynamicWorld.rigidBodies.length);
});

// make the debug physics device
var physicsDebug:Physics2DDebugDraw = Physics2DDebugDraw.create({
    graphicsDevice: graphicsDevice
});
physicsDebug.setPhysics2DViewport(viewport);


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
            if (!tileset.ranLoadMap)
            {
                console.log("Running load map");
                tileset.loadMap();
            }
            tileset.draw(draw2D, player.getPosition());
        }

        // draw the player to the screen
        player.draw(draw2D);

        // draw platform
        platform.draw(draw2D, player.getPosition());

        draw2D.end();

        if (game.debugMode)
        {
            // physics2D debug drawing.
            physicsDebug.setScreenViewport(draw2D.getScreenSpaceViewport());
            physicsDebug.showRigidBodies = true;
            physicsDebug.showContacts = true;
            physicsDebug.begin();
            physicsDebug.drawWorld(dynamicWorld);
            physicsDebug.end();
        }

        graphicsDevice.endFrame();
    }
}

TurbulenzEngine.setInterval( update, 1000/60 );
