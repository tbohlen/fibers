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
