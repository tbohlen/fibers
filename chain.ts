/// <reference path="jslib-modular/tzdraw2d.d.ts" />
/// <reference path="jslib-modular/physics2d.d.ts" />

/// <reverence path="player.ts"/>
/// <reference path="rigidSprite.ts"/>
/// <reference path="interfaces.ts"/>
/// <reference path="tileset.ts"/>

/*
 * Class: Chain
 * The chain class implements a column of knitted material that can be knit up or down.
 */

class Chain extends RigidSprite implements Buildable, Climbable
{
    public static debugColorChain:number[] = [1.0, 0.0, 0.0, 1.0];
    public static debugColorConstruct:number[] = [1.0, 1.0, 1.0, 1.0];

    GROW_SPEED = 2;
    maxHeight:number;
    minHeight:number;
    currentHeight:number;
    width:number;
    construct:RigidSprite;
    rotation:number;
    game:GameObject;
    material:Physics2DMaterial;
    isBuildable:boolean = true;
    isClimbable:boolean = true;
    needleHeight:number;

    constructor (options:ChainOptions, game:GameObject)
    {
        super(options);
        this.game = game;
        this.maxHeight = options.maxHeight;
        this.minHeight = options.minHeight;
        this.width = options.width;
        this.currentHeight = options.initHeight;
        this.needleHeight = options.needleHeight;

        // correct the initial position of the chain to match the bottom of the needles instead of the middle
        var chainPos:number[] = [options.initialPos[0], options.initialPos[1] + this.needleHeight/2];

        // the rigidSprite displayed is the knitting needles
        // in addition to the knitting needles, we need the thing you are climbing
        // this is constructed as another rigidSprite with a fixed width
        this.material = game.physicsDevice.createMaterial({
            elasticity : 0,
            staticFriction : 0,
            dynamicFriction : 0
        });
        var vertices:number[][] = this.game.physicsDevice.createRectangleVertices(-this.width/2, 0, this.width/2, this.currentHeight);
        var shape:Physics2DShape = game.physicsDevice.createPolygonShape({
            vertices: vertices,
            material: this.material,
            group: 4,
            mask: 0
        });
        var body:Physics2DRigidBody = game.physicsDevice.createRigidBody({
            type: "kinematic",
            shapes: [shape],
            mass: 10
        });
        var sprite:Draw2DSprite = Draw2DSprite.create({
            width: this.width,
            height: (options.initHeight ? options.initHeight : 1), // XXX: hack to make sure we don't get errors from 0 width objects
            origin : [this.width/2, 0],
            color: Chain.debugColorConstruct
        });
        // add the body to the world
        game.physicsWorld.addRigidBody(body);

        this.construct = new RigidSprite({
            sprite:sprite,
            initialPos:chainPos,
            body:body
        });

        // set rotations
        this.body.setPosition(options.initialPos);
        this.construct.body.setRotation(options.rotation);
        this.rotation = options.rotation;
    }

    static constructFromTiled(obj:any, tileset:Tileset, game:GameObject) {
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
            color: Chain.debugColorChain
        });
        game.physicsWorld.addRigidBody(body);
        var rigidSprite = new RigidSprite({
            sprite:sprite,
            initialPos:[sprite.x, sprite.y],
            gid: obj.gid,
            body:body
        });
        var options:ChainOptions = {
            sprite : sprite,
            initialPos : [obj.x + obj.width/2, obj.y + obj.height/2],
            body : body,
            maxHeight:parseInt(obj.properties.maxHeight),
            initHeight:parseInt(obj.properties.initHeight),
            minHeight:parseInt(obj.properties.minHeight),
            width:obj.properties.width,
            rotation:obj.properties.rotation,
            needleHeight:obj.height
        };
        var newChain:Chain = new Chain(options, game);
        game.collisionHelp.pushInteractable(newChain);
        return newChain;
    }

    getBuildableShape()
    {
        return this.body.shapes[0];
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
            this.currentHeight = nextHeight;

            // build a new shape that is the correct size and replace the old shape with this new one
            var vertices:number[][] = this.game.physicsDevice.createRectangleVertices(-this.width/2, 0, this.width/2, this.currentHeight);
            var shape:Physics2DShape = this.game.physicsDevice.createPolygonShape({
                vertices: vertices,
                material: this.material,
                group: 4,
                mask: 0
            });
            this.construct.body.removeShape(this.construct.body.shapes[0]);
            this.construct.body.addShape(shape);
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
            this.currentHeight = nextHeight;

            // build a new shape that is the correct size and replace the old shape with this new one
            var vertices:number[][] = this.game.physicsDevice.createRectangleVertices(-this.width/2, 0, this.width/2, this.currentHeight);
            var shape:Physics2DShape = this.game.physicsDevice.createPolygonShape({
                vertices: vertices,
                material: this.material,
                group: 4,
                mask: 0
            });
            this.construct.body.removeShape(this.construct.body.shapes[0]);
            this.construct.body.addShape(shape);
        }
    }

    isClimbableAtObjectPosition(collisionUtil:Physics2DCollisionUtils, position: any[]):boolean
    {
        return collisionUtil.containsPoint(this.getClimbableShape(), position);
    }

    getClimbableShape():Physics2DShape
    {
        return this.construct.body.shapes[0];
    }

    /*
     * Method: getShape
     * Returns the shape that the player must be overlapping with in order to build this item. ie the knitting needles.
     */
    getShapes():Physics2DShape[]
    {
        return [this.body.shapes[0], this.construct.body.shapes[0]];
    }

    playerCollideCallback(player:Player):void
    {
        // check to see if the player is overlapping the right object
        if (this.game.collisionUtil.containsPoint(this.getBuildableShape(), player.getPosition())) {
            // handle key presses
            if (this.game.keys.E && this.game.keys.UP) {
                this.buildUp();
            }
            else if (this.game.keys.E && this.game.keys.DOWN) {
                this.buildDown();
            }
        }
    }

    draw(draw2D:Draw2D, offset:number[]) {
        if (this.game.debugMode){
            this.sprite.setColor(Chain.debugColorChain);
            this.construct.sprite.setColor(Chain.debugColorConstruct);
        } else {
            this.sprite.setColor([0,0,0,0]);
            this.construct.sprite.setColor([0,0,0,0]);
        }

        super.draw(draw2D, offset);
        var position:number[] = this.body.getPosition();
        // offset the position y so that it starts at the bottom of the knitting needles, not the middle
        position[1] += this.needleHeight/2;
        if (this.currentHeight > 0) {
            this.construct.sprite.setHeight(this.currentHeight);
            this.construct.sprite.setWidth(this.width);

            this.construct.body.setPosition(position);
            this.construct.sprite.x = position[0] - offset[0];
            this.construct.sprite.y = position[1] - offset[1];
            this.construct.sprite.rotation = this.rotation;
            // / and draw it to the screen
            draw2D.drawSprite(this.construct.sprite);
        }
    }
}