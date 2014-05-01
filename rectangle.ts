/// <reference path="rigidSprite.ts"/>
/// <reference path="interfaces.ts"/>
/// <reference path="tileset.ts"/>
/// <reference path="masks.ts"/>
/// <reference path="animatedTexture.ts"/>

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

    public static BUILD_DELAY_CLIMBABLE:number = 300;
    public static NUMBER_OF_FRAMES_CLIMBABLE:number = 4;
    public static HEIGHT_INTERVAL_CLIMBABLE:number = 32;
    public static WIDTH_INTERVAL_CLIMBABLE:number = 32;
    public static HEIGHT_BUFFER_CLIMBABLE:number = 15;
    public static WIDTH_BUFFER_CLIMBABLE:number = 14;
    public static TEXTURE_FILE_CLIMBABLE:string = "assets/chain.png";
    public static FINAL_TEXTURE_RECTANGLE_CLIMBABLE:number[] = [96, 0, 128, 32];

    public static BUILD_DELAY_NONCLIMBABLE:number = 300;
    public static NUMBER_OF_FRAMES_NONCLIMBABLE:number = 5;
    public static HEIGHT_INTERVAL_NONCLIMBABLE:number = 64;
    public static WIDTH_INTERVAL_NONCLIMBABLE:number = 64;
    public static HEIGHT_BUFFER_NONCLIMBABLE:number = 25;
    public static WIDTH_BUFFER_NONCLIMBABLE:number = 17;
    public static TEXTURE_FILE_NONCLIMBABLE:string = "assets/climbable.png";
    public static FINAL_TEXTURE_RECTANGLE_NONCLIMBABLE:number[] = [256, 0, 320, 64];

    public static BUILD_DELAY_CUBE:number = 300;
    public static NUMBER_OF_FRAMES_CUBE:number = 1;
    public static HEIGHT_INTERVAL_CUBE:number = 64;
    public static WIDTH_INTERVAL_CUBE:number = 64;
    public static HEIGHT_BUFFER_CUBE:number = 0;
    public static WIDTH_BUFFER_CUBE:number = 0;
    public static TEXTURE_FILE_CUBE:string = "assets/cube.png";
    public static FINAL_TEXTURE_RECTANGLE_CUBE:number[] = [0, 0, 64, 64];

    maxSize:number; // in HEIGHT_INTERVAL - VERT_BUFFER units
    minSize:number; // in HEIGHT_INTERVAL - VERT_BUFFER units
    width:number; // in WIDTH_INTERVAL units
    height:number; // in HEIGHT_INTERVAL - VERT_BUFFER units
    currentSize:number; // in HEIGHT_INTERVAL - VERT_BUFFER units
    rotation:number;
    material:Physics2DMaterial;
    mask:number;
    growSurface:string = "top";
    lastBuildTime:number = 0;
    isInWorld:boolean = false; // tracks if the body is currently interactable

    // sprite related variables
    texture:Texture = null;
    animatedTexture:AnimatedTexture = null;
    textureLoaded:boolean = false;
    animatedTextureLoaded:boolean = false;
    animationTimeout;
    animating:boolean = false;
    afterAnimatingSize:number = 0;

    // variables for animation that depend on climbable/nonclimbable
    buildDelay:number;
    numberOfFrames:number;
    heightInterval:number;
    widthInterval:number;
    heightBuffer:number;
    widthBuffer:number;
    textureFile:string;
    finalTextureRectangle:number[];

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

    sprites:Draw2DSprite[] = [];

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

        if(options.isClimbable)
        {
            this.buildDelay = Rectangle.BUILD_DELAY_CLIMBABLE;
            this.numberOfFrames = Rectangle.NUMBER_OF_FRAMES_CLIMBABLE
            this.heightInterval = Rectangle.HEIGHT_INTERVAL_CLIMBABLE;
            this.widthInterval = Rectangle.WIDTH_INTERVAL_CLIMBABLE;
            this.heightBuffer = Rectangle.HEIGHT_BUFFER_CLIMBABLE;
            this.widthBuffer = Rectangle.WIDTH_BUFFER_CLIMBABLE;
            this.textureFile = Rectangle.TEXTURE_FILE_CLIMBABLE;
            this.finalTextureRectangle = Rectangle.FINAL_TEXTURE_RECTANGLE_CLIMBABLE;
        }
        else if (!options.isBuildable)
        {
            this.buildDelay = Rectangle.BUILD_DELAY_CUBE;
            this.numberOfFrames = Rectangle.NUMBER_OF_FRAMES_CUBE
            this.heightInterval = Rectangle.HEIGHT_INTERVAL_CUBE;
            this.widthInterval = Rectangle.WIDTH_INTERVAL_CUBE;
            this.heightBuffer = Rectangle.HEIGHT_BUFFER_CUBE;
            this.widthBuffer = Rectangle.WIDTH_BUFFER_CUBE;
            this.textureFile = Rectangle.TEXTURE_FILE_CUBE;
            this.finalTextureRectangle = Rectangle.FINAL_TEXTURE_RECTANGLE_CUBE;
        }
        else
        {
            this.buildDelay = Rectangle.BUILD_DELAY_NONCLIMBABLE;
            this.numberOfFrames = Rectangle.NUMBER_OF_FRAMES_NONCLIMBABLE
            this.heightInterval = Rectangle.HEIGHT_INTERVAL_NONCLIMBABLE;
            this.widthInterval = Rectangle.WIDTH_INTERVAL_NONCLIMBABLE;
            this.heightBuffer = Rectangle.HEIGHT_BUFFER_NONCLIMBABLE;
            this.widthBuffer = Rectangle.WIDTH_BUFFER_NONCLIMBABLE;
            this.textureFile = Rectangle.TEXTURE_FILE_NONCLIMBABLE;
            this.finalTextureRectangle = Rectangle.FINAL_TEXTURE_RECTANGLE_NONCLIMBABLE;
        }


        // limit the size to the shapes we can handle and convert from pixel units to sprite-size units
        options.maxSize = Math.ceil(options.maxSize / (this.heightInterval-this.heightBuffer));
        options.minSize = Math.floor(options.minSize / (this.heightInterval-this.heightBuffer));
        options.initSize = Math.floor(options.initSize / (this.heightInterval-this.heightBuffer));
        if (this.growSurface == "top" || this.growSurface == "bottom")
        {
            // in this case height interval really does map to height
            options.width = Math.ceil(options.width / (this.widthInterval - this.widthBuffer));
            options.height = Math.ceil(options.height / (this.heightInterval - this.heightBuffer));
        }
        else if (this.growSurface == "left" || this.growSurface == "right")
        {
            // in this case the height interval actually maps to width because of sprite rotations later on
            options.width = Math.ceil(options.width / (this.heightInterval - this.heightBuffer));
            options.height = Math.ceil(options.height / (this.widthInterval - this.widthBuffer));
        }

        this.isPullable = options.isPullable;

        this.game = game;

        this.maxSize = options.maxSize;
        this.minSize = options.minSize;
        this.currentSize = options.initSize;

        this.width = options.width;
        this.height = options.height;

        this.rotation = options.rotation;

        this.isBuildable = options.isBuildable;
        this.isClimbable = options.isClimbable;
        this.isSolid = options.isSolid;

        this.mask = options.isSolid ? (options.isClimbable ? ObjectMasks.PLAYEREMPTY : ObjectMasks.SOLID) : ObjectMasks.EMPTY;

        // whenever the height is 0, this should not be interactable
        // if the height is greater than 0 it should
        if (this.currentSize == 0)
        {
            this.isInWorld = false;
            this.game.physicsWorld.removeRigidBody(this.body);
        }
        else
        {
            this.isInWorld = true;
        }

        this.buildShape(this.currentSize);

        this.shape = this.body.shapes[0];
        this.material = this.shape.getMaterial();
        this.body.setPosition(options.initialPos);
        this.body.setRotation(options.rotation);

        // load textures based on climbable or not climbable
        var that:any = this;
        this.animatedTexture = new AnimatedTexture(this.textureFile, [this.widthInterval, this.heightInterval], this.numberOfFrames, false, true);
        this.animatedTexture.loadTexture(this.game.graphicsDevice, (texture) => {
            if (texture)
            {
                that.topLoaded = true;
                that.texture = texture;
            }
        });

        // prepare the animation timeout
        this.animationTimeout = window.setInterval(
            ()=> {
                if (this.animatedTexture) {
                    this.animatedTexture.updateCurrentFrame();
                }
            }, this.buildDelay/this.numberOfFrames);

        // prepare a loop callback for the end of the top animation
        this.animatedTexture.setLoopCallback(()=> {
            // if we're waiting for the animation to end, when it does end set the size again
            if (this.animating && this.animatedTexture.isReversed)
            {
                this.currentSize = this.afterAnimatingSize;
                this.buildShape(this.currentSize);
            }
            this.animating = false;
        });

    }

    static constructFromTiled(obj:any, tileset:Tileset, game:GameObject)
    {
        // In turbulenz, rotation of 0 = down. We want 0 to be up, so we add PI!
        var gid:number = parseInt(obj.gid);
        var rotation:number = obj.properties.hasOwnProperty("rotation") ? ((parseFloat(obj.properties.rotation) * (Math.PI / 180)) + Math.PI) : Math.PI;
        var initSize:number = obj.properties.hasOwnProperty("initHeight") ? (parseFloat(obj.properties.initHeight) * tileset.tileHeight): obj.height;
        var maxSize:number = obj.properties.hasOwnProperty("maxHeight") ? (parseFloat(obj.properties.maxHeight) * tileset.tileHeight) : obj.height;
        var minSize:number = obj.properties.hasOwnProperty("minHeight") ? (parseFloat(obj.properties.minHeight) * tileset.tileHeight) : obj.width;

        // limit the size to the shapes we can handle and convert from pixel units to sprite-size units
        //var effectiveWidth =
        //var effectiveHeight =
            //options.width = Math.ceil(options.width / (this.widthInterval - this.widthBuffer));
            //options.height = Math.ceil(options.height / (this.heightInterval - this.heightBuffer));


        var initialPos:number[] = [obj.x + obj.width/2, obj.y+initSize];
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
            height: initSize == 0 ? initSize + 1 : initSize, // XXX: hack to make sure we don't get errors from 0 width objects
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
            initSize: initSize,
            height: obj.height,
            maxSize : maxSize,
            minSize : minSize,
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
        // first check that we are below our maximum size and that there has been a delay since the last build
        var time:number = new Date().getTime();
        if(this.currentSize < this.maxSize && time > this.lastBuildTime + this.buildDelay && !this.isDead) {
            // set up the animation
            this.animatedTexture.setReverse(false);
            this.animating = true;
            // if so, find the next height that we should grow to, limiting by the maximum height
            var nextSize = this.currentSize + 1;
            if (nextSize > this.maxSize)
            {
                nextSize = this.maxSize;
            }

            // whenever the height is 0, this should not be interactable
            // if the height is greater than 0 it should
            var appeared:boolean = this.currentSize == 0 && nextSize > 0;
            if (appeared)
            {
                this.isInWorld = true;
                this.game.physicsWorld.addRigidBody(this.body);
            }

            this.buildShape(nextSize);

            // store the build time
            this.lastBuildTime = time;
        }
    }

    /*
     * Method: buildDown
     * Shrinks the chain if it can be shrunk any more. This is called from the key handlers.
     */
    buildDown()
    {
        // first check that we are above our minimum size and there has been a delay since the last build
        var time:number = new Date().getTime();
        if(this.currentSize > this.minSize && time > this.lastBuildTime + this.buildDelay && !this.isDead) {
            // set up the animation
            this.animatedTexture.setReverse(true);
            this.animating = true;
            // if so, find the next height that we should shrink to, limiting by the minimum height
            var nextSize = this.currentSize - 1;
            if (nextSize < this.minSize)
            {
                nextSize = this.minSize;
            }

            this.afterAnimatingSize = nextSize;
            //this.currentSize = nextSize;

            // whenever the height is 0, this should not be interactable
            // if the height is greater than 0 it should
            var disappeared:boolean = this.currentSize > 0 && nextSize == 0;
            if (disappeared)
            {
                this.isInWorld = false;
                this.game.physicsWorld.removeRigidBody(this.body);
            }

            // store the build time
            this.lastBuildTime = time;
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
    buildShape(size:number)
    {
        // build a new shape that is the correct size and replace the old shape with this new one
        this.currentSize = size;
        var pixelSize:number = size * (this.heightInterval - this.heightBuffer);
        if (pixelSize == 0) { pixelSize++;} // XXX: hack to make sure we don't get errors from 0 width rectangles
        var pixelWidth:number = this.width * (this.widthInterval - this.widthBuffer);
        var pixelHeight:number = this.height * (this.heightInterval - this.heightBuffer);
        var left:number = 0;
        var right:number = 0;
        var top:number = 0;
        var bottom:number = 0;
        var origin:number[] = [];

        switch (this.growSurface)
        {
            case "top":
                left = -pixelWidth/2;
                right = pixelWidth/2;
                top = pixelSize;
                bottom = 0;
                origin = [pixelWidth/2, 0];
                break;
            case "left":
                left = -pixelWidth/2;
                right = -pixelWidth/2 + pixelSize;
                top = pixelHeight;
                bottom = 0;
                origin = [(pixelWidth/2), 0];
                break;
            case "bottom":
                left = -pixelWidth/2;
                right = pixelWidth/2;
                top = pixelHeight;
                bottom = -pixelSize + pixelHeight;
                origin = [pixelWidth/2, pixelSize - pixelHeight];
                break;
            case "right":
                left = pixelWidth/2 - pixelSize;
                right = pixelWidth/2;
                top = pixelHeight;
                bottom = 0;
                origin = [pixelSize - (pixelWidth/2), 0];
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
    }

    rebuildSprites(size:number)
    {
        // erase the sprites list
        this.sprites = [];

        for (var i:number = 0; i < size; i++)
        {
            var sprite:Draw2DSprite = Draw2DSprite.create({
                width: this.widthInterval,
                height: this.heightInterval,
                origin : [this.widthInterval/2, this.heightInterval/2],
                textureRectangle: [0, 0, this.widthInterval, this.heightInterval],
                rotation: (this.rotation - Math.PI)
            });
            sprite.setTexture(this.texture);
            sprite.setTextureRectangle(this.finalTextureRectangle);
            this.sprites.push(sprite);
        }
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
    }

    isClimbableAtObjectPosition(collisionUtil:Physics2DCollisionUtils, shape:Physics2DShape):boolean
    {
        var climbable:boolean = this.isClimbable && collisionUtil.intersects(this.getClimbableShape(), shape) && this.isInWorld && !this.isDead;
        return climbable;
    }

    getClimbableShape():Physics2DShape
    {
        return this.shape;
    }

    getTopPosition():number
    {
        return this.body.getPosition()[1] - this.currentSize * (this.heightInterval - this.heightBuffer);
    }

    draw(draw2D:Draw2D, offset:number[]) {
        // rebuild the sprites to match what is expected
        this.rebuildSprites(this.currentSize);

        // set the texture for the top most sprite, if any
        if (this.sprites.length > 0)
        {
            var sprite:Draw2DSprite = this.sprites[this.sprites.length - 1];

            if (this.animatedTexture.texture && this.animating && this.isBuildable) // if !this.isBuildable then its static
            {
                sprite.setTexture(this.animatedTexture.texture);
                sprite.setTextureRectangle(this.animatedTexture.currentFrameRectangle());
            }
            else
            {
                sprite.setTexture(this.texture);
                sprite.setTextureRectangle(this.finalTextureRectangle);
            }
        }

        if (this.currentSize > 0) {
            var additionalRotation:number = 0;
            var shiftDirection:number[] = [0, 1];
            if (this.growSurface == "top")
            {
                additionalRotation = 0;
                shiftDirection = [0, -1];
            }
            else if (this.growSurface == "right")
            {
                additionalRotation = Math.PI/2;
                shiftDirection = [1, 0];
            }
            else if (this.growSurface == "bottom")
            {
                additionalRotation = Math.PI;
                shiftDirection = [0, 1];
            }
            else if (this.growSurface == "left")
            {
                additionalRotation = 3*Math.PI/2;
                shiftDirection = [-1, 0];
            }

            var rotation:number = this.body.getRotation() - Math.PI;

            // correction because origin of each one is centered
            var correction:number[] = [0, 0.5];
            correction = [correction[0] * Math.cos(rotation) - correction[1] * Math.sin(rotation),
                          correction[0] * Math.sin(rotation) + correction[1] * Math.cos(rotation)];

            var finalShift:number[] = [0, 0];
            finalShift[0] = shiftDirection[0] * Math.cos(rotation) - shiftDirection[1] * Math.sin(rotation);
            finalShift[1] = shiftDirection[0] * Math.sin(rotation) + shiftDirection[1] * Math.cos(rotation);

            // if we are growing up or down, then the sprite width really is this.width, but if we are growing left or right
            // then the sprite width is actually this.height
            // TODO: Fix this ridiculousness
            var jMax:number;
            if (this.growSurface == "top" || this.growSurface == "bottom")
            {
                jMax = this.width;
            }
            else
            {
                jMax = this.height;
            }

            // iterate over each of the sprites and draw it, moving up along the direction of growth
            for (var i:number = 0; i < this.sprites.length; i++)
            {
                // iterate over the y direction as necessary, copying the image
                // as j increases we need to move orthogonal to the direction that we moved when i increased
                for (var j:number = 0; j < jMax; j++)
                {
                    var sprite:Draw2DSprite = this.sprites[i];
                    var pos:number[] = this.body.getPosition();
                    sprite.x = pos[0]
                        - (correction[0] * this.heightInterval) // offset b/c of origin shift
                        + ((this.heightInterval - this.heightBuffer) * finalShift[0] * i) // offset to stack images
                        - ((this.widthInterval - this.widthBuffer) * finalShift[1] * (j - ((jMax - 1)/2))); // offset for width
                    sprite.y = pos[1]
                        - (correction[1] * this.heightInterval)
                        + ((this.heightInterval - this.heightBuffer) * finalShift[1] * i)
                        - ((this.widthInterval - this.widthBuffer) * finalShift[0] * (j - ((jMax - 1)/2))); // offset for width
                    sprite.rotation = rotation + additionalRotation;

                    sprite.x -= offset[0];
                    sprite.y -= offset[1];

                    // and draw it to the screen
                    draw2D.drawSprite(sprite);
                }
            }
        }
    }
}
