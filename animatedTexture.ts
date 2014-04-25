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

    constructor(public textureFile:string, public frameDimensions:number[], public frameCount:number, public isLooping:boolean, public noAutoreset?:boolean)
    {}

    setNoAutoreset(noAutoreset)
    {
        this.noAutoreset = noAutoreset;
    }

    setTexture(n:number)
    {
        this.currentFrame = n % this.frameCount;
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
        var finalFrame:number = this.isReversed ? 0 : (this.frameCount - 1);
        var firstFrame:number = this.isReversed ? (this.frameCount - 1) : 0;
        if (!this.isPaused) {
            if (this.didLoop && this.isLooping == false) {
                this.currentFrame = finalFrame;

                // call callback, if any
                if (this.loopCallback)
                {
                    this.loopCallback();
                }
            } else {
                this.currentFrame = this.isReversed ? (this.currentFrame - 1) : (this.currentFrame + 1) % this.frameCount;

                if (this.isReversed && this.currentFrame < 0) {
                    this.currentFrame = this.frameCount - 1;
                }

                if (this.currentFrame == finalFrame) {
                    this.didLoop = true;
                }
                    /*
        if (this.didLoop && this.isLooping == false)
        {
            if (this.noAutoreset && !this.isReversed)
            {
                this.currentFrame = this.frameCount - 1;
            }
            else {
                console.log("MOVE 1");
                this.currentFrame = 0;
            }

            // call callback, if any
            if (this.loopCallback)
            {
                this.loopCallback();
            }
        } else {
            if (this.isReversed) {
                // increment
                console.log("MOVE 2");
                this.currentFrame = (this.currentFrame - 1);
                if (this.currentFrame < 0) {
                    this.currentFrame = this.frameCount - 1;
                }

                // test for didLoop
                if ((!this.noAutoreset && this.currentFrame == (this.frameCount - 1))
                    || (this.noAutoreset && this.currentFrame == 0))
                {
                    this.didLoop = true;
                }
            } else {
                // increment
                this.currentFrame = (this.currentFrame + 1) % this.frameCount;

                // test for didLoop
                if ((!this.noAutoreset && this.currentFrame == 0)
                    || (this.noAutoreset && this.currentFrame == (this.frameCount - 1))) {
                    this.didLoop = true;
                }
                     */
            }
        }
    }

    resetLoop()
    {
        this.currentFrame = this.isReversed ? (this.frameCount - 1) : 0;
        this.didLoop = false;
    }

    /*
    Return the texture rectangle for the current animation frame
     */
    currentFrameRectangle(facing?:Direction)
    {
        var textureX = this.frameDimensions[0]*this.currentFrame;
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