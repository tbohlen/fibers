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
    public static BUILD_DELAY:number = 300;
    public static NUMBER_OF_FRAMES:number = 4;
    public static HEIGHT_INTERVAL:number = 64;
    public static WIDTH_INTERVAL:number = 64;
    public static VERT_BUFFER:number = 37;
    public static HORIZ_BUFFER:number = 30;
    public static BOTTOM_OFFSET:number = 10;

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

    bottomTexture:Texture = null;
    middleTexture:Texture = null;
    topTexture:AnimatedTexture = null;
    bottomLoaded:boolean = false;
    topLoaded:boolean = false;
    middleLoaded:boolean = false;
    animationTimeout;
    animating:boolean = false;
    afterAnimatingSize:number = 0;

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

        // limit the size to the shapes we can handle and convert from pixel units to sprite-size units
        options.maxSize = Math.ceil(options.maxSize / (Rectangle.HEIGHT_INTERVAL-Rectangle.VERT_BUFFER));
        options.minSize = Math.floor(options.minSize / (Rectangle.HEIGHT_INTERVAL-Rectangle.VERT_BUFFER));
        options.initSize = Math.floor(options.initSize / (Rectangle.HEIGHT_INTERVAL-Rectangle.VERT_BUFFER));
        if (this.growSurface == "top" || this.growSurface == "bottom")
        {
            // in this case height interval really does map to height
            options.width = Math.ceil(options.width / (Rectangle.WIDTH_INTERVAL - Rectangle.HORIZ_BUFFER));
            options.height = Math.ceil(options.height / (Rectangle.HEIGHT_INTERVAL - Rectangle.VERT_BUFFER));
        }
        else if (this.growSurface == "left" || this.growSurface == "right")
        {
            // in this case the height interval actually maps to width because of sprite rotations later on
            options.width = Math.ceil(options.width / (Rectangle.HEIGHT_INTERVAL - Rectangle.VERT_BUFFER));
            options.height = Math.ceil(options.height / (Rectangle.WIDTH_INTERVAL - Rectangle.HORIZ_BUFFER));
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
            this.game.physicsWorld.removeRigidBody(this.body);
        }

        this.buildShape(this.currentSize);

        this.shape = this.body.shapes[0];
        this.material = this.shape.getMaterial();
        this.body.setPosition(options.initialPos);
        this.body.setRotation(options.rotation);

        // load textures
        var that:any = this;
        var bottomParams:TextureParameters = {
            src: "assets/chainBottom.png",
            mipmaps: true,
            width: Rectangle.WIDTH_INTERVAL,
            height: Rectangle.HEIGHT_INTERVAL,
            onload: function onLoadBottom(texture:Texture, status?:number)
            {
                if (texture)
                {
                    that.bottomTexture = texture;
                    that.bottomLoaded = true;
                }
            }
        };
        var loadingBottom:any = this.game.graphicsDevice.createTexture(bottomParams);
        var middleParams:TextureParameters = {
            src: "assets/chainMiddle.png",
            mipmaps: true,
            width: Rectangle.WIDTH_INTERVAL,
            height: Rectangle.HEIGHT_INTERVAL,
            onload: function onLoadMiddle(texture:Texture, status?:number)
            {
                if (texture)
                {
                    that.middleTexture = texture;
                    that.middleLoaded = true;
                }
            }
        };
        var loadingMiddle:any = this.game.graphicsDevice.createTexture(middleParams);

        // the top is animated, so load an animated version
        this.topTexture = new AnimatedTexture("assets/chainTop.png", [64, 64], Rectangle.NUMBER_OF_FRAMES, false, true);
        this.topTexture.loadTexture(this.game.graphicsDevice, (texture) => {
            if (texture)
            {
                that.topLoaded = true;
            }
        });

        // prepare the animation timeout
        this.animationTimeout = window.setInterval(
            ()=> {
                if (this.topTexture) {
                    this.topTexture.updateCurrentFrame();
                }
            }, Rectangle.BUILD_DELAY/Rectangle.NUMBER_OF_FRAMES);

        // prepare a loop callback for the end of the top animation
        this.topTexture.setLoopCallback(()=> {
            // if we're waiting for the animation to end, when it does end set the size again
            if (this.animating && this.topTexture.isReversed)
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
            //options.width = Math.ceil(options.width / (Rectangle.WIDTH_INTERVAL - Rectangle.HORIZ_BUFFER));
            //options.height = Math.ceil(options.height / (Rectangle.HEIGHT_INTERVAL - Rectangle.VERT_BUFFER));


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
        if(this.currentSize < this.maxSize && time > this.lastBuildTime + Rectangle.BUILD_DELAY) {
            // set up the animation
            this.topTexture.setReverse(false);
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
        if(this.currentSize > this.minSize && time > this.lastBuildTime + Rectangle.BUILD_DELAY) {
            // set up the animation
            this.topTexture.setReverse(true);
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
        var pixelSize:number = size * (Rectangle.HEIGHT_INTERVAL - Rectangle.VERT_BUFFER);
        if (pixelSize == 0) { pixelSize++;} // XXX: hack to make sure we don't get errors from 0 width rectangles
        var pixelWidth:number = this.width * (Rectangle.WIDTH_INTERVAL - Rectangle.HORIZ_BUFFER);
        var pixelHeight:number = this.height * (Rectangle.HEIGHT_INTERVAL - Rectangle.VERT_BUFFER);
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
                width: Rectangle.WIDTH_INTERVAL,
                height: Rectangle.HEIGHT_INTERVAL,
                origin : [Rectangle.WIDTH_INTERVAL/2, Rectangle.HEIGHT_INTERVAL/2],
                textureRectangle: [0, 0, Rectangle.WIDTH_INTERVAL, Rectangle.HEIGHT_INTERVAL],
                rotation: (this.rotation - Math.PI)
            });
            if (i == 0)
            {
                sprite.setTexture(this.bottomTexture);
            }
            else
            {
                // the top one (num - 1) also gets the middleTexture, but this will be replaced during the
                // draw function with the corret frame of the top texture
                sprite.setTexture(this.middleTexture);
            }
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

    getTopPosition():number
    {
        return this.body.getPosition()[1] - this.sprite.getHeight();
    }

    draw(draw2D:Draw2D, offset:number[]) {
        // rebuild the sprites to match what is expected
        this.rebuildSprites(this.currentSize);

        // set the texture for the top most sprite, if any
        if (this.sprites.length > 0)
        {
            var sprite:Draw2DSprite = this.sprites[this.sprites.length - 1];

            if (this.topTexture.texture && this.animating) {
                sprite.setTexture(this.topTexture.texture);
                sprite.setTextureRectangle(this.topTexture.currentFrameRectangle());
            }
            else
            {
                sprite.setTexture(this.middleTexture);
                sprite.setTextureRectangle([0, 0, Rectangle.WIDTH_INTERVAL, Rectangle.HEIGHT_INTERVAL]);
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
            // TODO: Fix this cause its ridiculousness
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
                        //- Rectangle.BOTTOM_OFFSET * finalShift[0] // offset b/c bottom of tile is not bottom of image
                        - (correction[0] * (Rectangle.HEIGHT_INTERVAL - Rectangle.VERT_BUFFER)) // offset b/c of origin shift
                        + ((Rectangle.HEIGHT_INTERVAL - Rectangle.VERT_BUFFER) * finalShift[0] * i) // offset to stack images
                        - ((Rectangle.WIDTH_INTERVAL - Rectangle.HORIZ_BUFFER) * finalShift[1] * (j - ((jMax - 1)/2))); // offset for width
                    sprite.y = pos[1]
                        //- Rectangle.BOTTOM_OFFSET * finalShift[1]
                        - (correction[1] * (Rectangle.HEIGHT_INTERVAL - Rectangle.VERT_BUFFER))
                        + ((Rectangle.HEIGHT_INTERVAL - Rectangle.VERT_BUFFER) * finalShift[1] * i)
                        - ((Rectangle.WIDTH_INTERVAL - Rectangle.HORIZ_BUFFER) * finalShift[0] * (j - ((jMax - 1)/2))); // offset for width
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
