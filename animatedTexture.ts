/// <reference path="jslib-modular/turbulenz.d.ts" />

enum Direction {
    LEFT,
    RIGHT
}

class AnimatedTexture {
    texture:Texture;
    currentFrame:number = 0;
    didLoop:boolean = false;
    isReversed:boolean = false;
    isPaused:boolean = false;
    loopCallback:Function = null;
    keyframes:number[] = null;

    loadTexture(graphicsDevice:GraphicsDevice, callback?)
    {
        graphicsDevice.createTexture({
            src: this.textureFile,
            mipmaps: true,
            onload: (texture:Texture) =>
            {
                if (texture != null)
                {
                    this.texture = texture;
                    if (callback)
                    {
                        callback(texture);
                    }
                }
            }
        });
    }

    // handles keyframes in addition to standard setup
    getFrameCount():number
    {
        return this.keyframes ? this.keyframes.length : this.frameCount;
    }

    constructor(public textureFile:string, public frameDimensions:number[], public frameCount:number, public isLooping:boolean, public noAutoreset?:boolean)
    {}

    setNoAutoreset(noAutoreset)
    {
        this.noAutoreset = noAutoreset;
    }

    setTexture(n:number)
    {
        this.currentFrame = n % this.getFrameCount();
    }

    reverse()
    {
        this.isReversed = !this.isReversed;
        this.resetLoop();
    }

    pause()
    {
        this.isPaused = true;
    }

    play()
    {
        this.isPaused = false;
    }
    setReverse(isReversed)
    {
        this.isReversed = isReversed;
        this.resetLoop();
    }

    setLoopCallback(callback:Function) {
        this.loopCallback = callback;
    }

    updateCurrentFrame()
    {
        var frameCount:number = this.getFrameCount();
        var finalFrame:number = this.isReversed ? 0 : (frameCount - 1);
        var firstFrame:number = this.isReversed ? (frameCount - 1) : 0;

        if (!this.isPaused) {
            if (this.didLoop && this.isLooping == false) {
                this.currentFrame = finalFrame;
                // call callback, if any
                if (this.loopCallback)
                {
                    this.loopCallback();
                }
            } else {
                this.currentFrame = this.isReversed ? (this.currentFrame - 1) : (this.currentFrame + 1) % frameCount;

                if (this.isReversed && this.currentFrame < 0) {
                    this.currentFrame = frameCount - 1;
                }
                if (this.currentFrame == finalFrame) {
                    this.didLoop = true;
                }
            }
        }
    }

    resetLoop()
    {
        this.currentFrame = this.isReversed ? (this.getFrameCount() - 1) : 0;
        this.didLoop = false;
    }

    /*
    Return the texture rectangle for the current animation frame
     */
    currentFrameRectangle(facing?:Direction)
    {
        var trueCurrentFrame:number = this.keyframes ? this.keyframes[this.currentFrame] : this.currentFrame;
        var textureX = this.frameDimensions[0]*trueCurrentFrame;
        var textureY = 0;
        var textureWidth = this.frameDimensions[0];
        var textureHeight = this.frameDimensions[1];
        var textureRight = textureX+textureWidth;
        var textureBottom = textureY+textureHeight;

        if (facing == Direction.LEFT) {
            return [textureRight, textureY, textureX, textureBottom];
        } else {
            return [textureX, textureY, textureRight, textureBottom];
        }
    }

}