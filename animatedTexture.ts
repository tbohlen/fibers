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

    loadTexture(graphicsDevice:GraphicsDevice)
    {
        graphicsDevice.createTexture({
            src: this.textureFile,
            mipmaps: true,
            onload: (texture:Texture) =>
            {
                if (texture != null)
                {
                    this.texture = texture;
                }
            }
        });
    }

    constructor(public textureFile:string, public frameDimensions:number[], public frameCount:number, public isLooping:boolean)
    {}

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

    updateCurrentFrame()
    {
        var finalFrame:number = this.isReversed ? 0 : (this.frameCount - 1);
        var firstFrame:number = this.isReversed ? (this.frameCount - 1) : 0;
        if (!this.isPaused) {
            if (this.didLoop && this.isLooping == false) {
                this.currentFrame = finalFrame;
            } else {
                if (this.currentFrame == finalFrame) {
                    this.didLoop = true;
                }
                this.currentFrame = this.isReversed ? (this.currentFrame - 1) : (this.currentFrame + 1) % this.frameCount;

                if (this.isReversed && this.currentFrame < 0) {
                        this.currentFrame = this.frameCount - 1;
                }
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
    currentFrameRectangle(facing:Direction)
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