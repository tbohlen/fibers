/**
 * Created by martelly on 4/24/2014.
 */

/**
 * Basically exactly the same as the menu state except that the button "A" advances
 * the scene
 */
class CutsceneState extends TurbGameState
{
    game:GameObject;
    tileset:Tileset;
    public static bgColor:number[] = [0.3, 0.4, 0.0, 1.0];
    constructor(game:GameObject, jsonMap:String)
    {
        super(game);
        super.clearWorld();
        this.game = game;

        this.tileset = new Tileset(jsonMap+".json", game);
        var viewport:number[] = [];
        this.game.draw2D.getViewport(viewport);
    }

    update()
    {
        super.update();
        this.game.graphicsDevice.clear(CutsceneState.bgColor, 1.0);
        this.game.draw2D.begin(draw2D.blend.alpha, draw2D.sort.deferred);
        if (this.game.keyboard.justPressed("A"))
        {
            this.game.nextState = this.game.progression.getNextState();
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
    }
}