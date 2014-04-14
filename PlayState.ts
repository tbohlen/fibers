/**
 * Created by martelly on 4/13/2014.
 */
/// <reference path="interfaces.ts"/>

class PlayState implements TurbGameState
{
    game:GameObject;
    defaultTileSet:string;
    tileset:Tileset;
    player:Player;
    physicsDebug:Physics2DDebugDraw;
    constructor(game:GameObject)
    {
        this.game = game;
        // the tileset device manages the tiled maps
        this.defaultTileSet = "tutorial";
        $("#levelNameinput").val(this.defaultTileSet);
        this.tileset = new Tileset(this.defaultTileSet+".json", game);
        var viewport:number[] = [];
        this.game.draw2D.getViewport(viewport);
        // build the player
        this.player = new Player(game, [(viewport[3] - viewport[1])/2, 0]);
        game.collisionHelp.setPlayer(this.player);
        // make the debug physics device
        this.physicsDebug = Physics2DDebugDraw.create({
            graphicsDevice: this.game.graphicsDevice
        });
        this.physicsDebug.setPhysics2DViewport(viewport);
    }

    update():TurbGameState
    {
        var nextState:TurbGameState = null;
        var i:number = 0;
        if (this.game.graphicsDevice.beginFrame())
        {
            // check for debug mode change
            if (this.game.keyboard.keyPressed("M")) {
                this.game.debugMode = !this.game.debugMode;
            }
            if (this.game.keyboard.keyPressed("P"))
            {
                nextState = new MenuState(this.game, this);
            }
            // simulate a step of the physics by simulating a bunch of small steps until we add up to 1/60 seconds
            var startTime:number = this.game.physicsWorld.simulatedTime;
            while( this.game.physicsWorld.simulatedTime < startTime + 1/60 )
            {
                this.game.physicsWorld.step(1000/60); // I think this should go elsewhere... or be wrapped in a test and looped
            }

            this.player.update();
            this.game.collisionHelp.checkCollision();

            // find the offset of all things displayed to screen to keep the player center
            // set this as the viewport
            var offset:number[] = [];
            var playerPos:number[] = this.player.rigidSprite.body.getPosition();
            offset[0] = playerPos[0] - (width / 2);
            offset[1] = playerPos[1] - (height / 2);

            var bgColor = [0.0, 0.0, 0.0, 1.0];
            this.game.graphicsDevice.clear( bgColor, 1.0 );

            this.game.draw2D.begin(draw2D.blend.alpha, draw2D.sort.deferred);

            if (this.tileset.isLoaded())
            {
                if (!this.tileset.ranLoadMap)
                {
                    console.log("Running load map");
                    this.tileset.loadMap();
                }
                this.tileset.draw(draw2D, offset);
            }

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
                this.physicsDebug.drawWorld(dynamicWorld);
                this.physicsDebug.end();
            }

            this.game.graphicsDevice.endFrame();
        }
        return nextState;
    }
}