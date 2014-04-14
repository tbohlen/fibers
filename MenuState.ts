/**
 * Created by martelly on 4/13/2014.
 */


class MenuState implements TurbGameState
{
    game:GameObject;
    constructor(game:GameObject)
    {
        this.game = game;
    }

    update():void
    {
        if (this.game.graphicsDevice.beginFrame())
        {
            var bgColor = [0.2, 0.2, 0.0, 1.0];
            if (this.game.keyboard.keyPressed("S"))
            {
                bgColor = [0.7, 0.2, 0.0, 1.0];
            }
            this.game.graphicsDevice.clear(bgColor, 1.0);
            this.game.graphicsDevice.endFrame();
        }
    }
}