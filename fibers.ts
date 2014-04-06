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
/// <reference path="platform.ts"/>
/// <reference path="interfaces.ts"/>
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

var dynamicWorld:Physics2DWorld = physicsDevice.createWorld(physicsWorldParams);
var collisionUtil:Physics2DCollisionUtils = physicsDevice.createCollisionUtils();

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
    SPACE : false,
    W : false,
    A : false,
    S : false,
    D : false
};

var htmlControls:HTMLControls = null;

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
    draw2DSprite: Draw2DSprite,
    physicsDevice : physicsDevice,
    physicsWorld : dynamicWorld,
    collisionUtil : collisionUtil,
    debugMode : false,
    keys : keys
};

var interactables:InteractablesObject = {
    buildables: [],
    climbables: []
};

var viewport:number[] = [];
draw2D.getViewport(viewport);
var bgColor = [0.0, 0.0, 0.0, 1.0];

// the tileset device manages the tiled maps
var tileset:Tileset = new Tileset("test.json", game);
// build the player
var player:Player = new Player(game, [(viewport[3] - viewport[1])/2, 0], "assets/player/playerProfile.png");

// make platform, currently only used for testing
//TODO: remove this at some point and replace by generalized data structure
//var platform = new Platform(physicsDevice, dynamicWorld);


var shapeSize = 2;
var platformMaterial:Physics2DMaterial = game.physicsDevice.createMaterial({
    elasticity : 0,
    staticFriction : 0,
    dynamicFriction : 0
});
var chainShape:Physics2DShape = physicsDevice.createPolygonShape({
        vertices : game.physicsDevice.createRectangleVertices(-shapeSize/2, -shapeSize/2, shapeSize/2, shapeSize/2),
        material : platformMaterial,
        group : 2,
        mask : 0
    });
var chainBody:Physics2DRigidBody = game.physicsDevice.createRigidBody({
    type : 'kinematic',
    shapes : [chainShape],
    position : [0, 0]
});
var chainSprite:Draw2DSprite = Draw2DSprite.create({
    width: shapeSize,
    height: shapeSize,
    origin : [shapeSize / 2, shapeSize / 2],
    color: [1.0, 0.0, 0.0, 1.0]
});
game.physicsWorld.addRigidBody(chainBody);
var chainRigidSprite = new RigidSprite({
    sprite:chainSprite,
    initialPos:[0,0],
    body:chainBody
});
// make a buildable
var chain:Chain = new Chain({
    sprite : chainSprite,
    initialPos : [0, 0],
    body: chainBody,
    maxHeight: 100,
    minHeight: 0,
    width: 50
}, game);

interactables.buildables.push(chain);


///////////////////////////////////////////////////////////////////////////////
// Helper functions
///////////////////////////////////////////////////////////////////////////////

/*
 * Method: finBuildable
 * Searches through the registered buildables and returns the first one
 * encountered that is overlapping with the player. This helps with
 * build up and build down interactions.
 */
function findBuildable() : Buildable
{
    // checks all the buildables to figure out which is overlapping the player
    // TODO: make this smarter so that when a player is overlapping two items it does something intelligent...
    var bs:Buildable[] = interactables.buildables;
    for (var i:number = 0; i < bs.length; i++) {
        var test:Buildable = bs[i];
        console.log("testing");
        var shapeOne = player.rigidSprite.body.shapes[0];
        console.log("Player: " + player.rigidSprite.body.shapes[0]);
        console.log("Test: " + test.getBuildableShape());
        var shapeTwo = test.getBuildableShape();
        if (game.collisionUtil.intersects(shapeOne, shapeTwo))
        {
            console.log("success");
            return test;
        }
        else
        {
            console.log("Failure");
        }
    }
    return null;
}


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
    } else if (keycode === inputDevice.keyCodes.W)
    {
        game.keys.W = false;
        chain.body.setVelocity([0, 0]);
    } else if (keycode === inputDevice.keyCodes.A)
    {
        game.keys.A = false;
        chain.body.setVelocity([0, 0]);
    } else if (keycode === inputDevice.keyCodes.S)
    {
        game.keys.S = false;
        chain.body.setVelocity([0, 0]);
    } else if (keycode === inputDevice.keyCodes.D)
    {
        game.keys.D = false;
        chain.body.setVelocity([0, 0]);

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
        // handle key presses
        if (keys.LEFT)
        {
            player.walkLeft();
        }

        if (keys.RIGHT)
        {
            player.walkRight();
        }
        if (keys.UP && !keys.SPACE)
        {
            player.goUp();
        }
        if (keys.UP && keys.SPACE)
        {
            var buildable:Buildable = findBuildable();
            if (buildable != null)
            {
                console.log("Found a buildable");
                buildable.buildUp();
            }
            else
            {
                console.log("Did not find body");
            }
        }
        if (keys.DOWN && keys.SPACE)
        {
            var buildable:Buildable = findBuildable();
            if (buildable != null)
            {
                console.log("Found a buildable");
                buildable.buildDown();
            }
            else
            {
                console.log("Did not find bdoy");
            }
        }
        if (keys.W)
        {
            chain.body.setVelocity([0, -0.2]);
        }
        if (keys.A)
        {
            chain.body.setVelocity([-0.2, 0]);
        }
        if (keys.S)
        {
            chain.body.setVelocity([0, 0.2]);
        }
        if (keys.D)
        {
            chain.body.setVelocity([0.2, 0]);
        }

        // simulate a step of the physics by simulating a bunch of small steps until we add up to 1/60 seconds
        var startTime:number = dynamicWorld.simulatedTime;
        while( dynamicWorld.simulatedTime < startTime + 1/60 )
        {
            dynamicWorld.step(1000/60); // I think this should go elsewhere... or be wrapped in a test and looped
        }

        player.update();

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
                var newObjects:InteractablesObject = tileset.loadMap();

                // combine the newly loaded objects with anything already existing
                for (var key in newObjects) {
                    if (newObjects.hasOwnProperty(key) && interactables.hasOwnProperty(key)) {
                        interactables[key] = interactables[key].concat(newObjects[key]);
                    }
                }
            }
            tileset.draw(draw2D, offset);
        }

        // draw the player to the screen
        player.draw(draw2D, offset);

        // draw platform
        //platform.draw(draw2D, offset);
        chain.draw(draw2D, offset);

        draw2D.end();

        if (game.debugMode)
        {
            // physics2D debug drawing.
            var screenSpacePort:number[] = draw2D.getScreenSpaceViewport();
            var physicsPort:number[] = [];
            physicsPort[0] = screenSpacePort[0] - offset[0];
            physicsPort[1] = screenSpacePort[1] - offset[1];
            physicsPort[2] = screenSpacePort[2];
            physicsPort[3] = screenSpacePort[3];
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
            player = new Player(game, [(viewport[3] - viewport[1])/2, 0], "assets/player/playerProfile.png");
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