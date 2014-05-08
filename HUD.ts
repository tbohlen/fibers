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
    public static TEXTURE_FILE:string = "assets/yarnBall.png";
    texture:Texture;
    textureRect:number[];

    private spritePositions:number[][]; // (x,y) points of center of icons
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
                this.refreshSprites();
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
    }

    refreshSprites():void
    {
        this.numOfYarnBalls = this.game.progression.totalYarnBalls();
        this.sprites = [];
        for (var i = 0; i < this.spritePositions.length; i++)
        {
            var sprite:Draw2DSprite;
            if (i < this.numOfYarnBalls)
            {
                sprite = Draw2DSprite.create({
                    width: HUD.yarnWidth,
                    height: HUD.yarnHeight,
                    x : this.spritePositions[i][0],
                    y : this.spritePositions[i][1],
                    origin : [HUD.yarnWidth/2, HUD.yarnHeight/2],
                    color : HUD.collectedColor,
                    texture : this.texture,
                    textureRectangle : this.textureRect
                });
            } else
            {
                sprite = Draw2DSprite.create({
                    width: HUD.yarnWidth,
                    height: HUD.yarnHeight,
                    x : this.spritePositions[i][0],
                    y : this.spritePositions[i][1],
                    origin : [HUD.yarnWidth/2, HUD.yarnHeight/2],
                    color : HUD.greyedOutColor,
                    texture : null
                });
            }

            this.sprites.push(sprite);
        }
    }

    // offset ignored
    draw(draw2D:Draw2D, offset)
    {
        if (this.numOfYarnBalls != this.game.progression.totalYarnBalls())
        {
            this.refreshSprites()
        }
        for (var i = 0; i < this.sprites.length; i++)
        {
            draw2D.drawSprite(this.sprites[i]);
        }
    }
}