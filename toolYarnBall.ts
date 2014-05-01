/**
 * Created by martelly on 4/23/2014.
 */

/**
 * A yarn ball sprite that is meant to indicate how much yarn a tool has been used.
 * The tool class should set the associated buildable for the yarn ball. Then the
 * yarn ball can grow it's size accordingly.
 */
class ToolYarnBall extends RigidSprite
{
    game:GameObject;
    buildable:Buildable;
    maxDimension:number;
    texture:Texture;
    public static debugColor:number[] = [0.,0.,0.,1.0];
    public static TEXTURE_FILE:string = "assets/yarnBall.png";

    constructor (options:ToolYarnBallOptions, game:GameObject)
    {
        super(options);
        this.game = game;
        this.maxDimension = options.maxDimension;
        var that = this;
        this.game.graphicsDevice.createTexture({
            src: ToolYarnBall.TEXTURE_FILE,
            mipmaps: true,
            onload: (texture) => {
                if (texture) {
                    console.log("I loaded the asset!");
                    var textureRect:number[] = [0,0,64,64];
                    this.texture = texture;
                    this.sprite.setTextureRectangle(textureRect);
                    this.sprite.setTexture(texture);
                } else
                {
                    console.log("Failed to load tool yarn ball asset");
                }

            }
        });
    }

    static constructFromTiled(obj:any, tileset:Tileset, game:GameObject)
    {

        var sprite:Draw2DSprite = Draw2DSprite.create({
            width: obj.width,
            height: obj.height
//            color :ToolYarnBall.debugColor
        });

        var options:ToolYarnBallOptions = {
            sprite : sprite,
            initialPos : [obj.x + obj.width/2, obj.y + obj.height/2],
            maxDimension : obj.width
        };

        var newTYB = new ToolYarnBall(options, game);
        return newTYB;
    }

    setBuildable(buildable:Buildable)
    {
        if (buildable == null)
        {
            console.log("Just set buildable for ToolYarnBall to null");
        }
        this.buildable = buildable;
    }

    draw(draw2d:Draw2D, offset:number[]) {
        if (this.buildable != null)
        {
            var size:number = (1-this.buildable.ratioYarnUsed())*this.maxDimension;
            this.sprite.setWidth(size+1); // for some reason adding the one makes it work
            this.sprite.setHeight(size+1);
        }
        super.draw(draw2d, offset);
    }
}