/**
 * Created by martelly on 4/13/2014.
 */

/// <reference path="interfaces.ts"/>

class MenuState extends TurbGameState
{
    game:GameObject;
    returnState:TurbGameState;
    tileset:Tileset;
    public static bgColor:number[] = [0, 0, 0.0, 1.0];
    constructor(game:GameObject, jsonMap:String, returnState:TurbGameState = null)
    {
        super(game);
        this.game = game;

        this.returnState = returnState;
        this.tileset = new Tileset(jsonMap+".json", game);
        var viewport:number[] = [];
        this.game.draw2D.getViewport(viewport);
    }

    update()
    {
        if (this.game.graphicsDevice.beginFrame())
        {
            console.log("made the menu update");
            this.game.graphicsDevice.clear(MenuState.bgColor, 1.0);
            this.game.draw2D.begin(draw2D.blend.alpha, draw2D.sort.deferred);
            if (this.game.keyboard.justPressed("P"))
            {
                this.game.nextState = this.returnState == null ? this.game.progression.getNextState() : this.returnState;
            }
            if (this.tileset.isLoaded())
            {
                if (!this.tileset.ranLoadMap) {
                    console.log("Loading menu tileset");
                    this.tileset.loadMap();
                }
                this.tileset.draw(this.game.draw2D, [0, 0]);
            }

            this.game.draw2D.end();

            this.game.graphicsDevice.endFrame();
        }
    }
}