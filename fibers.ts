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
    gravity: [0, 0.001],
    velocityIterations: 5,
    positionIterations: 5
});
// this object draws everything to the screen
var draw2D = Draw2D.create({
    graphicsDevice: graphicsDevice
});
var success = draw2D.configure({
    scaleMode: 'scale',
    viewportRectangle: [0, 0, 640, 480]
});

var soundDevice:SoundDevice = TurbulenzEngine.createSoundDevice({});
var bgMusicSource:SoundSource = soundDevice.createSource({
    looping: true
});
var bgMusic:Sound = soundDevice.createSound({
    src: "assets/music/In_The_Dark_Flashes.mp3",
    uncompress: false,
    onload: function(soundData)
    {
        bgMusicSource.play(soundData);
    }
});
// store states of buttons to keep track of when they are down or up
var keys:KeyObject = {
    LEFT : false,
    RIGHT : false,
    UP : false,
    W : false,
    A : false,
    S : false,
    D : false
}

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
    physicsDevice : physicsDevice,
    physicsWorld : dynamicWorld,
    debugMode : false,
    keys : keys
};

var viewport:number[] = [];
draw2D.getViewport(viewport);
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
    mass: 10,
    linearDrag: 0.001
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
var player:Player = new Player(playerRigidSprite, [(viewport[3] - viewport[1])/2, 0]);
// add the player to the world
dynamicWorld.addRigidBody(playerBody);
// make platform, currently only used for testing
//TODO: remove this at some point and replace by generalized data structure
var platform = new Platform(physicsDevice, dynamicWorld);


///////////////////////////////////////////////////////////////////////////////
// add event listeners
///////////////////////////////////////////////////////////////////////////////
inputDevice.addEventListener("keydown", function(keycode){
    if (keycode === inputDevice.keyCodes.LEFT)
    {
        game.keys.LEFT = true;
    } else if (keycode === inputDevice.keyCodes.RIGHT)
    {
        game.keys.RIGHT = true;
    } else if (keycode === inputDevice.keyCodes.UP)
    {
        game.keys.UP = true;
    } else if (keycode === inputDevice.keyCodes.W)
    {
        game.keys.W = true;
    } else if (keycode === inputDevice.keyCodes.A)
    {
        game.keys.A = true;
    } else if (keycode === inputDevice.keyCodes.S)
    {
        game.keys.S = true;
    } else if (keycode === inputDevice.keyCodes.D)
    {
        game.keys.D = true;
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
    if (keycode === inputDevice.keyCodes.LEFT)
    {
        game.keys.LEFT = false;
        player.stopWalking();
    } else if (keycode === inputDevice.keyCodes.RIGHT)
    {
        game.keys.RIGHT = false;
        player.stopWalking();
    } else if (keycode === inputDevice.keyCodes.UP)
    {
        game.keys.UP = false;
    } else if (keycode === inputDevice.keyCodes.W)
    {
        game.keys.W = false;
        platform.rigidSprite.body.setVelocity([0, 0]);
    } else if (keycode === inputDevice.keyCodes.A)
    {
        game.keys.A = false;
        platform.rigidSprite.body.setVelocity([0, 0]);
    } else if (keycode === inputDevice.keyCodes.S)
    {
        game.keys.S = false;
        platform.rigidSprite.body.setVelocity([0, 0]);
    } else if (keycode === inputDevice.keyCodes.D)
    {
        game.keys.D = false;
        platform.rigidSprite.body.setVelocity([0, 0]);
    }
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
        // handle key presses
        if (keys.LEFT)
        {
            player.walkLeft();
        }

        if (keys.RIGHT)
        {
            player.walkRight();
        }
        if (keys.UP)
        {
            player.jump();
        }
        if (keys.W)
        {
            platform.rigidSprite.body.setVelocity([0, -0.2]);
        }
        if (keys.A)
        {
            platform.rigidSprite.body.setVelocity([-0.2, 0]);
        }
        if (keys.S)
        {
            platform.rigidSprite.body.setVelocity([0, 0.2]);
        }
        if (keys.D)
        {
            platform.rigidSprite.body.setVelocity([0.2, 0]);
        }

        // simulate a step of the physics by simulating a bunch of small steps until we add up to 1/60 seconds
        var startTime:number = dynamicWorld.simulatedTime;
        while( dynamicWorld.simulatedTime < startTime + 1/60 )
        {
            dynamicWorld.step(1000/60); // I think this should go elsewhere... or be wrapped in a test and looped
        }

        player.update();

        // find the offset of all things displayed to screen
        // just keep the player centered
        var offset:number[] = [];

        var currentViewport:number[] = [];
        draw2D.getViewport(currentViewport);
        var playerPos:number[] = player.rigidSprite.body.getPosition();
        offset[0] = playerPos[0] - ( (currentViewport[2] - currentViewport[0]) / 2);
        offset[1] = playerPos[1] - ( (currentViewport[3] - currentViewport[1]) / 2);
        graphicsDevice.clear( bgColor, 1.0 );

        draw2D.begin();

        if (tileset.isLoaded())
        {
            if (!tileset.ranLoadMap)
            {
                console.log("Running load map");
                tileset.loadMap();
            }
            tileset.draw(draw2D, offset);
        }

        // draw the player to the screen
        player.draw(draw2D, offset);

        // draw platform
        platform.draw(draw2D, offset);

        draw2D.end();

        if (game.debugMode)
        {
            // physics2D debug drawing.
            var screenSpacePort:number[] = draw2D.getScreenSpaceViewport();
            var physicsViewport:number[] = [];
            physicsViewport[0] = screenSpacePort[0] - offset[0];
            physicsViewport[1] = screenSpacePort[1] - offset[1];
            physicsViewport[2] = screenSpacePort[2] - offset[0];
            physicsViewport[3] = screenSpacePort[3] - offset[1];

            physicsDebug.setScreenViewport(physicsViewport);
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
