// group bits
// player = 1
// knitting needles & other things the player should not run into = 2
// climbable things and other things the player can overlap but still interact with = 4
// things that collide normally = 8
//
// Masks
// Knitting needles mask = 0 - they interact with nothing
// Player mask = 13 - interacts with everything but needles
// Climbable mask = 13
// Other mask = 13

enum ShapeGroups
{
    PLAYER = 1,
    TOOLS = 2,
    OVERLAPPABLES = 4,
    COLLIDABLES = 8
}

enum ObjectMasks
{
    SOLID = 13,
    EMPTY = 0,
    PLAYEREMPTY = 12
}
