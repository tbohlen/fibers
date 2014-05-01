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
/// <reference path="PlayState.ts"/>
/// <reference path="progression.ts"/>
/// <reference path="MenuState.ts"/>
/// <reference path="InpDevWrapper.ts"/>
/// <reference path="masks.ts"/>


////////////////////////////////////////////////////////////////////////////////
// Create important objects and set up the game
////////////////////////////////////////////////////////////////////////////////

function objectMask(isSolid:boolean):number
{
    return isSolid ? ObjectMasks.SOLID : ObjectMasks.EMPTY;
}

var width:number = 1280;
var height:number = 720;
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
var mathDevice:MathDevice = TurbulenzEngine.createMathDevice({});

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
var sfxSource:SoundSource = soundDevice.createSource({
    looping: false
});

var htmlControls:HTMLControls = null;

///////////////////////////////////////////////////////////////////////////////
// The Game Object contains all high-level objects that support the game inself.
// Pretty much, put anything in here that you want to easily pass to a number of
// other objects.
///////////////////////////////////////////////////////////////////////////////

var game:GameObject = {
    engine : TurbulenzEngine,
    mathDevice : mathDevice,
    graphicsDevice : graphicsDevice,
    inputDevice: inputDevice,
    draw2D : draw2D,
    physicsDevice : physicsDevice,
    physicsWorld : dynamicWorld,
    keyboard : new InpDevWrapper(inputDevice, physicsDevice, collisionHelp),
    collisionHelp : collisionHelp,
    checkpointManager : new CheckpointManager(),
    collisionUtil : collisionUtil,
    progression : new Progression(TurbulenzEngine, "draft1Progression"),
    debugMode : false,
    nextState : null,
    soundDevice : soundDevice,
    bgMusicSource : bgMusicSource,
    sfxSource : sfxSource
};
game.progression.setGameObject(game);
game.checkpointManager.setGameObject(game);

var currentState:TurbGameState = new MenuState(game, "menuMain");

// run the game
function update()
{
    // update to the next state (can just pass in the same state)
    currentState.update();
    game.keyboard.update();
    if (game.nextState != null)
    {
        currentState = game.nextState;
        game.nextState = null;
    }
}

function loadHtmlControls() {
    htmlControls = HTMLControls.create();
    htmlControls.addSliderControl({
        id: "playerJumpSpeedSlider",
//        value: (player.JUMP_SPEED),
        max: 4,
        min: 0.1,
        step: 0.1,
        fn: function () {
            console.log("CHANGED PLAYER VELOCITY");
//            player.JUMP_SPEED = this.value;
//            htmlControls.updateSlider("playerJumpSpeedSlider", player.JUMP_SPEED);
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
