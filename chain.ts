/// <reference path="jslib-modular/tzdraw2d.d.ts" />
/// <reference path="jslib-modular/physics2d.d.ts" />

/// <reverence path="player.ts"/>
/// <reference path="rigidSprite.ts"/>
/// <reference path="interfaces.ts"/>

/*
 * Class: Chain
 * The chain class implements a column of knitted material that can be knit up or down.
 */

class Chain extends RigidSprite implements Buildable
{
    GROW_SPEED = 2;
    maxHeight:number;
    minHeight:number;
    currentHeight:number;
    width:number;
    construct:RigidSprite;
    rotation:number;
    game:GameObject;
    material:Physics2DMaterial;

    constructor (options:ChainOptions, game:GameObject)
    {

        super(options);
        this.game = game;
        this.maxHeight = options.maxHeight;
        this.minHeight = options.minHeight;
        this.width = options.width;
        this.currentHeight = 0;

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
            height: 1,
            origin : [this.width / 2, this.currentHeight / 2],
            color: [1.0, 1.0, 1.0, 1.0]
        });
        // add the body to the world
        game.physicsWorld.addRigidBody(body);

        this.construct = new RigidSprite({
            sprite:sprite,
            initialPos:options.initialPos,
            body:body
        });

        // set rotations
        console.log("rotation is " + options.rotation);
        this.body.setRotation(options.rotation);
        this.construct.body.setRotation(options.rotation);
        this.rotation = options.rotation;
    }

    static constructFromTiled(obj:any, game:GameObject) {
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
            position : [obj.x - obj.width/2, obj.y - obj.height/2]
        });
        var sprite:Draw2DSprite = Draw2DSprite.create({
            width: obj.width,
            height: obj.height,
            origin : [obj.x, obj.y],
            color: [1.0, 0.0, 0.0, 1.0]
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
            initialPos : [sprite.x, sprite.y],
            body : body,
            maxHeight:obj.properties.maxheight,
            initHeight:obj.properties.initHeight,
            minHeight:obj.properties.minHeight,
            width:obj.properties.width,
            rotation:obj.properties.rotation
        };
        var newChain:Chain = new Chain(options, game);
        game.interactables.buildables.push(newChain);
        return newChain;
    }

    buildUp()
    {
        if(this.currentHeight < this.maxHeight) {
            console.log("Building up");
            var nextHeight = this.currentHeight + this.GROW_SPEED;
            if (nextHeight > this.maxHeight)
            {
                nextHeight = this.maxHeight;
            }
            this.currentHeight = nextHeight;
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

    buildDown()
    {
        if(this.currentHeight > this.minHeight) {
            console.log("Building down");
            var nextHeight = this.currentHeight - this.GROW_SPEED;
            if (nextHeight < this.minHeight)
            {
                nextHeight = this.minHeight;
            }
            this.currentHeight = nextHeight;
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
     * Method: getBuildableShape
     * Returns the shape that the player must be overlapping with in order to build this item. ie the knitting needles.
     */
    getBuildableShape = () =>
    {
        console.log("Getting shape from " + this.body.shapes);
        return this.body.shapes[0];
    }

    draw(draw2D:Draw2D, offset:number[]) {
        var position:number[] = this.body.getPosition();
        if (this.currentHeight > 0) {
            console.log("Height set to " + this.currentHeight);
            this.construct.body.setPosition(position);
            this.construct.sprite.rotation = this.rotation;
            this.construct.sprite.x = position[0] - offset[0];
            this.construct.sprite.y = position[1] - offset[1] - this.currentHeight;
            this.construct.sprite.setHeight(this.currentHeight);
            this.construct.sprite.setWidth(this.width);
            // / and draw it to the screen
            draw2D.drawSprite(this.construct.sprite);
        }
        super.draw(draw2D, offset);
    }
}