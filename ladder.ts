/// <reference path="interfaces.ts" />
/// <reference path="rigidSprite.ts" />

class Ladder extends ClimbableDefault
{
    constructor(public rigidSprite:RigidSprite)
    {
        super();
    }

    getClimbableShape():Physics2DShape
    {
        return this.rigidSprite.body.shapes[0];
    }
}