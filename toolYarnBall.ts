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
    currentDimension:number;
    maxDimension:number;
    public static debugColor:number[] = [.5,1.,1.,1.];

    constructor (options:ToolYarnBallOptions, game:GameObject)
    {
        super(options);
        this.game = game;
        this.maxDimension = options.maxDimension;
    }

    static constructFromTiled(obj:any, tileset:Tileset, game:GameObject)
    {

        var sprite:Draw2DSprite = Draw2DSprite.create({
            width: obj.width,
            height: obj.height,
            color :ToolYarnBall.debugColor
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
        console.log("setting buildable" + buildable);
        this.buildable = buildable;
    }

    draw(draw2d:Draw2D, offset:number[]) {
        if (this.buildable != null)
        {
            var size:number = (1-this.buildable.ratioYarnUsed())*this.maxDimension;
            this.sprite.setWidth(size+1); // for some reason adding the one makes it work
            this.sprite.setHeight(size+1);
        }
        super.draw(draw2D, offset);
    }
}