Prototype for the CMS.617 video game class.

Install [Turbulenz 0.28.0](https://hub.turbulenz.com/#downloads)

Go to where it was installed (`cd` in terminal).
On Mac OS it is `~/Turbulenz/SDK/0.28.0` by default.

Basically, [follow these directions to try things out](http://docs.turbulenz.com/installing.html#running-a-sample)

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

#BUILDING THE GAME

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

TypeScript files include dependencies like this:

Add the following references to the TypeScript file. They should be specified after the global declarations, but before the TurbulenzEngine.onload function

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
