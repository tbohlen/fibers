/**
 * Created by martelly on 4/13/2014.
 */


class MenuState implements TurbGameState
{
    game:GameObject;
    returnState:TurbGameState;
    tileset:Tileset;
    constructor(game:GameObject, jsonMap:String, returnState:TurbGameState = null)
    {
        this.game = game;
        this.returnState = returnState;
        this.tileset = new Tileset(jsonMap+".json", game);
        var viewport:number[] = [];
        this.game.draw2D.getViewport(viewport);
    }

    update():TurbGameState
    {
        var nextState:TurbGameState = this;
        if (this.game.graphicsDevice.beginFrame())
        {
            this.game.graphicsDevice.clear(bgColor, 1.0);
            this.game.draw2D.begin(draw2D.blend.alpha, draw2D.sort.deferred);
            var bgColor = [0.3, 0.4, 0.0, 1.0];
            if (this.game.keyboard.keyPressed("S"))
            {
                bgColor = [0.7, 0.2, 0.0, 1.0];
            }
            if (this.game.keyboard.justPressed("P"))
            {
                nextState = this.returnState == null ? new PlayState(this.game) : this.returnState;
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
        return nextState;
    }
}