/**
 * Created by martelly on 5/5/2014.
 */

class AnimationHelper
{
    animations:Animation[];
    constructor()
    {
        this.animations = []
    }

    update()
    {
        for (var i = 0; i < this.animations.length; i++)
        {
            this.animations[i].drawNextFrame();
        }
    }
}

class Animation
{
    game:GameObject;
    callback:Function;
    totalFrameCount:number;
    currentFrameCount:number;
    constructor(public textureFileName:string, public frameDimensions:number[],
                public frameCount:number, public durationSeconds:number, public fps:number,
                public finalCallback:Function)
    {
        this.currentFrameCount = 0;
        this.totalFrameCount = durationSeconds/fps;
    }

    drawNextFrame():void
    {
        // draw something here
        this.currentFrameCount += 1;
    }
}