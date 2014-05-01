/**
 * Created by martelly on 4/13/2014.
 */
/// <reference path="interfaces.ts"/>
/// <reference path="MenuState.ts"/>
/// <reference path="HUD.ts"/>

class PlayState extends TurbGameState
{
    game:GameObject;
    defaultTileSet:string;
    tileset:Tileset;
    player:Player;
    hud:HUD;
    physicsDebug:Physics2DDebugDraw;
    mapSize:number[] = [Infinity, Infinity];
    constructor(game:GameObject, jsonMap:string = "dynamicTest")
    {
        super(game);
        super.clearWorld();
        console.log("passed map is " + jsonMap);
        this.game = game;
        // the tileset device manages the tiled maps
        this.defaultTileSet = jsonMap;
        $("#levelNameinput").val(this.defaultTileSet);
        this.tileset = new Tileset(this.defaultTileSet+".json", game);
        var viewport:number[] = [];
        this.game.draw2D.getViewport(viewport);
        // build the player
        this.player = new Player(game, [70, 0]);
        game.collisionHelp.setPlayer(this.player);
        // make the HUD
        this.hud = new HUD(game);
        // make the debug physics device
        this.physicsDebug = Physics2DDebugDraw.create({
            graphicsDevice: this.game.graphicsDevice
        });
        this.physicsDebug.setPhysics2DViewport(viewport);

        $("#levelNameinput").keyup((e:KeyboardEvent)=>
        {
            // load level when player presses enter
            if (e.keyCode === 13)
            {
                console.log("loading new level...");
                this.switchLevel();
            }
        });
    }

    switchLevel()
    {
        var levelName:string = $("#levelNameinput").val();

        this.tileset.kill(); // kill all interaction with the old tileset
        this.game.nextState = new PlayState(this.game, levelName);
    }

    loadMapIfNecessary()
    {
        if (!this.tileset.ranLoadMap)
        {
            console.log("Running load map");
            this.mapSize = this.tileset.loadMap();
            // look for a spawn point and move the player if you found one
            if (this.game.hasOwnProperty("spawn") && this.game.spawn != null) {
                console.log("Setting spawn");
                // need to correct for different origins
                // TODO: sort out all the damn origins!
                var loc:number[] = this.game.spawn.getLocation();
                loc[0]+=32;
                this.player.setPosition(loc);
            }
        }
    }

    checkOffset(offset):number[]
    {

        if (offset[0] < 0)
        {
            offset[0] = 0
        }
        else if (offset[0] > this.mapSize[0] - width)
        {
            offset[0] = this.mapSize[0] - width;
        }

        if (offset[1] < 0)
        {
            offset[1] = 0;
        }
        else if (offset[1] > this.mapSize[1] - height)
        {
            offset[1] = this.mapSize[1] - height;
        }
        return offset;
    }

    update()
    {

        if (this.game.graphicsDevice.beginFrame())
        {
            // check for debug mode change
            if (this.game.keyboard.justPressed("M")) {
                this.game.debugMode = !this.game.debugMode;
            }
            if (this.game.keyboard.justPressed("P"))
            {
                this.game.nextState = new MenuState(this.game, "menuMain", this);
            }
            if (this.game.keyboard.justPressed("H"))
            {
                this.game.nextState = this.game.progression.getNewCurrentState();
            }

            // simulate a step of the physics by simulating a bunch of small steps until we add up to 1/60 seconds
            var startTime:number = this.game.physicsWorld.simulatedTime;
            while( this.game.physicsWorld.simulatedTime < startTime + 1/60 )
            {
                this.game.physicsWorld.step(1000/60); // This is really silly because the step size is actually in seconds but leaving it be is better
            }

            this.player.update();
            this.game.collisionHelp.checkCollision();

            // find the offset of all things displayed to screen to keep the player center
            // set this as the viewport
            var offset:number[] = [];
            var playerPos:number[] = this.player.rigidSprite.body.getPosition();
            offset[0] = playerPos[0] - (width / 2);
            offset[1] = playerPos[1] - (height / 2);
            offset = this.checkOffset(offset);

            var bgColor = [0.25, 0.426, 0.594, 1.0];
            this.game.graphicsDevice.clear( bgColor, 1.0 );

            this.game.draw2D.begin(draw2D.blend.alpha, draw2D.sort.deferred);

            if (this.tileset.isLoaded())
            {
                this.loadMapIfNecessary();
                this.tileset.draw(draw2D, offset);
            }

            // draw the HUD to the screen
            this.hud.draw(draw2D, offset);

            // draw the player to the screen
            this.player.draw(draw2D, offset);

            this.game.draw2D.end();

            if (this.game.debugMode)
            {
                // physics2D debug drawing.
                var screenSpacePort:number[] = draw2D.getScreenSpaceViewport();
                var physicsPort:number[] = [];
                physicsPort[0] = screenSpacePort[0] - offset[0];
                physicsPort[1] = screenSpacePort[1] - offset[1];
                physicsPort[2] = screenSpacePort[2] - offset[0];
                physicsPort[3] = screenSpacePort[3] - offset[1];
                this.physicsDebug.setScreenViewport(physicsPort);
                this.physicsDebug.showRigidBodies = true;
                this.physicsDebug.showContacts = true;
                this.physicsDebug.begin();
                this.physicsDebug.drawWorld(this.game.physicsWorld);
                this.physicsDebug.end();
            }

            this.game.graphicsDevice.endFrame();
        }
    }
}