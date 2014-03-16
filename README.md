Prototype for the CMS.617 video game class.

Install Turbulenz (0.27.0): https://hub.turbulenz.com/#downloads

Go to where it was installed (`cd` in terminal).
On Mac OS it is `~/Turbulenz/SDK/0.27.0` by default.

Basically, follow these directions to try things out:
http://docs.turbulenz.com/installing.html#running-a-sample

```
source start_env
./start_local.sh
```

Put this project in the turbulenz games devserver directory, eg:
```
/Users/ethanis/Turbulenz/SDK/0.27.0/devserver/games
```

Now visit `http://127.0.0.1:8070`

Press the '+' on the left hand side on the web page, and specify `fibers`
as the game directory. Now you can try it! Click `Play -> fibers.debug.html`.

Yay.

`http://127.0.0.1:8070/#/play/samples`

has lots of great, self-contained examples.

We should probably just use protolib for as long as possible:
http://docs.turbulenz.com/protolib/protolib_api.html#protolib-draw2dsprite

Here is a tutorial on tiled map editor:
http://gamedevelopment.tutsplus.com/tutorials/introduction-to-tiled-map-editor-a-great-platform-agnostic-tool-for-making-level-maps--gamedev-2838


Whenever we add resources to the game, we must add them to the mapping_table.json.
This is the file that provides mappings for assets from the ‘Asset Name’ to ‘Request Name’

dealing with typescript

```
tsc --out scripts/APPNAME.js -d [tsscripts/APPNAME/APPFILE.ts ..] [../../jslib-modular/JSLIBMODULARDEP.d.ts ..] [OTHERDEP.d.ts ..]
```

We want a script to list all of our project files and bundle them up as one app file with source maps.

typescript files include dependencies like this:

Add the following references to the TypeScript file. They should be specified after the global declarations, but before the TurbulenzEngine.onload function

```
/// <reference path="jslib-modular/turbulenz.d.ts" />
/// <reference path="jslib-modular/servicedatatypes.d.ts" />
/// <reference path="jslib-modular/services.d.ts" />
/// <reference path="jslib-modular/aabbtree.d.ts" />
/// <reference path="jslib-modular/jsengine_base.d.ts" />
/// <reference path="jslib-modular/jsengine.d.ts" />
/// <reference path="jslib-modular/utilities.d.ts" />

And then in the html file we include the corresponding jslib-modular script files...


For now, the lousy build setup is:
```
tsc --out build/fibers.js -d fibers.ts
```

We should be able to make builds properly automatic, especially with WebStorm. I just haven't gotten around to it yet.


To make new components, create a new .ts file, then refer to it in the file which depends on it, like this:
```
/// <reference path="player.ts"/>
```