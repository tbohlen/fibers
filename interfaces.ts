/// <reference path="jslib-modular/physics2d.d.ts" />
/// <reference path="jslib-modular/tzdraw2d.d.ts" />
/// <reference path="jslib-modular/turbulenz.d.ts" />
/// <reference path="CollisionHelper.ts"/>
/// <reference path="player.ts"/>
/// <reference path="checkpoint.ts"/>

interface TurbGameState {
    update():void;
}

interface InteractablesObject {
    buildables : Buildable[];
    climbables : Climbable[];
}

interface GameObject {
    engine : TurbulenzEngine;
    mathDevice : MathDevice;
    graphicsDevice : GraphicsDevice;
    inputDevice: InputDevice;
    keyboard : KeyboardInput;
    draw2D : Draw2D;
    physicsDevice : Physics2DDevice;
    physicsWorld : Physics2DWorld;
    collisionHelp: CollisionHelper;
    checkpointManager : CheckpointManager;
    debugMode : boolean;
}

interface KeyObject {
    LEFT ?: boolean;
    RIGHT ?: boolean;
    UP ?: boolean;
    DOWN ?: boolean;
    SPACE ?: boolean;
    E ?: boolean;
    W ?: boolean;
    A ?: boolean;
    S ?: boolean;
    D ?: boolean;
    T ?: boolean;
    F ?: boolean;
    G ?: boolean;
    H ?: boolean;
    R ?: boolean;
}

interface RigidSpriteOptions
{
    sprite : Draw2DSprite;
    initialPos : number[];
    gid ?: number;
    body ?: Physics2DRigidBody;
}

interface RectangleOptions extends RigidSpriteOptions
{
    initHeight : number;
    maxHeight : number;
    minHeight : number;
    width : number;
    rotation: number;
    isBuildable : boolean;
    isClimbable : boolean;
    isSolid : boolean; // if true indicates that this object should intersect with others.
    bodyType ?: string; // specifies static, kinematic or dynamic
}

interface ToolOptions extends RigidSpriteOptions
{
    buildable ?: Buildable;
}

interface ChainOptions extends RigidSpriteOptions
{
    initHeight ?: number;
    maxHeight : number;
    minHeight : number;
    width : number;
    rotation: number;
    needleHeight: number; // the height of the graphic showing the knitting needles
}

interface knitCubeOptions extends RigidSpriteOptions {
    maxDimension:number;
    minDimension:number;
}

interface Interactable {
    playerCollideCallback(player:Player):void;
    /*
     * Method: getShapes
     * Returns a list of all the shapes that should be considered when finding intersections with this interactable.
     * This should include all shapes that can be interacted with in any way (buildable, climbable, etc.)
     */
    getShapes():Physics2DShape[];
}

interface Buildable {
    isBuildable:boolean;
    /*
     * Method: buildUp
     * This is called whenever the player is overlapping with this object and presses the build up button.
     * The object implementing this interface needs to react accordingly.
     */
    buildUp():void;
    /*
     * Method: buildDown
     * This is called whenever the player is overlapping with this object and presses the build down button.
     * The object implementing this interface needs to react accordingly.
     */
    buildDown():void;
}


interface Climbable {
    isClimbable:boolean;
    shape?:Physics2DShape;

    /*
     * Method: isClimbableAtPosition
     * Returns whether a given position in object-space is climbable. This is an alternative
     * to specifying a geometric shape if you have some cool parametric way of describing
     * which regions are climbable (maybe overkill)
     */
    isClimbableAtObjectPosition(collisionUtil:Physics2DCollisionUtils, otherShape: Physics2DShape):boolean;
}

class ClimbableDefault implements Climbable
{
    isClimbable:boolean = true;
    shape:Physics2DShape;

    isClimbableAtObjectPosition(collisionUtil:Physics2DCollisionUtils, otherShape: Physics2DShape):boolean
    {
        return collisionUtil.intersects(this.getClimbableShape(), otherShape);
    }

    getClimbableShape():Physics2DShape
    {
        return this.shape;
    }
}

interface CheckpointOptions
{
    body : Physics2DRigidBody;
    name : String;
    checkpointManager : CheckpointManager;
    completed ?: boolean;
}