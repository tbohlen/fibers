/**
 * Created by martelly on 4/13/2014.
 */


class MenuState implements TurbGameState
{
    game:GameObject;
    returnState:TurbGameState;
    constructor(game:GameObject, returnState:TurbGameState = null)
    {
        this.game = game;
        this.returnState = returnState;
    }

    update():TurbGameState
    {
        var nextState:TurbGameState = this;
        if (this.game.graphicsDevice.beginFrame())
        {
            var bgColor = [0.2, 0.2, 0.0, 1.0];
            if (this.game.keyboard.keyPressed("S"))
            {
                bgColor = [0.7, 0.2, 0.0, 1.0];
            }
            if (this.game.keyboard.keyPressed("P"))
            {
                if (this.returnState == null)
                {
                    nextState = new PlayState(this.game);
                }
                else
                {
                    nextState = this.returnState;
                }
            }
            this.game.graphicsDevice.clear(bgColor, 1.0);
            this.game.graphicsDevice.endFrame();
        }

        return nextState;
    }
}