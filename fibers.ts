/// <reference path="jslib-modular/canvas.d.ts" />
/// <reference path="jslib-modular/debug.d.ts" />
/// <reference path="jslib-modular/fontmanager.d.ts" />
/// <reference path="jslib-modular/physics2d.d.ts" />
/// <reference path="jslib-modular/tzdraw2d.d.ts" />
/// <reference path="jslib-modular/turbulenz.d.ts" />
/// <reference path="jslib-modular/utilities.d.ts" />
/// <reference path="jslib-modular/vmath.d.ts" />
/// <reference path="scripts/htmlcontrols.d.ts" />

/// <reference path="player.ts"/>
/// <reference path="tileset.ts"/>
/// <reference path="rigidSprite.ts"/>
/// <reference path="interfaces.ts"/>
/// <reference path="CollisionHelper.ts"/>
/// <reference path="mixins.ts"/>
/// <reference path="chain.ts"/>


// group bits
// player = 1
// knitting needles & other things the player should not run into = 2
// climbable things and other things the player can overlap but still interact with = 4
// things that collide normally = 8
//
// Masks
// Knitting needles mask = 0 - they interact with nothing
// Player mask = 13 - interacts with everything but needles
// Climbable mask = 13
// Other mask = 13

////////////////////////////////////////////////////////////////////////////////
// Create important objects and set up the game
////////////////////////////////////////////////////////////////////////////////

var width:number = 640;
var height:number = 480;
var graphicsDevice = TurbulenzEngine.createGraphicsDevice( {} );
var inputDevice = TurbulenzEngine.createInputDevice( {} );
// build the physics device to allow 2D constraint physics
var physicsDevice:Physics2DDevice = Physics2DDevice.create();
var physicsWorldParams:any = {
    gravity: [0, 0.001],
    velocityIterations: 5,
    positionIterations: 5
};

// TODO: Figure out why this function doesn't work!!!
//var mathDevice = TurbulenzEngine.createMathDevice({});

var dynamicWorld:Physics2DWorld = physicsDevice.createWorld(physicsWorldParams);
var collisionUtil:Physics2DCollisionUtils = physicsDevice.createCollisionUtils();
var collisionHelp:CollisionHelper = new CollisionHelper(physicsDevice);

// this object draws everything to the screen
var draw2D = Draw2D.create({
    graphicsDevice: graphicsDevice
});
var success = draw2D.configure({
    scaleMode: 'scale',
    viewportRectangle: [0, 0, width, height]
});

var soundDevice:SoundDevice = TurbulenzEngine.createSoundDevice({});
var bgMusicSource:SoundSource = soundDevice.createSource({
    looping: true
});
if (false) {
    var bgMusic:Sound = soundDevice.createSound({
        src: "assets/music/In_The_Dark_Flashes.mp3",
        uncompress: false,
        onload: function (soundData) {
            bgMusicSource.play(soundData);
        }
    });
}

// store states of buttons to keep track of when they are down or up
var keys:KeyObject = {
    LEFT : false,
    RIGHT : false,
    UP : false,
    SPACE : false,
    E:false,
    W : false,
    A : false,
    S : false,
    D : false,
    T : false,
    F : false,
    G : false,
    H : false
};

var htmlControls:HTMLControls = null;

///////////////////////////////////////////////////////////////////////////////
// The Game Object contains all high-level objects that support the game inself.
// Pretty much, put anything in here that you want to easily pass to a number of
// other objects.
///////////////////////////////////////////////////////////////////////////////

var game:GameObject = {
    engine : TurbulenzEngine,
    //mathDevice : mathDevice,
    graphicsDevice : graphicsDevice,
    inputDevice: inputDevice,
    draw2D : draw2D,
    physicsDevice : physicsDevice,
    physicsWorld : dynamicWorld,
    collisionHelp : collisionHelp,
    collisionUtil : collisionUtil,
    debugMode : false,
    keys : keys
};

var viewport:number[] = [];
draw2D.getViewport(viewport);
var bgColor = [0.0, 0.0, 0.0, 1.0];

// the tileset device manages the tiled maps
var defaultTileSet:string = "cubeTest";
$("#levelNameinput").val(defaultTileSet);
var tileset:Tileset = new Tileset(defaultTileSet+".json", game);
// build the player
var player:Player = new Player(game, [(viewport[3] - viewport[1])/2, 0]);
game.collisionHelp.setPlayer(player);

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
    } else if (keycode === inputDevice.keyCodes.E)
    {
        game.keys.E = true;
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
    } else if (keycode === inputDevice.keyCodes.T)
    {
        game.keys.T = true;
    } else if (keycode === inputDevice.keyCodes.F)
    {
        game.keys.F = true;
    } else if (keycode === inputDevice.keyCodes.G)
    {
        game.keys.G = true;
    } else if (keycode === inputDevice.keyCodes.H)
    {
        game.keys.H = true;
    } else if (keycode === inputDevice.keyCodes.M)
    {
        game.debugMode = !game.debugMode;
        console.log ("Toggled debug to " + game.debugMode);
    } else if (keycode === inputDevice.keyCodes.DOWN)
    {
        game.keys.DOWN = true;
    } else if (keycode === inputDevice.keyCodes.SPACE)
    {
        game.keys.SPACE = true;
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
    } else if (keycode === inputDevice.keyCodes.DOWN)
    {
        game.keys.DOWN = false;
    } else if (keycode === inputDevice.keyCodes.E)
    {
        game.keys.E = false;
    } else if (keycode === inputDevice.keyCodes.W)
    {
        game.keys.W = false;
    } else if (keycode === inputDevice.keyCodes.A)
    {
        game.keys.A = false;
    } else if (keycode === inputDevice.keyCodes.S)
    {
        game.keys.S = false;
    } else if (keycode === inputDevice.keyCodes.D)
    {
        game.keys.D = false;

    } else if (keycode === inputDevice.keyCodes.T)
    {
        game.keys.T = false;
    } else if (keycode === inputDevice.keyCodes.F)
    {
        game.keys.F = false;
    } else if (keycode === inputDevice.keyCodes.G)
    {
        game.keys.G = false;
    } else if (keycode === inputDevice.keyCodes.H)
    {
        game.keys.H = false;
    } else if (keycode === inputDevice.keyCodes.SPACE)
    {
        game.keys.SPACE = false;
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
        // simulate a step of the physics by simulating a bunch of small steps until we add up to 1/60 seconds
        var startTime:number = dynamicWorld.simulatedTime;
        while( dynamicWorld.simulatedTime < startTime + 1/60 )
        {
            dynamicWorld.step(1000/60); // I think this should go elsewhere... or be wrapped in a test and looped
        }

        player.update();
        game.collisionHelp.checkCollision();

        // find the offset of all things displayed to screen to keep the player center
        // set this as the viewport
        var offset:number[] = [];
        var playerPos:number[] = player.rigidSprite.body.getPosition();
        offset[0] = playerPos[0] - (width / 2);
        offset[1] = playerPos[1] - (height / 2);

        graphicsDevice.clear( bgColor, 1.0 );

        draw2D.begin(draw2D.blend.alpha, draw2D.sort.deferred);

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

        draw2D.end();

        if (game.debugMode)
        {
            // physics2D debug drawing.
            var screenSpacePort:number[] = draw2D.getScreenSpaceViewport();
            var physicsPort:number[] = [];
            physicsPort[0] = screenSpacePort[0] - offset[0];
            physicsPort[1] = screenSpacePort[1] - offset[1];
            physicsPort[2] = screenSpacePort[2] - offset[0];
            physicsPort[3] = screenSpacePort[3] - offset[1];
            physicsDebug.setScreenViewport(physicsPort);
            physicsDebug.showRigidBodies = true;
            physicsDebug.showContacts = true;
            physicsDebug.begin();
            physicsDebug.drawWorld(dynamicWorld);
            physicsDebug.end();
        }

        graphicsDevice.endFrame();
    }
}

function loadHtmlControls() {
    htmlControls = HTMLControls.create();
    htmlControls.addSliderControl({
        id: "playerJumpSpeedSlider",
        value: (player.JUMP_SPEED),
        max: 4,
        min: 0.1,
        step: 0.1,
        fn: function () {
            console.log("CHANGED PLAYER VELOCITY");
            player.JUMP_SPEED = this.value;
            htmlControls.updateSlider("playerJumpSpeedSlider", player.JUMP_SPEED);
        }
    });

    $("#levelNameinput").keyup(function(e:KeyboardEvent){
        // load level when player presses enter
        // does not work yet...
        if (e.keyCode === 13)
        {
            console.log("pressed enter...");
            var mapName:string = $("#levelNameinput").val();
            dynamicWorld.clear();
            tileset = new Tileset(mapName+".json", game);
            // need to actually place player in desired location for map
            player = new Player(game, [(viewport[3] - viewport[1])/2, 0]);
        }
    });

//    htmlControls.addSliderControl({
//        id: "dampingSlider",
//        value: (damping),
//        max: 2,
//        min: 0,
//        step: 0.25,
//        fn: function () {
//            damping = this.value;
//            htmlControls.updateSlider("dampingSlider", damping);
//            if (elasticConstraints) {
//                invalidateConstraints();
//            }
//        }
//    });
    htmlControls.register();
}

loadHtmlControls();

TurbulenzEngine.setInterval( update, 1000/60 );

//Mixins.mixinExample();
