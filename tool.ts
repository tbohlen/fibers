/// <reverence path="player.ts"/>
/// <reference path="rigidSprite.ts"/>
/// <reference path="interfaces.ts"/>
/// <reference path="toolYarnBall"/>
/// <reference path="tileset.ts"/>
/// <reference path="rectangle.ts"/>
/// <reference path="InpDevWrapper.ts"/>

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
    public static debugColorBuildable:number[] = [0.0, 1.0, 0.0, 1.0];

    game:GameObject;
    buildables:Buildable[];
    toolYarnBall:ToolYarnBall;
    texture:Texture;
    playerOverlapping:boolean = false;
    highlightSprite:Draw2DSprite;

    constructor (options:ToolOptions, game:GameObject)
    {
        super(options);
        this.game = game;
        this.buildables = [];
        if (options.hasOwnProperty("buildable") && options.buildable != null)
        {
            this.buildables.push(options.buildable);
        }

        if (options.hasOwnProperty("toolYarnBall") && options.toolYarnBall != null)
        {
            this.toolYarnBall = options.toolYarnBall;
        }
        else
        {
            this.toolYarnBall = null;
        }

        // make sure the mask is set so that this does not interact with anything
        this.body.shapes[0].setMask(0);

        this.body.setPosition(options.initialPos);

        // make the sprite to show when the player is overlapping with the tool
        // build the player sprite
        var spriteParams:any = {
            x: options.initialPos[0],
            y: options.initialPos[1],
            width: options.width,
            height: options.height,
            color: [1.0, 1.0, 1.0, 1.0]
        };
        this.highlightSprite = Draw2DSprite.create(spriteParams);
        game.graphicsDevice.createTexture({
            src: "assets/glow.png",
            mipmaps: true,
            onload: (texture:Texture) =>
            {
                if (texture != null)
                {
                    this.highlightSprite.setTexture(texture);
                    this.highlightSprite.setTextureRectangle([0, 0, 64, 64]);
                    console.log("set texture for highlight sprite");
                }
            }
        });
    }

    static constructFromTiled(obj:any, tileset:Tileset, game:GameObject) {
        // fix the rotation so that 0 is up and we're using degrees
        var rotation:number = (parseFloat(obj.properties.rotation) * (3.141592 / 180)) + 3.141592;

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
            buildable : null,
            width: obj.width,
            height: obj.height
        };

        if (!(obj.properties.prebuilt == "true"))
        {
            var rectWidth = parseFloat(obj.properties.width) * 64;
            var initHeight:number = (parseFloat(obj.properties.initHeight) ? parseFloat(obj.properties.initHeight) * 64 : 0);
            var maxHeight:number = parseFloat(obj.properties.maxHeight) * 64;
            var minHeight:number = parseFloat(obj.properties.minHeight) * 64;
            var initialPos:number[] = [obj.x + obj.width/2, obj.y + obj.height];

            // limit the size to the shapes we can handle
            //maxHeight = Math.floor(maxHeight / 32) * 32;
            //minHeight = Math.floor(minHeight / 32) * 32;
            //initHeight = Math.floor(initHeight / 32) * 32;
            //rectWidth = Math.ceil(rectWidth / 64) * 64;


            // build the rectangle here if not prebuilt
            var material:Physics2DMaterial = game.physicsDevice.createMaterial({
                elasticity : 0,
                staticFriction : 0.3,
                dynamicFriction : 0.2
            });
            var vertices:number[][] = game.physicsDevice.createRectangleVertices(-rectWidth/2, 0, rectWidth/2, initHeight);
            var shape:Physics2DShape = game.physicsDevice.createPolygonShape({
                vertices: vertices,
                material: material,
                group: ShapeGroups.OVERLAPPABLES,
                mask: ObjectMasks.SOLID
            });
            var body:Physics2DRigidBody = game.physicsDevice.createRigidBody({
                type: "kinematic",
                shapes: [shape],
                mass: 10
            });
            var sprite:Draw2DSprite = Draw2DSprite.create({
                width: rectWidth,
                height: (initHeight ? initHeight : 1), // XXX: hack to make sure we don't get errors from 0 width objects
                origin : [rectWidth/2, 0],
                color: Tool.debugColorBuildable
            });
            // add the body to the world
            game.physicsWorld.addRigidBody(body);

            body.setPosition(initialPos);
            body.setRotation(rotation);


            console.log("IsClimbable: " + obj.properties.isClimbable);

            var rectOptions:RectangleOptions = {
                sprite : sprite,
                initialPos : initialPos,
                body : body,
                initSize : initHeight,
                maxSize : maxHeight,
                minSize : minHeight,
                width : rectWidth,
                height : initHeight,
                rotation: rotation,
                isBuildable : (obj.properties.isBuildable == "true"),
                isClimbable : (obj.properties.isClimbable == "true"),
                isSolid : (obj.properties.isSolid == "true"),
                isPullable : (obj.properties.isPullable == "true")
            };

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
                                                  && this.buildables.length > 0 && !this.isDead)
        {
            this.playerOverlapping = true;
            // handle key presses
            for (var i:number = 0; i < this.buildables.length; i++)
            {
                var buildable:Buildable = this.buildables[i];
                if (this.game.keyboard.keyPressed("W"))
                {
                    if (buildable.ratioYarnUsed() == 1){
                        this.game.sfx.setCurrentFX(this.game.sfx.noKnitSFX);
                    } else {
                        this.game.sfx.setCurrentFX(this.game.sfx.knitUpSFX);
                    }
                    buildable.buildUp();
                }
                else if (this.game.keyboard.keyPressed("S"))
                {
                    if (buildable.ratioYarnUsed() == 0){
                        this.game.sfx.setCurrentFX(this.game.sfx.noKnitSFX);
                    } else {
                        this.game.sfx.setCurrentFX(this.game.sfx.knitDownSFX);
                    }
                    buildable.buildDown();
                }
                else if (!this.game.sfxSource.paused &&
                            ((this.game.sfx.currentSFX == this.game.sfx.knitDownSFX) ||
                            (this.game.sfx.currentSFX == this.game.sfx.knitUpSFX)))
                {
                    // no longer actively building, so pause the knitting sound!
                    this.game.sfxSource.pause();
                }
            }
        }
    }

    setToolYarnBall(toolYarnBall:ToolYarnBall)
    {
        this.toolYarnBall = toolYarnBall;
        this.toolYarnBall.setBuildable(this.buildables[0]); // XXX: Arbitrarily sets the first buildable
    }

    draw(draw2D:Draw2D, offset:number[]) {
        if (this.game.debugMode)
        {
            this.sprite.setColor(Chain.debugColorChain);
        }
        else
        {
            this.sprite.setColor([0,0,0,0]);
        }

        super.draw(draw2D, offset);

        if (this.playerOverlapping)
        {
            if (this.body != null)
            {
                var pos:number[] = this.body.getPosition();
                this.highlightSprite.x = pos[0];
                this.highlightSprite.y = pos[1];
                //this.highlightSprite.rotation = this.body.getRotation();
            }
            else
            {
                this.highlightSprite.x = this.initialPos[0];
                this.highlightSprite.y = this.initialPos[1];
            }

            this.highlightSprite.x -= offset[0];
            this.highlightSprite.y -= offset[1];
            draw2D.drawSprite(this.highlightSprite);

            this.playerOverlapping = false;
        }
    }

}
