/// <reverence path="player.ts"/>
/// <reference path="rigidSprite.ts"/>
/// <reference path="interfaces.ts"/>
/// <reference path="tileset.ts"/>
/// <reference path="rectangle.ts"/>
/// <reference path="KeyboardInput.ts"/>

/*
 * Class: Tool
 * A tool is an interactable object that allows for the building of another object in the scene.
 *
 * There are two primary ways of creating a tool. The first is to specify a slew of variables and let
 * the tool create the object it will build automatically. This object will appear right on top of
 * the tool. The other option is to set its buildable property manually, thereby tying it to another
 * object in the scene after creation.
 */


class Tool extends RigidSprite implements Interactable
{
    public static debugColorTool:number[] = [1.0, 0.0, 0.0, 1.0];
    public static debugColorBuildable:number[] = [1.0, 1.0, 1.0, 1.0];

    game:GameObject;
    buildable:Buildable;

    constructor (options:ToolOptions, game:GameObject)
    {
        super(options);
        this.game = game;
        if (options.hasOwnProperty("buildable") && options.buildable != null)
        {
            this.buildable = options.buildable;
        }
        else
        {
            this.buildable = null;
        }

        // make sure the mask is set so that this does not interact with anything
        this.body.shapes[0].setMask(0);

        this.body.setPosition(options.initialPos);
    }

    static constructFromTiled(obj:any, tileset:Tileset, game:GameObject) {
        console.log("Building tool from tiled");
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
            color: Tool.debugColorTool
        });
        game.physicsWorld.addRigidBody(body);
        var options:ToolOptions = {
            sprite : sprite,
            initialPos : [obj.x + obj.width/2, obj.y + obj.height/2],
            gid: obj.gid,
            body : body,
            buildable : null
        };

        if (!(obj.properties.prebuilt == "true"))
        {
            var rectWidth = parseInt(obj.properties.width);
            var initHeight:number = (parseInt(obj.properties.initHeight) ? parseInt(obj.properties.initHeight) : 0);
            // build the rectangle here if not prebuilt
            var material:Physics2DMaterial = game.physicsDevice.createMaterial({
                elasticity : 0,
                staticFriction : 0.3,
                dynamicFriction : 0.2
            });
            var vertices:number[][] = game.physicsDevice.createRectangleVertices(-rectWidth/2, 0, rectWidth/2, parseInt(obj.properties.initHeight));
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
                width: parseInt(obj.properties.width),
                height: (parseInt(obj.properties.initHeight) ? parseInt(obj.properties.initHeight) : 1), // XXX: hack to make sure we don't get errors from 0 width objects
                origin : [rectWidth/2, 0],
                color: Tool.debugColorBuildable
            });
            // add the body to the world
            game.physicsWorld.addRigidBody(body);

            var initialPos:number[] = [obj.x + obj.width/2, obj.y + obj.height];
            body.setPosition(initialPos);
            body.setRotation(parseFloat(obj.properties.rotation));

            var rectOptions:RectangleOptions = {
                sprite : sprite,
                initialPos : initialPos,
                body : body,
                initHeight : initHeight,
                maxHeight : parseInt(obj.properties.maxHeight),
                minHeight : parseInt(obj.properties.minHeight),
                width : parseInt(obj.properties.width),
                rotation: parseFloat(obj.properties.rotation),
                isBuildable : (obj.properties.isBuildable == "true"),
                isClimbable : (obj.properties.isClimbable == "true"),
                isSolid : (obj.properties.isSolid == "true")
            };

            if (obj.properties.initHeight)
            {
                rectOptions.initHeight = parseInt(obj.properties.initHeight);
            }

            if (obj.gid)
            {
                rectOptions.gid = obj.gid;
            }

            if (obj.properties.bodyType)
            {
                rectOptions.bodyType = obj.properties.bodyType;
            }

            var newRectangle:Rectangle = new Rectangle(rectOptions, game);
            tileset.rigidSprites.push(newRectangle);
            game.collisionHelp.pushInteractable(newRectangle);
            options.buildable = newRectangle;
        }
        var newTool:Tool = new Tool(options, game);
        game.collisionHelp.pushInteractable(newTool);
        return newTool;
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
        if (this.game.collisionHelp.collisionUtils.intersects(this.body.shapes[0], player.rigidSprite.body.shapes[0])
                                                  && this.buildable != null && this.buildable.isBuildable)
        {
            // handle key presses
            if (this.game.keyboard.keyPressed("E") && this.game.keyboard.keyPressed("UP"))
            {
                this.buildable.buildUp();
            }
            else if (this.game.keyboard.keyPressed("E") && this.game.keyboard.keyPressed("DOWN"))
            {
                this.buildable.buildDown();
            }
        }
    }

    draw(draw2D:Draw2D, offset:number[]) {
        if (this.game.debugMode){
            this.sprite.setColor(Chain.debugColorChain);
        } else {
            this.sprite.setColor([0,0,0,0]);
        }

        super.draw(draw2D, offset);
    }

}
