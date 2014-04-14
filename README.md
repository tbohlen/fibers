Prototype for the CMS.617 video game class.

Install [Turbulenz 0.28.0](https://hub.turbulenz.com/#downloads).

Go to where it was installed (`cd` in terminal).
On Mac OS it is `~/Turbulenz/SDK/0.28.0` by default.

Basically, [follow these directions to try things out](http://docs.turbulenz.com/installing.html#running-a-sample).

```
cd ~/Turbulenz/SDK/0.28.0
source start_env
./start_local.sh
```

Put this project in the turbulenz games devserver directory (or symlink it!), eg:

```
/Users/ethanis/Turbulenz/SDK/0.28.0/devserver/games
```

Now visit [localhost:8070](http://127.0.0.1:8070).

Press the '+' on the left hand side on the web page, and specify `fibers`
as the game directory. Now you can try it! Click `Play -> fibers.debug.html`.

Yay.

[The samples listing](http://127.0.0.1:8070/#/play/samples) has lots of great, self-contained examples.

[Here is a tutorial on tiled map editor](http://gamedevelopment.tutsplus.com/tutorials/introduction-to-tiled-map-editor-a-great-platform-agnostic-tool-for-making-level-maps--gamedev-2838).

# BUILDING THE GAME

Make sure you have [Typescript installed](http://www.typescriptlang.org/#Download).

For now, the build setup is:

```
tsc --sourcemap -w --out build/fibers.js -d fibers.ts
```

You can do this same thing by running:

```
./build.sh
```

Alternatively, WebStorm should automatically rebuild your files if it is setup correctly.
Read their [TypeScript support docs](https://www.jetbrains.com/webstorm/webhelp/typescript-support.html) to learn more.

To make new components, create a new .ts file, then refer to it in the file which depends on it, like this:

```
/// <reference path="player.ts"/>
```

IGNORE THE JAVASCRIPT. I REPEAT, IGNORE THE JAVASCRIPT.
WE ARE WRITING TYPESCRIPT!

Add the following references to the TypeScript file.
They should be specified after the global declarations, but before the TurbulenzEngine.onload function:

```
/// <reference path="jslib-modular/turbulenz.d.ts" />
/// <reference path="jslib-modular/servicedatatypes.d.ts" />
/// <reference path="jslib-modular/services.d.ts" />
/// <reference path="jslib-modular/aabbtree.d.ts" />
/// <reference path="jslib-modular/jsengine_base.d.ts" />
/// <reference path="jslib-modular/jsengine.d.ts" />
/// <reference path="jslib-modular/utilities.d.ts" />
```

And then in the html file we include the corresponding jslib-modular script files...

#MAKING NEW MAPS

To make a new map, use [Tiled map editor](http://www.mapeditor.org/) to construct it.
Once you're satisfied, export the map as json: `File -> Export As...`.

Place it in `assets/maps/YOUR_MAP_NAME.json`.

###MAKING RIGID BODIES IN MAPS

There are a number of special objects that you can create from tiled. Here's a rough outline of how to make them.

Platforms must have "Platform" as their type and the following Name:Value pairs in the object properties:
* rigidBody:static
* shape:rectangle

Tools must have "Tool" as their type. Each tool can be associated with one other
object in the scene. When intersecting with the tool, the player can build the
other object up and down. You can either tell the tool how to make the other
object, or make the other object yourself in tiled. To tell the program to make
it you must include the following:
* initHeight:<<integer in pixels>>
* maxHeight:<<integer in pixels>>
* minHeight:<<integer in pixels>>
* rotation:<<number in radians>>
* width:<<integer in pixels>>
* isBuildable:<<true or false>>
* isClimbable:<<true or false>>
* prebuilt:false

To build the other object yourself, build a rectangle somewhere in the scene and
give it a the property "toolKey" with a value of your choosing. Now give your
tool the following:
* prebuilt:true
* toolKey:<<the same value you gave the rectangle>>

Checkpoints must have "Checkpoint" as their type and the following Name:Value pairs in the object properties:
* checkpointName:<<some identifying string>>
* press R to go to the last checkpoint that you passed 

Rectangles must have "Rectangle" as their type. Rectangles can be climbable or
not, and buildable or not. Additional options will be added soon. The following
properties must be included:
* maxHeight:<<integer in pixels>>
* minHeight:<<integer in pixels>>
* rotation:<<number in radians>>
* isBuildable:<<true or false>>
* isClimbable:<<true or false>>
* (optional) initHeight:<<integer in pixels>> (if included, this will supersede the height of the object as shown in tiled)
* (optional => only if tool prebuilt:true)toolKey:<<the same value you gave the tool>>

