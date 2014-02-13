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
    var _playerGeom; // the geometry of the player
    
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
        var playerSphere = new JsObject(context['THREE']['SphereGeometry'],
                                       [2, 8, 6, 0, 2*PI, 0, PI]);
        var playerParams = new JsObject.jsify({'color': 0x00aa00});
        var playerMaterial = new JsObject(context['THREE']['MeshPhongMaterial'],
                                         [playerParams]);
        _playerGeom = new JsObject(context['THREE']['Mesh'], 
                                   [playerSphere, playerMaterial]);
        _playerGeom['position'].callMethod('set', [2, 2, 2]);
        this.addObject(_playerGeom);
      
        for (var i = 0; i < 3; i++) {
            var geometry = new JsObject(context['THREE']['CylinderGeometry'], [1, 1, 8, 20, 1, false]);
            geometry.callMethod('computeVertexNormals', []);
            var phongParams = new JsObject.jsify({'color': 0xaa0000});
            var material = new JsObject(context['THREE']['MeshPhongMaterial'], [phongParams]);
            var cylinder = new JsObject(context['THREE']['Mesh'], [geometry, material]);
            cylinder['position'].callMethod('set', [4*i, 0, 0]);
            this.addObject(cylinder);
        }

        // make a ground
        var geometry = new JsObject(context['THREE']['PlaneGeometry'], [50, 50]);
        geometry.callMethod('computeVertexNormals', []);
        var phongParams = new JsObject.jsify({'color': 0xcccccc});
        var material = new JsObject(context['THREE']['MeshPhongMaterial'], [phongParams]);
        var plane = new JsObject(context['THREE']['Mesh'], [geometry, material]);
        plane['position'].callMethod('set', [-25, 0, -25]);
        var matrix = new JsObject(context['THREE']['Matrix4'], []);
        matrix.callMethod('makeRotationX', [(-3.141592/2.0)]);
        plane.callMethod('applyMatrix', [matrix]);
        this.addObject(plane);
        
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
        _player.update(this);

        // find the camera position
        /*var pos = new JsObject(context['THREE']['Vector3'], [_player.pos[0], _player.pos[1], _player.pos[2]]);*/
        /*var quat = new JsObject(context['THREE']['Quaternion'], []);*/
        /*quat.callMethod('copy', [context['gameEnv']['ship']['quaternion]);*/
        var lookDir = new JsObject(context['THREE']['Vector3'], [_player.pos[0] + _player.lookDir[0], _player.pos[1] + _player.lookDir[1], _player.pos[2] + _player.lookDir[2]]);
        //var lookDir = new JsObject(context['THREE']['Vector3'], [_player.lookDir[0], _player.lookDir[1], _player.lookDir[2]]);
        //var lookDir = new JsObject(context['THREE']['Vector3'], [0, 0, 0]);

        // transform the -z vector, our look direction, by the quaternion
        /*quat.multiplyVector3(lookDir);*/

        _camera['position']['x'] = _player.pos[0];
        _camera['position']['y'] = _player.pos[1];
        _camera['position']['z'] = _player.pos[2];
        
        _playerGeom['position'].callMethod('set', [_player.pos[0], 2, _player.pos[2]]);
        
        //context['console'].callMethod('log', [_player.pos[0] + _player.lookDir[0]]);
        //context['console'].callMethod('log', [_player.pos[1] + _player.lookDir[1]]);
        //context['console'].callMethod('log', [_player.pos[2]]);
        //context['console'].callMethod('log', ["Done"]);
        //_camera.callMethod('lookAt', [[_player.pos[0] + _player.lookDir[0], _player.pos[1] + _player.lookDir[1], 10 + _player.lookDir[2]]]);
        _camera.callMethod('lookAt', [lookDir]);
        _camera['up']['x'] = _player.up[0];
        _camera['up']['y'] = _player.up[1];
        _camera['up']['z'] = _player.up[2];
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
    final double MOUSE_VEL_SCALE = 0.001;
    final double LOOK_VEL_SCALE = 0.0001;

    int _controlStyle;
    List _pos = [0, 20, 0];
    // velocity is used differently depending on control scheme
    List _vel = [0, 0, 0];
    bool _holding = false;
    List _lookDir = [0, 0, 0];
    List _lookDirDelta = [0, 0, 0];
    List _up = [0, 0, -1];
    List _mousePos = [0, 0];
    bool leftButton = false;
    bool upButton = false;
    bool downButton = false;
    bool rightButton = false;
    

    Player() {
        _pos = [0, 0, 0];
        BodyElement body = querySelector("body");

        body.onMouseUp.listen(handleMouseUp);
        body.onMouseDown.listen(handleMouseDown);
        body.onMouseMove.listen(handleMouseMove);
        body.onKeyDown.listen(handleKeyDown);
        body.onKeyUp.listen(handleKeyUp);
    }

    List get lookDir => _lookDir;
    List get pos => _pos;
    List get up => _up;

    void handleKeyDown(KeyboardEvent event) {
        switch (event.keyCode) {
            case KeyCode.A:
                // a
                leftButton = true;
                break;
            case KeyCode.W:
                // w
                upButton = true;
                break;
            case KeyCode.D:
                // d
                rightButton = true;
                break;
            case KeyCode.S:
                // s
                downButton = true;
                break;
            case KeyCode.SPACE:
                // space
                if (_controlStyle == 2 || _controlStyle == 4) {
                    _holding = true;
                }
                break;
            default:
        }
    }

    void handleKeyUp(KeyboardEvent event) {
        switch (event.keyCode) {
            case KeyCode.SPACE:
                // space
                if (_controlStyle == 2 || _controlStyle == 4) {
                    _holding = false;
                }
                break;
            case KeyCode.ONE:
                // 1
                context['console'].callMethod('log', ['Control one']);
                _controlStyle = 1;
                // position starts high
                _pos[0] = 0;
                _pos[1] = 20;
                _pos[2] = 0;
                // lookdir in 2D is straight down
                _lookDir[0] = 0;
                _lookDir[1] = 0;
                _lookDir[2] = 0;
                
                _vel[0] = 0;
                _vel[1] = 0;
                _vel[2] = 0;
                
                _up[0] = 0;
                _up[1] = 0;
                _up[2] = -1;
                break;
            case KeyCode.TWO:
                // 2
                context['console'].callMethod('log', ['Control two']);
                _controlStyle = 2;
                // lookdir in 2D is straight down
                _lookDir[0] = 0;
                _lookDir[1] = -1;
                _lookDir[2] = 0;
                
                _pos[0] = 0;
                _pos[1] = 20;
                _pos[2] = 0;
                
                _vel[0] = 0;
                _vel[1] = 0;
                _vel[2] = 0;
                
                _up[0] = 0;
                _up[1] = 0;
                _up[2] = -1;
                break;
            case KeyCode.THREE:
                // 3
                context['console'].callMethod('log', ['Control three']);
                _controlStyle = 3;
                // starting lookdir in mode 3 is straight ahead
                _lookDir[0] = 0;
                _lookDir[1] = 0;
                _lookDir[2] = -1;
                
                _pos[0] = 0;
                _pos[1] = 5;
                _pos[2] = 10;
                
                _vel[0] = 0;
                _vel[1] = 0;
                _vel[2] = 0;
                
                _up[0] = 0;
                _up[1] = 1;
                _up[2] = 0;
                break;
            case KeyCode.FOUR:
                context['console'].callMethod('log', ['Control four']);
                // 4
                _controlStyle = 4;
                // lookdir in 4 is always straight ahead
                _lookDir = _vel;
                break;
            case KeyCode.A:
                // a
                leftButton = false;
                break;
            case KeyCode.W:
                // w
                upButton = false;
                break;
            case KeyCode.D:
                // d
                rightButton = false;
                break;
            case KeyCode.S:
                // s
                downButton = false;
                break;
            default:
        }
    }

    void handleMouseMove(Event e) {
        // just saves the mouse position. This can then be used to update the player as needed
        _mousePos[0] = (e as MouseEvent).clientX;
        _mousePos[1] = (e as MouseEvent).clientY;
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
        switch (_controlStyle) {
            case 1:
                // calculate velocity from mouse position
                _vel[0] = _mousePos[0] - game.offset[0] - game.canvasSize[0]/2;
                _vel[2] = _mousePos[1] - game.offset[1] - game.canvasSize[1]/2;

                List normVel = normalize(_vel);
                _pos[0] += _vel[0] * MOUSE_VEL_SCALE;
                _pos[1] = 20;
                _pos[2] += _vel[2] * MOUSE_VEL_SCALE;

                _lookDir[0] = 0;
                _lookDir[1] = -1;
                _lookDir[2] = 0;
                break;
            case 2:
                _vel[0] = (leftButton) ? -1 : (rightButton) ? 1 : 0;
                _vel[2] = (upButton) ? -1 : (downButton) ? 1 : 0;
                List normVel = normalize(_vel);
                _pos[0] += normVel[0] * VEL_SCALE;
                _pos[1] = 20;
                _pos[2] += normVel[2] * VEL_SCALE;

                _lookDir[0] = 0;
                _lookDir[1] = -1;
                _lookDir[2] = 0;
                break;
            case 3:
                _vel[0] = (leftButton) ? -1 : (rightButton) ? 1 : 0;
                _vel[2] = (upButton) ? -1 : (downButton) ? 1 : 0;
              
                // calculate look dir from mouse position
                _lookDirDelta[0] = _mousePos[0] - game.offset[0] - game.canvasSize[0]/2;
                _lookDirDelta[1] = _mousePos[1] - game.offset[1] - game.canvasSize[1]/2;

                // first update position by moving relative to look dir
                List normVel = normalize(_vel);
                List moveDir = normalize([_lookDir[0], _lookDir[2]]); // only x and z

                // move parallel to the look dir (along camera z)
                _pos[0] += -normVel[2] * VEL_SCALE * moveDir[0];
                _pos[2] += -normVel[2] * VEL_SCALE * moveDir[1];

                // move perpendicularly to the look dir (along camera x)
                List orthoMoveDir = ortho(moveDir);
                _pos[0] += normVel[0] * VEL_SCALE * orthoMoveDir[0];
                _pos[1] = 2;
                _pos[2] += normVel[0] * VEL_SCALE * orthoMoveDir[1];

                // change the look dir
                // choose either x or y for the cross product based on lookDir
                var perpDir = [-_lookDir[2], 0, _lookDir[0]];
                
                var upVec = normalize(cross(perpDir, _lookDir));
                var rightVec = normalize(cross(_lookDir, upVec));

                // add the horizontal components
                _lookDir[0] += _lookDirDelta[0] * rightVec[0] * LOOK_VEL_SCALE;
                _lookDir[1] += _lookDirDelta[0] * rightVec[1] * LOOK_VEL_SCALE;
                _lookDir[2] += _lookDirDelta[0] * rightVec[2] * LOOK_VEL_SCALE;
                // add the vertical components
                _lookDir[0] += _lookDirDelta[1] * -upVec[0] * LOOK_VEL_SCALE;
                _lookDir[1] += _lookDirDelta[1] * -upVec[1] * LOOK_VEL_SCALE;
                _lookDir[2] += _lookDirDelta[1] * -upVec[2] * LOOK_VEL_SCALE;
                break;
            case 4:
                _vel[0] = (leftButton) ? -1 : (rightButton) ? 1 : 0;
                _vel[2] = (upButton) ? -1 : (downButton) ? 1 : 0;
                List normVel = normalize(_vel);
                _pos[0] += normVel[0] * VEL_SCALE;
                _pos[1] = 2;
                _pos[2] += normVel[2] * VEL_SCALE;
                _lookDir[0] = normVel[0];
                _lookDir[1] = 0;
                _lookDir[2] = normVel[2];
                break;
        }
    }
}

List normalize(List vec) {
    double len = length(vec);
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

double length(List vec) {
    double sum = 0.0;
    for (int i = 0; i < vec.length; i++) {
        sum += (vec[i] * vec[i]);
    }
    return sqrt(sum);
}

List getOffset(Element elem) {
    Element docElem = document.documentElement;
    final box = elem.getBoundingClientRect();
    return [(box.left + window.pageXOffset - docElem.clientLeft),
            (box.top  + window.pageYOffset - docElem.clientTop)];
}

List ortho(List vec) {
    // assumes 2D
    return [-vec[1], vec[0]];
}

List cross(var one, var two) {
    // calculate 3 2x2 determinates
    num iDet = one[1] * two[2] - one[2] * two[1];
    num jDet = -1 * (one[0] * two[2] - one[2] * two[0]);
    num kDet = one[0] * two[1] - one[1] * two[0];
    return [iDet, jDet, kDet];
}
