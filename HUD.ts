/**
 * Created by martelly on 4/28/2014.
 */

class HUD
{
    public static yarnWidth = 30; // width of yarn icon
    public static yarnHeight = 30; // height of yarn icon
    public static yarnSpacing = 10; // distance between successive icons
    public static greyedOutColor = [.2, .2, .2, .8];
    public static collectedColor = [1., 1., 1., 1.];
    public static TEXTURE_FILE:string = "assets/goal.png";
    public static ANIMATION_TEXTURE_FILE:string = "assets/goalAnim.png";
    public static animFrames:number = 4;
    public static pauseBetweenFrames:number = 15;
    public static totalFrames:number = 120;
    animTexture:Texture;
    texture:Texture;
    textureRect:number[];

    private spritePositions:number[][]; // (x,y) points of center of icons
    private spriteStates:any[];
    private sprites:Draw2DSprite[];
    private numOfYarnBalls;
    game:GameObject;
    constructor(game:GameObject, yarnNumber:number = 5)
    {
        this.game = game;
        this.game.graphicsDevice.createTexture({
            src: ToolYarnBall.TEXTURE_FILE,
            mipmaps: true,
            onload: (texture) => {
                if (texture) {
                    this.texture = texture;
                } else
                {
                    console.log("Failed to load HUD asset");
                }
            }
        });
        this.game.graphicsDevice.createTexture({
            src: HUD.ANIMATION_TEXTURE_FILE,
            mipmaps: true,
            onload: (texture) => {
                if (texture) {
                    this.animTexture = texture;
                } else
                {
                    console.log("Failed to load animation HUD asset");
                }
            }
        });
        this.textureRect=[0,0,64,64];

        this.numOfYarnBalls = 0;
        this.spritePositions = [];
        var x:number = HUD.yarnSpacing + HUD.yarnWidth/2;
        var y:number = HUD.yarnSpacing + HUD.yarnHeight/2;
        for (var i = 0; i < yarnNumber; i++)
        {
            this.spritePositions.push([x,y]);
            x += HUD.yarnSpacing+ HUD.yarnWidth;
        }

        this.sprites = [];
        this.spriteStates = [];
        for (var i = 0; i < yarnNumber; i++)
        {
            var sprite:Draw2DSprite = Draw2DSprite.create({
                width: HUD.yarnWidth,
                height: HUD.yarnHeight,
                x : this.spritePositions[i][0],
                y : this.spritePositions[i][1],
                origin : [HUD.yarnWidth/2, HUD.yarnHeight/2],
                color : HUD.greyedOutColor
            });
            this.sprites.push(sprite);
        }

        this.numOfYarnBalls = this.game.progression.totalYarnBalls();
        for (var i = 0; i < this.spritePositions.length; i++) {
            var sprite:Draw2DSprite;
            if (i < this.numOfYarnBalls) {
                this.spriteStates.push("full");
            } else
            {
                this.spriteStates.push("empty");
            }
        }
    }

    animateLastYarn():void
    {
        this.numOfYarnBalls = this.game.progression.totalYarnBalls();
        this.refreshStates();
        this.spriteStates[this.numOfYarnBalls-1] = 0; //animate 1
    }

    refreshStates():void
    {
        for (var i = 0; i < this.spriteStates.length; i++)
        {
            if (i < this.numOfYarnBalls)
            {
                this.spriteStates[i] = "full";
            } else
            {
                this.spriteStates[i] = "empty";
            }
        }
    }

    nextFrame():void
    {
        // update states and sprites
        this.sprites = [];
        for (var i = 0; i < this.spriteStates.length; i++)
        {
            var sprite:Draw2DSprite;
            var state = this.spriteStates[i];
            if (state == "empty" || state == "full")
            {
                var texture, color;
                if (state == "empty")
                {
                    color = HUD.greyedOutColor;
                    texture = null;
                } else
                {
                    color = HUD.collectedColor;
                    texture = this.texture;
                }
                sprite = Draw2DSprite.create({
                    width: HUD.yarnWidth,
                    height: HUD.yarnHeight,
                    x : this.spritePositions[i][0],
                    y : this.spritePositions[i][1],
                    origin : [HUD.yarnWidth/2, HUD.yarnHeight/2],
                    color : color,
                    texture : texture,
                    textureRectangle : this.textureRect
                });
            } else
            {
                // state should be a number
                var textRect:number[];
                textRect = [(Math.floor(state/HUD.pauseBetweenFrames)%HUD.animFrames)*128, 0,
                        ((Math.floor(state/HUD.pauseBetweenFrames)%HUD.animFrames)+1)*128, 128];
                sprite = Draw2DSprite.create({
                    width: HUD.yarnWidth,
                    height: HUD.yarnHeight,
                    x : this.spritePositions[i][0],
                    y : this.spritePositions[i][1],
                    origin : [HUD.yarnWidth/2, HUD.yarnHeight/2],
                    color : HUD.collectedColor,
                    texture : this.animTexture,
                    textureRectangle : textRect
                });
                // choose next state
                if (state >= HUD.totalFrames)
                {
                    this.spriteStates[i] = "full";
                } else
                {
                    this.spriteStates[i] += 1;
                }
            }
            this.sprites.push(sprite);
        }
    }

    // offset ignored
    draw(draw2D:Draw2D, offset)
    {
        if (this.numOfYarnBalls != this.game.progression.totalYarnBalls())
        {
            this.animateLastYarn();
            console.log("Time to animate");
        }
        this.nextFrame();
        for (var i = 0; i < this.sprites.length; i++)
        {
            draw2D.drawSprite(this.sprites[i]);
        }
    }
}