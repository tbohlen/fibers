/**
 * Created by martelly on 4/14/2014.
 */
class InpDevWrapper
{
    inputDev:InputDevice;
    keys:any;
    mouse:any;
    private mouseBody:Physics2DRigidBody;

    private reverseMapping:any;
    private recentlyPressed:any;
    private recentlyReleased:any;
    private mouseDownListeners:any[];
    private mouseUpListeners:any[];
    constructor(inputDevice:InputDevice, physicsDevice:Physics2DDevice, collisionHelp:CollisionHelper)
    {
        var shapes : Physics2DShape[] = [
            physicsDevice.createPolygonShape({
                vertices : [[0,0]] // TODO: Should this actually be more than a single point?
            })
        ];
        this.mouseBody = physicsDevice.createRigidBody({
            shapes : shapes,
            type : 'kinematic'
        });

        this.mouseDownListeners = [];
        this.mouseUpListeners = [];

        this.inputDev = inputDevice;
        this.reverseMapping = {};
        this.recentlyPressed = {};
        this.recentlyReleased = {};
        this.mouse = {x: 0,
            y:0,
            pressed : false,
            recentlyPressed : false,
            recentlyReleased : false};
        for (var item in inputDevice.keyCodes)
        {
            this.reverseMapping[inputDevice.keyCodes[item]] = item;
        }
        this.keys = {};

        var that = this;
        inputDevice.addEventListener("keydown", function(keycode) {
            that.keys[that.reverseMapping[keycode]] = true;
            that.recentlyPressed[that.reverseMapping[keycode]] = true;
            that.recentlyReleased[that.reverseMapping[keycode]] = false;
        });

        inputDevice.addEventListener("keyup", function(keycode) {
            that.keys[that.reverseMapping[keycode]] = false;
            that.recentlyPressed[that.reverseMapping[keycode]] = false;
            that.recentlyReleased[that.reverseMapping[keycode]] = true;
        });

        inputDevice.addEventListener("mousedown", function(mouseCode, x, y) {
            that.mouse.x = x;
            that.mouse.y = y;
            if (mouseCode === inputDevice.mouseCodes.BUTTON_0) {
                that.mouse.pressed = true;
                that.mouse.recentlyPressed = true;
                that.mouse.recentlyReleased = false;
                // call all mousedown listeners
                for (var i:number = 0; i < that.mouseDownListeners.length; i++)
                {
                    var o = that.mouseDownListeners[i];
                    var otherShape = o.shapeFunc();
                    var mouseShape = that.mouseShape();
                    if (collisionHelp.collisionUtils.intersects(mouseShape, otherShape))
                    {
                        o.callback();
                    }
                }
            }
        });

        inputDevice.addEventListener("mouseup", function(mouseCode, x, y) {
            that.mouse.x = x;
            that.mouse.y = y;
            if (mouseCode === inputDevice.mouseCodes.BUTTON_0) {
                that.mouse.pressed = false;
                that.mouse.recentlyPressed = false;
                that.mouse.recentlyReleased = true;

                // call all mouseup listeners
                for (var i:number = 0; i < that.mouseUpListeners.length; i++)
                {
                    var o = that.mouseUpListeners[i];
                    var otherShape = o.shapeFunc();
                    var mouseShape = that.mouseShape();
                    if (collisionHelp.collisionUtils.intersects(mouseShape, otherShape))
                    {
                        o.callback();
                    }
                }
            }
        });

        inputDevice.addEventListener("mouseover", function(x, y) {
            that.mouse.x = x;
            that.mouse.y = y;
        });
    }

    addEventListener(eventType:String, shapeFunc:Function, callbackFunc:Function):void
    {
        if (eventType == "mousedown")
        {
            this.mouseDownListeners.push({
                shapeFunc : shapeFunc,
                callback : callbackFunc
            });
        }
        else if (eventType == "mouseup")
        {
            this.mouseUpListeners.push({
                shapeFunc : shapeFunc,
                callback : callbackFunc
            });
        }
        else
        {
            console.log("event type: " + eventType + " not supported by InpDevWrapper.");
        }
    }

    resetListeners():void
    {
        this.mouseDownListeners = [];
        this.mouseUpListeners = [];
    }

    keyPressed(key:string):boolean
    {
        if (key in this.keys)
        {
            return this.keys[key];
        }
        return false;
    }

    justPressed(key:string):boolean
    {
        if (key in this.recentlyPressed) {
            return this.recentlyPressed[key];
        }
        return false;
    }

    justReleased(key:string):boolean
    {
        if (key in this.recentlyReleased) {
            return this.recentlyReleased[key];
        }
        return false;
    }

    mousePressed():boolean
    {
        return this.mouse.pressed;
    }

    mouseX():number
    {
        return this.mouse.x;
    }

    mouseY():number
    {
        return this.mouse.y;
    }

    mousePosition():number[]
    {
        return [this.mouseX(), this.mouseY()];
    }

    mouseJustPressed():boolean
    {
        return this.mouse.justPressed;
    }

    mouseJustReleased():boolean
    {
        return this.mouse.justReleased;
    }

    mouseShape():Physics2DShape
    {
        this.mouseBody.setPosition([this.mouse.x, this.mouse.y]);
        return this.mouseBody.shapes[0];
    }

    update():void
    {
        this.recentlyPressed = {};
        this.recentlyReleased = {};
    }
}