/// <reference path="jslib-modular/tzdraw2d.d.ts" />
/// <reference path="jslib-modular/physics2d.d.ts" />

/// <reference path="player.ts"/>
/// <reference path="rigidSprite.ts"/>
/// <reference path="interfaces.ts"/>

class knitCube extends RigidSprite implements Buildable
{
    maxDimension:number;
    minDimension:number;
    currentHeight:number;
    constructor (options:knitCubeOptions, game:GameObject)
    {
        super(options);
        this.maxDimension = options.maxDimension;
        this.minDimension = options.minDimension;
        this.currentHeight = 0;
    }

    public buildUp():void
    {

    }

    public buildDown():void
    {

    }

    public getBuildableShape():Physics2DShape
    {
        return null;
    }
}