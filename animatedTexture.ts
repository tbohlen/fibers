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

    updateCurrentFrame()
    {
        if (this.didLoop && this.isLooping == false)
        {
            this.currentFrame = 0;
        } else {
            if (this.isReversed) {
                if (this.currentFrame == 0) {
                    this.didLoop = true;
                }
                this.currentFrame = (this.currentFrame - 1);
                if (this.currentFrame < 0) {
                    this.currentFrame = this.frameCount - 1;
                }
            } else {
                if (this.currentFrame == (this.frameCount - 1)) {
                    this.didLoop = true;
                }
                this.currentFrame = (this.currentFrame + 1) % this.frameCount;
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