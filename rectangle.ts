/// <reference path="rigidSprite.ts"/>
/// <reference path="interfaces.ts"/>
/// <reference path="tileset.ts"/>
/// <reference path="masks.ts"/>

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

    maxSize:number;
    minSize:number;
    width:number;
    height:number;
    currentSize:number;
    rotation:number;
    material:Physics2DMaterial;
    mask:number;
    growSurface:string = "top";

    // Buildable interface
    isBuildable:boolean;

    //dragging
    isBeingPulled:boolean = false;
    isPullable:boolean = false;

    // Climbable interface
    isClimbable:boolean;
    shape:Physics2DShape;

    isSolid:boolean;

    game:GameObject;

    constructor(options:RectangleOptions, game:GameObject)
    {
        super(options);

        // grow surface selection
        this.growSurface = options.growSurface;
        if (this.growSurface != "top"
            && this.growSurface != "bottom"
            && this.growSurface != "left"
            && this.growSurface != "right")
        {
            this.growSurface = "top";
        }

        this.isPullable = options.isPullable;

        this.game = game;

        this.maxSize = options.maxHeight;
        this.minSize = options.minHeight;
        this.currentSize = options.initHeight;

        this.width = options.width;
        this.height = options.initHeight;

        this.rotation = options.rotation;

        this.isBuildable = options.isBuildable;
        this.isClimbable = options.isClimbable;
        this.isSolid = options.isSolid;

        this.mask = options.isSolid ? (options.isClimbable ? ObjectMasks.PLAYEREMPTY : ObjectMasks.SOLID) : ObjectMasks.EMPTY;

        // whenever the height is 0, this should not be interactable
        // if the height is greater than 0 it should
        if (this.currentSize == 0)
        {
            this.game.physicsWorld.removeRigidBody(this.body);
        }


        this.buildShape(this.currentSize);

        this.shape = this.body.shapes[0];
        this.material = this.shape.getMaterial();
        this.body.setPosition(options.initialPos);
        this.body.setRotation(options.rotation);
    }

    static constructFromTiled(obj:any, tileset:Tileset, game:GameObject)
    {
        // In turbulenz, rotation of 0 = down. We want 0 to be up, so we add PI!
        var gid:number = parseInt(obj.gid);
        var rotation:number = obj.properties.hasOwnProperty("rotation") ? ((parseFloat(obj.properties.rotation) * (Math.PI / 180)) + Math.PI) : Math.PI;
        var initHeight:number = obj.properties.hasOwnProperty("initHeight") ? (parseFloat(obj.properties.initHeight) * tileset.tileHeight): obj.height;
        var initialPos:number[] = [obj.x + obj.width/2, obj.y+initHeight];
        var maxHeight:number = obj.properties.hasOwnProperty("maxHeight") ? (parseFloat(obj.properties.maxHeight) * tileset.tileHeight) : obj.height;
        var minHeight:number = obj.properties.hasOwnProperty("minHeight") ? (parseFloat(obj.properties.minHeight) * tileset.tileHeight) : obj.width;
        var mass:number = (obj.properties.mass ? parseFloat(obj.properties.mass) : 10);
        var isSolid:boolean = (obj.properties.isSolid == "true");
        var isBuildable:boolean = (obj.properties.isBuildable == "true");
        var isClimbable:boolean = (obj.properties.isClimbable == "true");
        var isPullable:boolean = (obj.properties.isPullable == "true");
        var growSurface:string = (obj.properties.hasOwnProperty("growSurface")) ? obj.properties.growSurface : "top";
        var mask:number = isSolid ? (isClimbable ? ObjectMasks.PLAYEREMPTY : ObjectMasks.SOLID) : ObjectMasks.EMPTY;

        var material:Physics2DMaterial = game.physicsDevice.createMaterial({
            elasticity : 0,
            staticFriction : 0.3,
            dynamicFriction : 0.2
        });

        var vertices:number[][] = game.physicsDevice.createRectangleVertices(-obj.width/2, 0, obj.width/2, 1);
        var shape:Physics2DShape = game.physicsDevice.createPolygonShape({
            vertices: vertices,
            material: material,
            group: ShapeGroups.OVERLAPPABLES,
            mask: mask
        });
        var body:Physics2DRigidBody = game.physicsDevice.createRigidBody({
            type: (obj.properties.bodyType ? obj.properties.bodyType: "kinematic"),
            shapes: [shape],
            mass: mass,
            linearDrag: 0
        });
        var sprite:Draw2DSprite = Draw2DSprite.create({
            width: obj.width,
            height: initHeight == 0 ? initHeight + 1 : initHeight, // XXX: hack to make sure we don't get errors from 0 width objects
            origin : [obj.width/2, 0],
            color: Rectangle.debugColorClimbable
        });

        // add the body to the world
        game.physicsWorld.addRigidBody(body);

        var rectOptions:RectangleOptions = {
            sprite : sprite,
            initialPos : initialPos,
            gid : gid,
            body : body,
            initHeight: initHeight,
            maxHeight : maxHeight,
            minHeight : minHeight,
            width : obj.width,
            rotation: rotation,
            isBuildable : isBuildable,
            isClimbable : isClimbable,
            isSolid : isSolid,
            isPullable: isPullable,
            bodyType: obj.properties.bodyType,
            growSurface: growSurface
        };

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
        if(this.currentSize < this.maxSize) {
            // if so, find the next height that we should grow to, limiting by the maximum height
            var nextSize = this.currentSize + this.GROW_SPEED;
            if (nextSize > this.maxSize)
            {
                nextSize = this.maxSize;
            }

            // whenever the height is 0, this should not be interactable
            // if the height is greater than 0 it should
            var appeared:boolean = this.currentSize == 0 && nextSize > 0;
            if (appeared)
            {
                this.game.physicsWorld.addRigidBody(this.body);
            }

            this.buildShape(nextSize);
        }
    }

    /*
     * Method: buildDown
     * Shrinks the chain if it can be shrunk any more. This is called from the key handlers.
     */
    buildDown()
    {
        // first check that we are above our minimum size
        if(this.currentSize > this.minSize) {
            // if so, find the next height that we should shrink to, limiting by the minimum height
            var nextSize = this.currentSize - this.GROW_SPEED;
            if (nextSize < this.minSize)
            {
                nextSize = this.minSize;
            }

            // whenever the height is 0, this should not be interactable
            // if the height is greater than 0 it should
            var disappeared:boolean = this.currentSize > 0 && nextSize == 0;
            if (disappeared)
            {
                this.game.physicsWorld.removeRigidBody(this.body);
            }

            this.buildShape(nextSize);
        }
    }

    ratioYarnUsed():number
    {
        return this.currentSize/this.maxSize;
    }

    /*
     * Method: buildShape
     * Builds a new shape that is the size specified and replaces the old body shape with the new one.
     */
    buildShape(height:number)
    {
        this.currentSize = height;
        // build a new shape that is the correct size and replace the old shape with this new one
        if (height == 0) { height++;} // XXX: hack to make sure we don't get errors from 0 width rectangles
        var left:number = 0;
        var right:number = 0;
        var top:number = 0;
        var bottom:number = 0;
        var origin:number[] = [];

        switch (this.growSurface)
        {
            case "top":
                left = -this.width/2;
                right = this.width/2;
                top = this.currentSize;
                bottom = 0;
                origin = [this.width/2, 0];
                break;
            case "left":
                left = -this.width/2;
                right = -this.width/2 + this.currentSize;
                top = this.height;
                bottom = 0;
                origin = [(this.width/2), 0];
                break;
            case "bottom":
                left = -this.width/2;
                right = this.width/2;
                top = this.height;
                bottom = -this.currentSize + this.height;
                origin = [this.width/2, this.currentSize - this.height];
                break;
            case "right":
                left = this.width/2 - this.currentSize;
                right = this.width/2;
                top = this.height;
                bottom = 0;
                origin = [this.currentSize - (this.width/2), 0];
                break;
        }

        var vertices:number[][] = this.game.physicsDevice.createRectangleVertices(left, top, right, bottom);
        var shape:Physics2DShape = this.game.physicsDevice.createPolygonShape({
            vertices: vertices,
            material: this.material,
            group: ShapeGroups.OVERLAPPABLES,
            mask: this.mask
        });
        if (this.body.shapes[0]) {
            this.body.removeShape(this.body.shapes[0]);
        }
        this.body.addShape(shape);
        this.shape = shape;

        // change the sprite to match
        this.sprite.setHeight(top-bottom);
        this.sprite.setWidth(right-left);
        this.sprite.setOrigin(origin);
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
        //handle pulling and releasing...
        if (this.isPullable)
        {
            if (this.game.keyboard.keyPressed("E") && !this.isBeingPulled &&
                ((this.game.keyboard.keyPressed("LEFT") &&  this.body.getPosition()[0] > player.getPosition()[0]) ||
                 (this.game.keyboard.keyPressed("RIGHT") && this.body.getPosition()[0] < player.getPosition()[0]))) {
                player.pull(this);
            } else if (this.isBeingPulled) {
                player.release(this);
            }
        }
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

        if (this.currentSize > 0) {
            super.draw(draw2D, offset);
        }
    }
}