// top level dart file
import 'dart:html';
import 'dart:js';
import 'dart:math';

void main() {
    // this only starts when the page is loaded, so set up our canvas
    Player player = new Player();
    Game game = new Game(player);
}

class Game {
    CanvasElement _canvas;
    Player _player;
    List _offset;
    var _camera;
    var _renderer;
    var _scene;
    var _directionalLight;
    var _ambientLight;
    Game(Player player) {
        _player = player;
        _offset = new List(2);
        initCanvas();
        resize();
    }

    List get offset => _offset;

    List get canvasSize => [_canvas.width, _canvas.height];

    void resize() {
        /*// find the size of the window*/
        /*int width = window.innerWidth();*/
        /*int height = window.innerHeight();*/

        /*// resize the canvas to fill the window*/
        /*_canvas_width = width;*/
        /*_canvas.height = height;*/

        _offset = getOffset(_canvas);
    }

    void initCanvas() {
        _camera = new JsObject(context['THREE']['PerspectiveCamera'], [60, 4/3, 0.1, 10000]);

        _scene = new JsObject(context['THREE']['Scene'], []);

        _renderer = new JsObject(context['THREE']['WebGLRenderer'], []);
        _renderer.callMethod('setSize', [800, 600]);

        _canvas = _renderer['domElement'];
        _canvas.className = _canvas.className + " canvas";
        querySelector('body').append(_canvas);

        this.initScene();
        window.requestAnimationFrame(drawScene);
    }

    void initScene() {
        for (var i = 0; i < 3; i++) {
            var geometry = new JsObject(context['THREE']['CylinderGeometry'], [1, 1, 8, 20, 1, false]);
            geometry.callMethod('computeVertexNormals', []);
            var phongParams = new JsObject.jsify({'color': 0xaa0000});
            var material = new JsObject(context['THREE']['MeshPhongMaterial'], [phongParams]);
            var cylinder = new JsObject(context['THREE']['Mesh'], [geometry, material]);
            cylinder['position'].callMethod('set', [4*i, 0, 0]);
            this.addObject(cylinder);
        }

        // add a directional light for shading
        _directionalLight = new JsObject(context['THREE']['DirectionalLight'], [0xffffff, 1.0, 1]);
        _directionalLight['position'].callMethod('set', [5, 5, 8]);
        _ambientLight = new JsObject(context['THREE']['AmbientLight'], [0x444444]);
        _ambientLight['position'].callMethod('set', [0, 5, 0]);
        _scene.callMethod('add', [_directionalLight]);
        _scene.callMethod('add', [_ambientLight]);
    }

    void addObject(var object) {
        // adds an object to the map by adding it to physics, collidables, and
        // drawing it
        _scene.callMethod('add', [object]);
    }


    void drawScene(num time) {
        // find the camera position
        /*var newPos = new JsObject(context['THREE']['Vector3'], [10, 0, 0]);*/
        /*var quat = new JsObject(context['THREE']['Quaternion'], []);*/
        /*newPos.callMethod('copy', [context['gameEnv']['ship']['position']);*/
        /*quat.callMethod('copy', [context['gameEnv']['ship']['quaternion]);*/
        /*var lookDir = new context['THREE'].Vector3(0, 0, 1);*/

        // transform the -z vector, our look direction, by the quaternion
        /*quat.multiplyVector3(lookDir);*/
        /*lookDir.multiplyScalar(5);*/
        _player.update(this);

        _camera['position']['z'] = 20;
        /*context.gameEnv.camera.quaternion = quat;*/
        _camera.callMethod('updateProjectionMatrix', []);

        // render the screen
        _renderer.callMethod('render', [_scene, _camera]);

        // request that the frame be rendered again in a moment
        window.requestAnimationFrame(drawScene);
    }
}

/*
 * Options for control are:
 * 1. 2D using mouse to guide, click to grab
 * 2. 2D using arrows to guide, space to grab
 * 3. 3D using mouse to look and arrows to guide, click to grab
 * 4. 3D using keyboard to move and 3rd person, space to grab
 */
class Player {
    final double VEL_SCALE = 0.1;
    final double LOOK_VEL_SCALE = 0.1;

    int _controlStyle;
    List _pos = [0, 0, 0];
    // velocity is used differently depending on control scheme
    List _vel = [0, 0, 0];
    bool _holding = false;
    List _lookDir = [0, 0, 1];
    List _lookDirDelta = [0, 0, 0];
    List _mousePos = [0, 0];

    Player() {
        _pos = [0, 0, 0];
        BodyElement body = querySelector("body");

        body.onMouseUp.listen(handleMouseUp);
        body.onMouseDown.listen(handleMouseDown);
        body.onMouseMove.listen(handleMouseMove);
        body.onKeyDown.listen(handleKeyDown);
        body.onKeyUp.listen(handleKeyUp);
    }

    void handleKeyDown(KeyboardEvent e) {
        KeyEvent event = new KeyEvent(keyboardEvent);
        switch (event.keyCode) {
            case 65:
                // a
                if (_controlStyle == 2) {
                    // direction of motion
                    _vel[0] = -1;
                }
                else if (_controlStyle == 3) {
                    // direction of motion
                    _vel[0] = -1;
                }
                else if (_controlStyle == 4) {
                    // direction of motion
                    _vel[0] = -1;
                }
                break;
            case 87:
                // w
                if (_controlStyle == 2) {
                    // direction of motion
                    _vel[2] = 1;
                }
                else if (_controlStyle == 3) {
                    // direction of motion
                    _vel[2] = 1;
                }
                else if (_controlStyle == 4) {
                    // direction of motion
                    _vel[2] = 1;
                }
                break;
            case 91:
                // d
                if (_controlStyle == 2) {
                    // direction of motion
                    _vel[0] = 1;
                }
                else if (_controlStyle == 3) {
                    // direction of motion
                    _vel[0] = 1;
                }
                else if (_controlStyle == 4) {
                    // direction of motion
                    _vel[0] = 1;
                }
                break;
            case 83:
                // s
                if (_controlStyle == 2) {
                    // direction of motion
                    _vel[2] = -1;
                }
                else if (_controlStyle == 3) {
                    // direction of motion
                    _vel[2] = -1;
                }
                else if (_controlStyle == 4) {
                    // direction of motion
                    _vel[2] = -1;
                }
                break;
            case 32:
                // space
                if (_controlStyle == 2 || _controlStyle == 4) {
                    _holding = true;
                }
                break;
            default:
        }
    }

    void handleKeyUp(Event e) {
        switch (e.keyCode) {
            case 32:
                // space
                if (_controlStyle == 2 || _controlStyle == 4) {
                    _holding = false;
                }
                break;
            case 49:
                // 1
                _controlStyle = 1;
                // lookdir in 2D is straight down
                _lookDir = [0, -1, 0];
                break;
            case 50:
                // 2
                _controlStyle = 2;
                // lookdir in 2D is straight down
                _lookDir = [0, -1, 0];
                break;
            case 51:
                // 3
                _controlStyle = 3;
                // starting lookdir in mode 3 is straight ahead
                _lookDir = _vel;
                break;
            case 52:
                // 4
                _controlStyle = 4;
                // lookdir in 4 is always straight ahead
                _lookDir = _vel;
                break;
            default:
        }
    }

    void handleMouseMove(Event e) {
        // just saves the mouse position. This can then be used to update the player as needed
        _mousePos[0] = e.pageX;
        _mousePos[1] = e.pageY;
        if (_controlStyle == 1) {
            _vel[0] = _mousePos[0] - game.offset[0] - game.canvasSize[0];
            _vel[1] = _mousePos[1] - game.offset[1] - game.canvasSize[1];
        }
        if (_controlStyle == 3) {
            _lookDirDelta[0] = _mousePos[0] - game.offset[0] - game.canvasSize[0];
            _lookDirDelta[1] = _mousePos[1] - game.offset[1] - game.canvasSize[1];
        }
    }

    void handleMouseDown(Event e) {
        if (_controlStyle == 1 || _controlStyle == 3) {
            _holding = true;
        }
    }

    void handleMouseUp(Event e) {
        if (_controlStyle == 1 || _controlStyle == 3) {
            _holding = false;
        }
    }

    void update(Game game) {
        // update the position with the last velocity
        _pos += normalize(_vel) * VEL_SCALE;

        switch (_controlStyle) {
            case 1:
                List normVel = normalize(_val);
                _pos[0] += normVel[0] * VEL_SCALE;
                _pos[1] += normVel[1] * VEL_SCALE;
                break;
            case 2:
                List normVel = normalize(_val);
                _pos[0] += normVel[0] * VEL_SCALE;
                _pos[1] += normVel[1] * VEL_SCALE;
                break;
            case 3:
                // first update position by moving relative to look dir
                List normVel = normalize(_val);
                List moveDir = normalize([_lookDir[0], _lookDir[2]]); // only x and z

                // move parallel to the look dir (along camera z)
                _pos[0] += normVel[2] * VEL_SCALE * moveDir[0];
                _pos[1] += normVel[2] * VEL_SCALE * moveDir[1];

                // move perpendicularly to the look dir (along camera x)
                List orthoMoveDir = ortho(moveDir);
                _pos[0] += -normVel[0] * VEL_SCALE * orthoMoveDir[0];
                _pos[1] += -normVel[0] * VEL_SCALE * orthoMoveDir[1];

                // change the look dir
                List upVec = normalize(cross([1, 0, 0], _lookDir));
                List rightVec = normalize(cross(_lookDir, upVec));

                // add the horizontal components
                _lookDir[0] = _lookDirDelta[0] * rightVec[0];
                _lookDir[1] = _lookDirDelta[0] * rightVec[1];
                _lookDir[2] = _lookDirDelta[0] * rightVec[2];
                // add the vertical components
                _lookDir[0] = _lookDirDelta[1] * upVec[0];
                _lookDir[1] = _lookDirDelta[1] * upVec[1];
                _lookDir[2] = _lookDirDelta[1] * upVec[2];
                break;
            case 4:
                List normVel = normalize(_val);
                _pos[0] += normVel[0] * VEL_SCALE;
                _pos[1] += normVel[1] * VEL_SCALE;
                break;
        }
    }
}

List normalize(List vec) {
    int len = length(vec);
    if (len == 0) {
        return vec;
    }
    else {
        List normVec = new List(vec.length);
        for (int i = 0; i < vec.length; i++) {
            normVec[i] = vec[i]/len;
        }
        return normVec;
    }
}

int length(List vec) {
    int sum = 0;
    for (int i = 0; i < vec.length; i++) {
        sum += vec[i] * vec[i];
    }
    return sqrt(sum);
}

List getOffset(Element elem) {
    DocumentElement docElem = document.documentElement;
    final box = elem.getBoundingClientRect();
    return [(box.left + window.pageXOffset - docElem.clientLeft),
            (box.top  + window.pageYOffset - docElem.clientTop)];
}

List ortho(List vec) {
    // assumes 2D
    return [-vec[1], vec[0]];
}

List cross(List one, List two) {
    // calculate 3 2x2 determinates
    num iDet = one[1] * two[2] - one[2] * two[1];
    num jDet = -1 * (one[0] * two[2] - one[2] * two[0]);
    num kDet = one[0] * two[1] - one[1] * two[0];
    return [iDet, jDet, kDet];
}
