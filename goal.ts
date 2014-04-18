/// <reverence path="player.ts"/>
/// <reference path="rigidSprite.ts"/>
/// <reference path="interfaces.ts"/>
/// <reference path="tileset.ts"/>
/// <reference path="InpDevWrapper.ts"/>

/*
 * Class: Goal
 * A goal is an interactable object that corresponds to the end of the level.
 *
 */


class Goal extends RigidSprite implements Interactable
{
    public static debugColorGoal:number[] = [0.0, 1.0, 0.0, 1.0];

    game:GameObject;

    constructor (options:ToolOptions, game:GameObject)
    {
        super(options);
        this.game = game;

        // make sure the mask is set so that this does not interact with anything
        this.body.shapes[0].setMask(ObjectMasks.EMPTY);
        this.body.setPosition(options.initialPos);
    }

    static constructFromTiled(obj:any, tileset:Tileset, game:GameObject) {
        // fix the rotation so that 0 is up and we're using degrees

        console.log("Building goal from tiled");
        var material:Physics2DMaterial = game.physicsDevice.createMaterial({
            elasticity : 0,
            staticFriction : 0,
            dynamicFriction : 0
        });
        var shape:Physics2DShape = game.physicsDevice.createPolygonShape({
            vertices : game.physicsDevice.createBoxVertices(obj.width, obj.height),
            material : material,
            group : 2,
            mask : 0
        });
        var body:Physics2DRigidBody = game.physicsDevice.createRigidBody({
            type : 'kinematic',
            shapes : [shape],
            position : [obj.x + obj.width/2, obj.y + obj.height/2]
        });
        var sprite:Draw2DSprite = Draw2DSprite.create({
            width: obj.width,
            height: obj.height,
            color: Goal.debugColorGoal
        });
        game.physicsWorld.addRigidBody(body);
        var options:RigidSpriteOptions = {
            sprite : sprite,
            initialPos : [obj.x + obj.width/2, obj.y + obj.height/2],
            gid: obj.gid,
            body : body
        };

        var newGoal:Goal = new Goal(options, game);
        game.collisionHelp.pushInteractable(newGoal);
        return newGoal;
    }

    /*
     * Method: getShape
     * Returns the shape that the player must be overlapping with in order to build this item. ie the knitting needles.
     */
    getShapes():Physics2DShape[]
    {
        return this.body.shapes;
    }

    playerCollideCallback(player:Player):void
    {
        // check to see if the player is overlapping the right object
        if (this.game.collisionHelp.collisionUtils.intersects(this.body.shapes[0], player.rigidSprite.body.shapes[0]))
        {
            console.log("Made it to the end of the level, HOORAY!");
        }
    }

    draw(draw2D:Draw2D, offset:number[]) {
        if (this.game.debugMode){
            this.sprite.setColor(Goal.debugColorGoal);
        } else {
            this.sprite.setColor([0,0,0,0]);
        }

        super.draw(draw2D, offset);
    }
}
