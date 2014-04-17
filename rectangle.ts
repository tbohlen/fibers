/// <reference path="rigidSprite.ts"/>
/// <reference path="interfaces.ts"/>
/// <reference path="tileset.ts"/>

/*
 * Class: Rectangle
 * This class implements an arbitrary rectangle in the game that can be imbued with a variety of properties.
 * By default it is a static object in the world. On construction one can specify it to be a kinematic or
 * dynamic object, buildable, and/or climbable. Further, this object can be associated with a pair of knitting
 * needles to allow for the player to build it up or down.
 *
 * TODO: check for intersection before growing a shape
 */

class Rectangle extends RigidSprite implements Buildable, Climbable, Interactable
{
    public static debugColorBuildable:number[] = [1.0, 1.0, 1.0, 1.0];
    public static debugColorClimbable:number[] = [0.0, 1.0, 0.0, 1.0];
    public static debugColorSolid:number[] = [1.0, 0.0, 0.0, 1.0];
    GROW_SPEED:number = 2;

    maxHeight:number;
    minHeight:number;
    width:number;
    currentHeight:number;
    rotation:number;
    material:Physics2DMaterial;

    // Buildable interface
    isBuildable:boolean;

    // Climbable interface
    isClimbable:boolean;
    shape:Physics2DShape;

    isSolid:boolean;

    game:GameObject;

    constructor(options:RectangleOptions, game:GameObject)
    {
        super(options);
        console.log("Building rectangle");

        this.game = game;
        this.maxHeight = options.maxHeight;
        this.minHeight = options.minHeight;
        this.width = options.width;
        this.currentHeight = options.initHeight;
        this.rotation = options.rotation;

        this.isBuildable = options.isBuildable;
        this.isClimbable = options.isClimbable;
        this.isSolid = options.isSolid;

        if (this.isSolid)
        {
            this.body.shapes[0].setMask(13);
        }
        else
        {
            this.body.shapes[0].setMask(0);
        }

        // whenever the height is 0, this should not be interactable
        // if the height is greater than 0 it should
        if (this.currentHeight == 0)
        {
            this.game.physicsWorld.removeRigidBody(this.body);
        }
        else
        {
            this.buildShape(this.currentHeight);
        }

        this.shape = this.body.shapes[0];
        this.material = this.shape.getMaterial();
        console.log("Setting here");
        this.body.setPosition(options.initialPos);
        this.body.setRotation(options.rotation);
    }

    static constructFromTiled(obj:any, tileset:Tileset, game:GameObject)
    {
        var rotation:number = (parseFloat(obj.properties.rotation) * (3.141592 / 180)) + 3.141592;
        var initHeight:number = (parseFloat(obj.properties.initHeight) ? parseFloat(obj.properties.initHeight) * 64 : obj.height);
        var initialPos:number[] = [obj.x + obj.width/2, obj.y+initHeight];
        var maxHeight:number = parseFloat(obj.properties.maxHeight) * 64;
        var minHeight:number = parseFloat(obj.properties.minHeight) * 64;

        var material:Physics2DMaterial = game.physicsDevice.createMaterial({
            elasticity : 0,
            staticFriction : 0.3,
            dynamicFriction : 0.2
        });
        var vertices:number[][] = game.physicsDevice.createRectangleVertices(-obj.width/2, 0, obj.width/2, 1);
        var shape:Physics2DShape = game.physicsDevice.createPolygonShape({
            vertices: vertices,
            material: material,
            group: 4,
            mask: 0
        });
        var body:Physics2DRigidBody = game.physicsDevice.createRigidBody({
            type: "kinematic",
            shapes: [shape],
            mass: 10
        });
        var sprite:Draw2DSprite = Draw2DSprite.create({
            width: obj.width,
            height: initHeight, // XXX: hack to make sure we don't get errors from 0 width objects
            origin : [obj.width/2, 0],
            color: Rectangle.debugColorClimbable
        });
        // add the body to the world
        game.physicsWorld.addRigidBody(body);

        var rectOptions:RectangleOptions = {
            sprite : sprite,
            initialPos : initialPos,
            gid : parseInt(obj.gid),
            body : body,
            initHeight: initHeight,
            maxHeight : maxHeight,
            minHeight : minHeight,
            width : obj.width,
            rotation: rotation,
            isBuildable : (obj.properties.isBuildable == "true"),
            isClimbable : (obj.properties.isClimbable == "true"),
            isSolid : (obj.properties.isSolid == "true")
        };

        if (obj.properties.bodyType)
        {
            rectOptions.bodyType = obj.properties.bodyType;
        }

        var newRectangle:Rectangle = new Rectangle(rectOptions, game);
        game.collisionHelp.pushInteractable(newRectangle);

        return newRectangle;
    }

    /*
     * Method: buildUp
     * Extends the chain upward if it can be extended any more. This is called from the key handlers.
     */
    buildUp()
    {
        // first check that we are below our maximum size
        if(this.currentHeight < this.maxHeight) {
            // if so, find the next height that we should grow to, limiting by the maximum height
            var nextHeight = this.currentHeight + this.GROW_SPEED;
            if (nextHeight > this.maxHeight)
            {
                nextHeight = this.maxHeight;
            }

            // whenever the height is 0, this should not be interactable
            // if the height is greater than 0 it should
            var appeared:boolean = this.currentHeight == 0 && nextHeight > 0;
            if (appeared)
            {
                this.game.physicsWorld.addRigidBody(this.body);
            }

            this.buildShape(nextHeight);
        }
    }

    /*
     * Method: buildDown
     * Shrinks the chain if it can be shrunk any more. This is called from the key handlers.
     */
    buildDown()
    {
        // first check that we are above our minimum size
        if(this.currentHeight > this.minHeight) {
            // if so, find the next height that we should shrink to, limiting by the minimum height
            var nextHeight = this.currentHeight - this.GROW_SPEED;
            if (nextHeight < this.minHeight)
            {
                nextHeight = this.minHeight;
            }

            // whenever the height is 0, this should not be interactable
            // if the height is greater than 0 it should
            var disappeared:boolean = this.currentHeight > 0 && nextHeight == 0;
            if (disappeared)
            {
                this.game.physicsWorld.removeRigidBody(this.body);
            }

            this.buildShape(nextHeight);
        }
    }

    /*
     * Method: buildShape
     * Builds a new shape that is the size specified and replaces the old body shape with the new one.
     */
    buildShape(height:number)
    {

        this.currentHeight = height;
        // build a new shape that is the correct size and replace the old shape with this new one
        var vertices:number[][] = this.game.physicsDevice.createRectangleVertices(-this.width/2, 0, this.width/2, height);
        var shape:Physics2DShape = this.game.physicsDevice.createPolygonShape({
            vertices: vertices,
            material: this.material,
            group: 4,
            mask: this.isSolid ? 13 : 0
        });
        this.body.removeShape(this.body.shapes[0]);
        this.body.addShape(shape);
        this.shape = shape;
    }

    /*
     * Method: getShapes
     * Returns a list of all the shapes that should be considered when finding intersections with this interactable.
     * This should include all shapes that can be interacted with in any way (buildable, climbable, etc.)
     */
    getShapes():Physics2DShape[]
    {
        return this.body.shapes;
    }

    playerCollideCallback(player:Player):void
    {
        // does nothing
    }

    isClimbableAtObjectPosition(collisionUtil:Physics2DCollisionUtils, shape:Physics2DShape):boolean
    {
        return collisionUtil.intersects(this.getClimbableShape(), shape);
    }

    getClimbableShape():Physics2DShape
    {
        return this.shape;
    }

    draw(draw2D:Draw2D, offset:number[]) {
        /*
        if (this.game.debugMode){
            this.sprite.setColor(Chain.debugColorChain);
        }
        else
        {
            this.sprite.setColor([0,0,0,0]);
        }
        */

        if (this.isClimbable)
        {
            this.sprite.setColor(Rectangle.debugColorClimbable);
        }
        else
        {
            this.sprite.setColor(Rectangle.debugColorSolid);
        }


        if (this.currentHeight > 0) {
            this.sprite.setHeight(this.currentHeight);
            this.sprite.setWidth(this.width);
            super.draw(draw2D, offset);
        }
    }
}