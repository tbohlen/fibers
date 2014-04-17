/// <reference path="jslib-modular/tzdraw2d.d.ts" />
/// <reference path="jslib-modular/physics2d.d.ts" />

/// <reference path="rigidSprite.ts"/>
/// <reference path="interfaces.ts"/>
/// <reference path="tileset.ts"/>
/// <reference path="player.ts"/>

class KnitCube extends RigidSprite implements Buildable
{
    public static debugColorConstruct:number[] = [.1, .5, .1, 1.0];
    public static debugColorCube:number[] = [1.0, 1.0, 1.0, 1.0];

    game:GameObject = null;
    GROW_SPEED = 2;
    maxDimension:number;
    minDimension:number;
    currentDimension:number;
    construct:RigidSprite;
    isBuildable:boolean = true;

    constructor (options:knitCubeOptions, game:GameObject)
    {
        super(options);
        this.game = game;

        this.maxDimension = options.maxDimension;
        this.minDimension = options.minDimension;
        this.currentDimension = 0;

        // for the cube that will be knitted
        var vertices:number[][] = [[0,0], [10,0], [10, 10], [0, 10]];
        var shape:Physics2DShape = game.physicsDevice.createPolygonShape({
            vertices: vertices,
            group: ShapeGroups.TOOLS,
            mask: ObjectMasks.SOLID
        });
        var body:Physics2DRigidBody = game.physicsDevice.createRigidBody({
            type: "kinematic",
            shapes: [shape],
            mass: 10
        });
        var sprite:Draw2DSprite = Draw2DSprite.create({
            width: this.maxDimension,
            height: 1,
            origin : [this.maxDimension / 2, this.maxDimension / 2],
            color: KnitCube.debugColorConstruct
        });

        this.construct = new RigidSprite({
            sprite:sprite,
            initialPos:options.initialPos,
            body:body
        });
    }

    static constructFromTiled(obj:any, tileset:Tileset, game:GameObject):KnitCube {
        var vertices:number[][] = [[0,0], [obj.width,0], [obj.width, obj.height], [0, obj.height]];

        var shapes : Physics2DShape[] = [
            game.physicsDevice.createPolygonShape({
                vertices : vertices,
                group: ShapeGroups.TOOLS,
                mask: ObjectMasks.SOLID
            })
        ];
        var body = game.physicsDevice.createRigidBody({
            type : 'static',
            shapes : shapes,
            position : [obj.x, obj.y]
        });
        var sprite:Draw2DSprite = Draw2DSprite.create({
            width: obj.width,
            height: obj.height,
            x : obj.x,
            y : obj.y,
            origin : [0, 0],
            color: KnitCube.debugColorCube
        });

        game.physicsWorld.addRigidBody(body);


        var params:knitCubeOptions = {
            sprite : sprite,
            initialPos : [sprite.x, sprite.y],
            body : body,
            maxDimension : obj.properties.maxDimension,
            minDimension : obj.properties.minDimension
        };
        var kc:KnitCube = new KnitCube(params, game);
        game.collisionHelp.pushInteractable(kc);
        return kc;
    }

    public buildUp():void
    {
        if (this.currentDimension + this.GROW_SPEED < this.maxDimension) {
            this.currentDimension += this.GROW_SPEED;
            this.remakeConstruct();
        }
    }

    public buildDown():void
    {
        if (this.currentDimension - this.GROW_SPEED > this.minDimension) {
            this.currentDimension -= this.GROW_SPEED;
            this.remakeConstruct();
        }
    }

    getBuildableShape():Physics2DShape
    {
        return this.body.shapes[0];
    }

    private remakeConstruct():void
    {
        if (this.currentDimension > 0)
        {
            this.construct.sprite.setHeight(this.currentDimension);
            this.construct.sprite.setWidth(this.currentDimension);
        }
    }

    playerCollideCallback(player:Player):void {
        console.log("knit cube intersecting with player");
    }

    getShapes():Physics2DShape[] {
        return [this.body.shapes[0]];
    }

    draw(draw2D:Draw2D, offset:number[]) {
        // should only do this once when toggling. Not on every draw :(
        if (this.game.debugMode){
            this.sprite.setColor(KnitCube.debugColorCube);
            this.construct.sprite.setColor(KnitCube.debugColorConstruct);
        } else {
            this.sprite.setColor([0,0,0,0]);
            this.construct.sprite.setColor([0,0,0,0]);
        }

        this.construct.draw(draw2D, offset);
        super.draw(draw2D, offset);
    }
}