// Copyright (c) 2012-2014 Turbulenz Limited
/*global Observer: false*/
/*global debug: false*/
/*global TurbulenzEngine: false*/
;

;

;

;

;

//
// AssetCache
//
var AssetCache = (function () {
    function AssetCache() {
    }
    AssetCache.prototype.exists = function (key) {
        return this.cache.hasOwnProperty(key);
    };

    AssetCache.prototype.isLoading = function (key) {
        var cachedAsset = this.cache[key];
        if (cachedAsset) {
            return cachedAsset.isLoading;
        }
        return false;
    };

    AssetCache.prototype.get = function (key) {
        debug.assert(key, "Key is invalid");

        var cachedAsset = this.cache[key];
        if (cachedAsset) {
            cachedAsset.cacheHit = this.hitCounter;
            this.hitCounter += 1;
            return cachedAsset.asset;
        }
        return null;
    };

    AssetCache.prototype.request = function (key, params, callback) {
        debug.assert(key, "Key is invalid");

        var cachedAsset = this.cache[key];
        if (cachedAsset) {
            cachedAsset.cacheHit = this.hitCounter;
            this.hitCounter += 1;
            if (!callback) {
                return;
            }
            if (cachedAsset.isLoading) {
                cachedAsset.observer.subscribe(callback);
            } else {
                TurbulenzEngine.setTimeout(function requestCallbackFn() {
                    callback(key, cachedAsset.asset, params);
                }, 0);
            }
            return;
        }

        var cacheArray = this.cacheArray;
        var cacheArrayLength = cacheArray.length;

        if (cacheArrayLength >= this.maxCacheSize) {
            var cache = this.cache;
            var oldestCacheHit = this.hitCounter;
            var oldestKey = null;
            var oldestIndex;
            var i;

            for (i = 0; i < cacheArrayLength; i += 1) {
                if (cacheArray[i].cacheHit < oldestCacheHit) {
                    oldestCacheHit = cacheArray[i].cacheHit;
                    oldestIndex = i;
                }
            }

            cachedAsset = cacheArray[oldestIndex];
            oldestKey = cachedAsset.key;

            if (this.onDestroy && !cachedAsset.isLoading) {
                this.onDestroy(oldestKey, cachedAsset.asset);
            }
            delete cache[oldestKey];
            cachedAsset.cacheHit = this.hitCounter;
            cachedAsset.asset = null;
            cachedAsset.isLoading = true;
            cachedAsset.key = key;
            cachedAsset.observer = Observer.create();
            this.cache[key] = cachedAsset;
        } else {
            cachedAsset = this.cache[key] = cacheArray[cacheArrayLength] = {
                cacheHit: this.hitCounter,
                asset: null,
                isLoading: true,
                key: key,
                observer: Observer.create()
            };
        }
        this.hitCounter += 1;

        var that = this;
        var observer = cachedAsset.observer;
        if (callback) {
            observer.subscribe(callback);
        }
        this.onLoad(key, params, function onLoadedAssetFn(asset) {
            if (cachedAsset.key === key) {
                cachedAsset.cacheHit = that.hitCounter;
                cachedAsset.asset = asset;
                cachedAsset.isLoading = false;
                that.hitCounter += 1;

                cachedAsset.observer.notify(key, asset, params);
            } else {
                if (that.onDestroy) {
                    that.onDestroy(key, asset);
                }
                observer.notify(key, null, params);
            }
        });
    };

    AssetCache.create = // Constructor function
    function (cacheParams) {
        if (!cacheParams.onLoad) {
            return null;
        }

        var assetCache = new AssetCache();

        assetCache.maxCacheSize = cacheParams.size || 64;
        assetCache.onLoad = cacheParams.onLoad;
        assetCache.onDestroy = cacheParams.onDestroy;

        assetCache.hitCounter = 0;
        assetCache.cache = {};
        assetCache.cacheArray = [];

        return assetCache;
    };
    AssetCache.version = 2;
    return AssetCache;
})();
// Copyright (c) 2009-2013 Turbulenz Limited
/*global Utilities: false*/
var AssetTracker = (function () {
    function AssetTracker() {
    }
    AssetTracker.prototype.getLoadedCount = function () {
        return this.assetsLoadedCount;
    };

    AssetTracker.prototype.getLoadingProgress = function () {
        return this.loadingProgress;
    };

    AssetTracker.prototype.getNumberAssetsToLoad = function () {
        return this.numberAssetsToLoad;
    };

    AssetTracker.prototype.eventOnAssetLoadedCallback = function (event) {
        var numberAssetsToLoad = this.numberAssetsToLoad;

        this.assetsLoadedCount += 1;

        if (numberAssetsToLoad) {
            var progress = this.assetsLoadedCount / numberAssetsToLoad;

            this.loadingProgress = Math.max(this.loadingProgress, Math.min(progress, 1.0));
        }

        if (this.displayLog) {
            Utilities.log(event.name + " (Asset Number " + this.assetsLoadedCount + ") Progress : " + this.loadingProgress);
        }

        if (this.callback) {
            this.callback();
        }
    };

    AssetTracker.prototype.setCallback = function (callback) {
        this.callback = callback;
    };

    AssetTracker.prototype.setNumberAssetsToLoad = function (numberAssetsToLoad) {
        if ((numberAssetsToLoad) && (this.numberAssetsToLoad !== numberAssetsToLoad)) {
            this.numberAssetsToLoad = numberAssetsToLoad;

            var progress = this.assetsLoadedCount / numberAssetsToLoad;

            this.loadingProgress = Math.max(this.loadingProgress, Math.min(progress, 1.0));
        }

        if (this.callback) {
            this.callback();
        }
    };

    AssetTracker.create = // Constructor function
    function (numberAssetsToLoad, displayLog) {
        var f = new AssetTracker();

        f.assetsLoadedCount = 0;
        f.loadingProgress = 0;
        f.numberAssetsToLoad = 0;
        f.callback = null;
        f.displayLog = displayLog;

        if (numberAssetsToLoad) {
            f.numberAssetsToLoad = numberAssetsToLoad;
        }

        f.eventOnLoadHandler = function assetTrackerEventOnLoadHandlerFn(event) {
            f.eventOnAssetLoadedCallback(event);
        };

        return f;
    };
    AssetTracker.version = 1;
    return AssetTracker;
})();
// Copyright (c) 2009-2014 Turbulenz Limited
//
// Camera
//
var Camera = (function () {
    function Camera() {
        // updateProjectionMatrix(): void;
        // updateFrustumPlanes(): void;
        this.viewOffsetX = 0.0;
        this.viewOffsetY = 0.0;
        this.recipViewWindowX = 1.0 / 1.0;
        this.recipViewWindowY = 1.0 / 1.0;
        this.infinite = false;
        this.parallel = false;
        this.aspectRatio = 4.0 / 3.0;
        this.nearPlane = 1.0;
        this.farPlane = 1000.0;
    }
    Camera.prototype.lookAt = function (lookAt, up, eyePosition) {
        var md = this.md;
        var v3Normalize = md.v3Normalize;
        var v3Cross = md.v3Cross;
        var zaxis = md.v3Sub(eyePosition, lookAt);

        v3Normalize.call(md, zaxis, zaxis);
        var xaxis = v3Cross.call(md, v3Normalize.call(md, up, up), zaxis);
        v3Normalize.call(md, xaxis, xaxis);
        var yaxis = v3Cross.call(md, zaxis, xaxis);
        this.matrix = md.m43Build(xaxis, yaxis, zaxis, eyePosition, this.matrix);
    };

    Camera.prototype.updateProjectionMatrix = function () {
        var rcpvwX = this.recipViewWindowX;
        var rcpvwY = this.recipViewWindowY * this.aspectRatio;
        var shearX = rcpvwX * this.viewOffsetX;
        var shearY = rcpvwY * this.viewOffsetY;
        var far = this.farPlane;
        var near = this.nearPlane;

        var rcpfn;
        if (far !== near) {
            rcpfn = (1.0 / (far - near));
        } else {
            rcpfn = 0.0;
        }

        var z0, z1, w0, w1;
        if (this.parallel) {
            z0 = -2.0 * rcpfn;
            w0 = (-(far + near) * rcpfn);
            z1 = 0.0;
            w1 = 1.0;
        } else {
            if (this.infinite) {
                z0 = -1.0;
            } else {
                z0 = (-(far + near) * rcpfn);
                //z0 = (far * rcpfn);
            }

            w0 = -(2.0 * far * near * rcpfn);

            //w0 = (-z0 * near);
            z1 = -1.0;
            w1 = 0.0;
        }

        this.projectionMatrix = this.md.m44Build(rcpvwX, 0.0, 0.0, 0.0, 0.0, rcpvwY, 0.0, 0.0, -shearX, -shearY, z0, z1, 0.0, 0.0, w0, w1, this.projectionMatrix);
    };

    Camera.prototype.updateViewMatrix = function () {
        var md = this.md;
        this.viewMatrix = md.m43InverseOrthonormal(this.matrix, this.viewMatrix);
    };

    Camera.prototype.updateViewProjectionMatrix = function () {
        var md = this.md;
        this.viewProjectionMatrix = md.m43MulM44(this.viewMatrix, this.projectionMatrix, this.viewProjectionMatrix);
    };

    Camera.prototype.extractFrustumPlanes = function (m, p) {
        var md = this.md;
        var m0 = m[0];
        var m1 = m[1];
        var m2 = m[2];
        var m3 = m[3];
        var m4 = m[4];
        var m5 = m[5];
        var m6 = m[6];
        var m7 = m[7];
        var m8 = m[8];
        var m9 = m[9];
        var m10 = m[10];
        var m11 = m[11];
        var m12 = m[12];
        var m13 = m[13];
        var m14 = m[14];
        var m15 = m[15];
        var planes = (p || []);

        // Negate 'd' here to avoid doing it on the isVisible functions
        var vec = md.v4Build((m3 + m0), (m7 + m4), (m11 + m8), -(m15 + m12));
        planes[0] = md.planeNormalize(vec, planes[0]);

        md.v4Build((m3 - m0), (m7 - m4), (m11 - m8), -(m15 - m12), vec);
        planes[1] = md.planeNormalize(vec, planes[1]);

        md.v4Build((m3 - m1), (m7 - m5), (m11 - m9), -(m15 - m13), vec);
        planes[2] = md.planeNormalize(vec, planes[2]);

        md.v4Build((m3 + m1), (m7 + m5), (m11 + m9), -(m15 + m13), vec);
        planes[3] = md.planeNormalize(vec, planes[3]);

        md.v4Build((m3 + m2), (m7 + m6), (m11 + m10), -(m15 + m14), vec);
        planes[4] = md.planeNormalize(vec, planes[4]);

        md.v4Build((m3 - m2), (m7 - m6), (m11 - m10), -(m15 - m14), vec);
        planes[5] = md.planeNormalize(vec, planes[5]);

        return planes;
    };

    Camera.prototype.updateFrustumPlanes = function () {
        this.frustumPlanes = this.extractFrustumPlanes(this.viewProjectionMatrix, this.frustumPlanes);
    };

    Camera.prototype.isVisiblePoint = function (p) {
        var md = this.md;
        return md.isInsidePlanesPoint(p, this.frustumPlanes);
    };

    Camera.prototype.isVisibleSphere = function (c, r) {
        var md = this.md;
        return md.isInsidePlanesSphere(c, r, this.frustumPlanes);
    };

    Camera.prototype.isVisibleBox = function (c, h) {
        var md = this.md;
        return md.isInsidePlanesBox(c, h, this.frustumPlanes);
    };

    Camera.prototype.isVisibleAABB = function (extents) {
        var md = this.md;
        return md.aabbIsInsidePlanes(extents, this.frustumPlanes);
    };

    Camera.prototype.isFullyInsideAABB = function (extents) {
        var md = this.md;
        return md.aabbIsFullyInsidePlanes(extents, this.frustumPlanes);
    };

    Camera.prototype.getFrustumPoints = function (farPlane, nearPlane, points) {
        var md = this.md;
        var viewOffsetX = this.viewOffsetX;
        var viewOffsetY = this.viewOffsetY;

        var viewWindowX = 1.0 / this.recipViewWindowX;
        var viewWindowY = 1.0 / (this.recipViewWindowY * this.aspectRatio);

        var transform = this.matrix;

        var farClip = farPlane || this.farPlane;
        var nearClip = (nearPlane !== undefined ? nearPlane : this.nearPlane);

        var frustumPoints = points || new Array(8);

        if (!this.parallel) {
            var co0 = ((transform[0] * viewOffsetX) + (transform[3] * viewOffsetY));
            var co1 = ((transform[1] * viewOffsetX) + (transform[4] * viewOffsetY));
            var co2 = ((transform[2] * viewOffsetX) + (transform[5] * viewOffsetY));

            var right0 = (transform[0] * viewWindowX);
            var right1 = (transform[1] * viewWindowX);
            var right2 = (transform[2] * viewWindowX);
            var up0 = (transform[3] * viewWindowY);
            var up1 = (transform[4] * viewWindowY);
            var up2 = (transform[5] * viewWindowY);
            var at0 = (co0 - transform[6]);
            var at1 = (co1 - transform[7]);
            var at2 = (co2 - transform[8]);
            var pos0 = (transform[9] + co0);
            var pos1 = (transform[10] + co1);
            var pos2 = (transform[11] + co2);

            var dirTR0 = (at0 + right0 + up0);
            var dirTR1 = (at1 + right1 + up1);
            var dirTR2 = (at2 + right2 + up2);
            var dirTL0 = (at0 - right0 + up0);
            var dirTL1 = (at1 - right1 + up1);
            var dirTL2 = (at2 - right2 + up2);
            var dirBL0 = (at0 - right0 - up0);
            var dirBL1 = (at1 - right1 - up1);
            var dirBL2 = (at2 - right2 - up2);
            var dirBR0 = (at0 + right0 - up0);
            var dirBR1 = (at1 + right1 - up1);
            var dirBR2 = (at2 + right2 - up2);

            /* tslint:disable:max-line-length */
            frustumPoints[0] = md.v3Build((pos0 + (dirTR0 * nearClip)), (pos1 + (dirTR1 * nearClip)), (pos2 + (dirTR2 * nearClip)), frustumPoints[0]);
            frustumPoints[1] = md.v3Build((pos0 + (dirTL0 * nearClip)), (pos1 + (dirTL1 * nearClip)), (pos2 + (dirTL2 * nearClip)), frustumPoints[1]);
            frustumPoints[2] = md.v3Build((pos0 + (dirBL0 * nearClip)), (pos1 + (dirBL1 * nearClip)), (pos2 + (dirBL2 * nearClip)), frustumPoints[2]);
            frustumPoints[3] = md.v3Build((pos0 + (dirBR0 * nearClip)), (pos1 + (dirBR1 * nearClip)), (pos2 + (dirBR2 * nearClip)), frustumPoints[3]);
            frustumPoints[4] = md.v3Build((pos0 + (dirTR0 * farClip)), (pos1 + (dirTR1 * farClip)), (pos2 + (dirTR2 * farClip)), frustumPoints[4]);
            frustumPoints[5] = md.v3Build((pos0 + (dirTL0 * farClip)), (pos1 + (dirTL1 * farClip)), (pos2 + (dirTL2 * farClip)), frustumPoints[5]);
            frustumPoints[6] = md.v3Build((pos0 + (dirBL0 * farClip)), (pos1 + (dirBL1 * farClip)), (pos2 + (dirBL2 * farClip)), frustumPoints[6]);
            frustumPoints[7] = md.v3Build((pos0 + (dirBR0 * farClip)), (pos1 + (dirBR1 * farClip)), (pos2 + (dirBR2 * farClip)), frustumPoints[7]);
            /* tslint:enable:max-line-length */
        } else {
            var noffsetx = (1.0 - nearClip) * viewOffsetX;
            var foffsetx = (1.0 - farClip) * viewOffsetX;
            var noffsety = (1.0 - nearClip) * viewOffsetY;
            var foffsety = (1.0 - farClip) * viewOffsetY;

            /* tslint:disable:max-line-length */
            frustumPoints[0] = md.v3Build((viewWindowX + noffsetx), (viewWindowY + noffsety), nearClip, frustumPoints[0]);
            frustumPoints[1] = md.v3Build((noffsetx - viewWindowX), (viewWindowY + noffsety), nearClip, frustumPoints[1]);
            frustumPoints[2] = md.v3Build((noffsetx - viewWindowX), (noffsety - viewWindowY), nearClip, frustumPoints[2]);
            frustumPoints[3] = md.v3Build((viewWindowX + noffsetx), (noffsety - viewWindowY), nearClip, frustumPoints[3]);
            frustumPoints[4] = md.v3Build((viewWindowX + foffsetx), (viewWindowY + foffsety), farClip, frustumPoints[4]);
            frustumPoints[5] = md.v3Build((foffsetx - viewWindowX), (viewWindowY + foffsety), farClip, frustumPoints[5]);
            frustumPoints[6] = md.v3Build((foffsetx - viewWindowX), (foffsety - viewWindowY), farClip, frustumPoints[6]);
            frustumPoints[7] = md.v3Build((viewWindowX + foffsetx), (foffsety - viewWindowY), farClip, frustumPoints[7]);

            /* tslint:enable:max-line-length */
            md.m43TransformPoint(transform, frustumPoints[0], frustumPoints[0]);
            md.m43TransformPoint(transform, frustumPoints[1], frustumPoints[1]);
            md.m43TransformPoint(transform, frustumPoints[2], frustumPoints[2]);
            md.m43TransformPoint(transform, frustumPoints[3], frustumPoints[3]);
            md.m43TransformPoint(transform, frustumPoints[4], frustumPoints[4]);
            md.m43TransformPoint(transform, frustumPoints[5], frustumPoints[5]);
            md.m43TransformPoint(transform, frustumPoints[6], frustumPoints[6]);
            md.m43TransformPoint(transform, frustumPoints[7], frustumPoints[7]);
        }

        return frustumPoints;
    };

    Camera.prototype.getFrustumFarPoints = function (farPlane, points) {
        var md = this.md;
        var viewOffsetX = this.viewOffsetX;
        var viewOffsetY = this.viewOffsetY;
        var viewWindowX = 1.0 / this.recipViewWindowX;
        var viewWindowY = 1.0 / (this.recipViewWindowY * this.aspectRatio);
        var transform = this.matrix;
        var farClip = farPlane || this.farPlane;

        var frustumPoints = points || new Array(4);

        if (!this.parallel) {
            var t0 = transform[0];
            var t1 = transform[1];
            var t2 = transform[2];
            var t3 = transform[3];
            var t4 = transform[4];
            var t5 = transform[5];
            var t6 = transform[6];
            var t7 = transform[7];
            var t8 = transform[8];
            var t9 = transform[9];
            var t10 = transform[10];
            var t11 = transform[11];

            var co0 = ((t0 * viewOffsetX) + (t3 * viewOffsetY));
            var co1 = ((t1 * viewOffsetX) + (t4 * viewOffsetY));
            var co2 = ((t2 * viewOffsetX) + (t5 * viewOffsetY));

            var right0 = (t0 * viewWindowX);
            var right1 = (t1 * viewWindowX);
            var right2 = (t2 * viewWindowX);
            var up0 = (t3 * viewWindowY);
            var up1 = (t4 * viewWindowY);
            var up2 = (t5 * viewWindowY);
            var at0 = (co0 - t6);
            var at1 = (co1 - t7);
            var at2 = (co2 - t8);
            var pos0 = (t9 + co0);
            var pos1 = (t10 + co1);
            var pos2 = (t11 + co2);

            var dirTR0 = ((at0 + right0 + up0) * farClip);
            var dirTR1 = ((at1 + right1 + up1) * farClip);
            var dirTR2 = ((at2 + right2 + up2) * farClip);
            var dirTL0 = ((at0 - right0 + up0) * farClip);
            var dirTL1 = ((at1 - right1 + up1) * farClip);
            var dirTL2 = ((at2 - right2 + up2) * farClip);
            var dirBL0 = ((at0 - right0 - up0) * farClip);
            var dirBL1 = ((at1 - right1 - up1) * farClip);
            var dirBL2 = ((at2 - right2 - up2) * farClip);
            var dirBR0 = ((at0 + right0 - up0) * farClip);
            var dirBR1 = ((at1 + right1 - up1) * farClip);
            var dirBR2 = ((at2 + right2 - up2) * farClip);

            frustumPoints[0] = md.v3Build((pos0 + dirTR0), (pos1 + dirTR1), (pos2 + dirTR2), frustumPoints[0]);
            frustumPoints[1] = md.v3Build((pos0 + dirTL0), (pos1 + dirTL1), (pos2 + dirTL2), frustumPoints[1]);
            frustumPoints[2] = md.v3Build((pos0 + dirBL0), (pos1 + dirBL1), (pos2 + dirBL2), frustumPoints[2]);
            frustumPoints[3] = md.v3Build((pos0 + dirBR0), (pos1 + dirBR1), (pos2 + dirBR2), frustumPoints[3]);
        } else {
            var offsetX = (1.0 - farClip) * viewOffsetX;
            var offsetY = (1.0 - farClip) * viewOffsetY;
            frustumPoints[0] = md.v3Build((viewWindowX + offsetX), (viewWindowY + offsetY), farClip, frustumPoints[0]);
            frustumPoints[1] = md.v3Build((offsetX - viewWindowX), (viewWindowY + offsetY), farClip, frustumPoints[1]);
            frustumPoints[2] = md.v3Build((offsetX - viewWindowX), (offsetY - viewWindowY), farClip, frustumPoints[2]);
            frustumPoints[3] = md.v3Build((viewWindowX + offsetX), (offsetY - viewWindowY), farClip, frustumPoints[3]);
            md.m43TransformPoint(transform, frustumPoints[0], frustumPoints[0]);
            md.m43TransformPoint(transform, frustumPoints[1], frustumPoints[1]);
            md.m43TransformPoint(transform, frustumPoints[2], frustumPoints[2]);
            md.m43TransformPoint(transform, frustumPoints[3], frustumPoints[3]);
        }

        return frustumPoints;
    };

    Camera.prototype.getFrustumExtents = function (extents, farClip, nearClip) {
        var frustumPoints = this.getFrustumPoints(farClip, nearClip);
        var frustumPoint = frustumPoints[0];
        var min0 = frustumPoint[0];
        var min1 = frustumPoint[1];
        var min2 = frustumPoint[2];
        var max0 = min0;
        var max1 = min1;
        var max2 = min2;
        for (var i = 1; i < 8; i += 1) {
            frustumPoint = frustumPoints[i];
            var p0 = frustumPoint[0];
            var p1 = frustumPoint[1];
            var p2 = frustumPoint[2];
            if (min0 > p0) {
                min0 = p0;
            } else if (max0 < p0) {
                max0 = p0;
            }
            if (min1 > p1) {
                min1 = p1;
            } else if (max1 < p1) {
                max1 = p1;
            }
            if (min2 > p2) {
                min2 = p2;
            } else if (max2 < p2) {
                max2 = p2;
            }
        }
        extents[0] = min0;
        extents[1] = min1;
        extents[2] = min2;
        extents[3] = max0;
        extents[4] = max1;
        extents[5] = max2;
    };

    Camera.create = // Constructor function
    function (md) {
        var c = new Camera();
        c.md = md;
        c.matrix = md.m43BuildIdentity();
        c.viewMatrix = md.m43BuildIdentity();
        c.updateProjectionMatrix();
        c.viewProjectionMatrix = c.projectionMatrix.slice();
        c.frustumPlanes = [];
        c.updateFrustumPlanes();
        return c;
    };
    Camera.version = 1;
    return Camera;
})();

;

var CameraController = (function () {
    function CameraController() {
        /* tslint:enable:no-unused-variable */
        this.rotateSpeed = 2.0;
        this.maxSpeed = 1;
        this.mouseRotateFactor = 0.1;
    }
    CameraController.prototype.rotate = function (turn, pitch) {
        var degreestoradians = (Math.PI / 180.0);
        var md = this.md;
        var matrix = this.camera.matrix;
        var pos = md.m43Pos(matrix);
        md.m43SetPos(matrix, md.v3BuildZero());

        var rotate;
        if (pitch !== 0.0) {
            pitch *= this.rotateSpeed * degreestoradians;
            pitch *= this.mouseRotateFactor;

            var right = md.v3Normalize(md.m43Right(matrix));
            md.m43SetRight(matrix, right);

            rotate = md.m43FromAxisRotation(right, pitch);

            matrix = md.m43Mul(matrix, rotate);
        }

        if (turn !== 0.0) {
            turn *= this.rotateSpeed * degreestoradians;
            turn *= this.mouseRotateFactor;

            rotate = md.m43FromAxisRotation(md.v3BuildYAxis(), turn);

            matrix = md.m43Mul(matrix, rotate);
        }

        md.m43SetPos(matrix, pos);

        this.camera.matrix = matrix;
    };

    CameraController.prototype.translate = function (right, up, forward) {
        var md = this.md;
        var matrix = this.camera.matrix;
        var pos = md.m43Pos(matrix);
        var speed = this.maxSpeed;
        pos = md.v3Add4(pos, md.v3ScalarMul(md.m43Right(matrix), (speed * right)), md.v3ScalarMul(md.m43Up(matrix), (speed * up)), md.v3ScalarMul(md.m43At(matrix), -(speed * forward)));
        md.m43SetPos(matrix, pos);
    };

    CameraController.prototype.update = function () {
        var updateMatrix = false;

        if (this.turn !== 0.0 || this.pitch !== 0.0) {
            updateMatrix = true;

            this.rotate(this.turn, this.pitch);

            this.turn = 0.0;
            this.pitch = 0.0;
        }

        if (this.step > 0) {
            this.forward += this.step;
        } else if (this.step < 0) {
            this.backward -= this.step;
        }

        var right = ((this.right + this.padright) - (this.left + this.padleft));
        var up = this.up - this.down;
        var forward = ((this.forward + this.padforward) - (this.backward + this.padbackward));
        if (right !== 0.0 || up !== 0.0 || forward !== 0.0) {
            updateMatrix = true;

            this.translate(right, up, forward);

            if (this.step > 0) {
                this.forward -= this.step;
                this.step = 0.0;
            } else if (this.step < 0) {
                this.backward += this.step;
                this.step = 0.0;
            }
        }

        if (updateMatrix) {
            this.camera.updateViewMatrix();
        }
    };

    CameraController.create = function (gd, id, camera, log) {
        var c = new CameraController();

        c.md = camera.md;
        c.camera = camera;
        c.turn = 0.0;
        c.pitch = 0.0;
        c.right = 0.0;
        c.left = 0.0;
        c.up = 0.0;
        c.down = 0.0;
        c.forward = 0.0;
        c.backward = 0.0;
        c.step = 0.0;
        c.padright = 0.0;
        c.padleft = 0.0;
        c.padforward = 0.0;
        c.padbackward = 0.0;
        c.looktouch = {
            id: -1,
            originX: 0,
            originY: 0
        };
        c.movetouch = {
            id: -1,
            originX: 0,
            originY: 0
        };

        var keyCodes;

        if (id) {
            keyCodes = id.keyCodes;
        }

        // keyboard handling
        var onkeydownFn = function (keynum) {
            switch (keynum) {
                case keyCodes.A:
                case keyCodes.LEFT:
                case keyCodes.NUMPAD_4:
                    c.left = 1.0;
                    break;

                case keyCodes.D:
                case keyCodes.RIGHT:
                case keyCodes.NUMPAD_6:
                    c.right = 1.0;
                    break;

                case keyCodes.W:
                case keyCodes.UP:
                case keyCodes.NUMPAD_8:
                    c.forward = 1.0;
                    break;

                case keyCodes.S:
                case keyCodes.DOWN:
                case keyCodes.NUMPAD_2:
                    c.backward = 1.0;
                    break;

                case keyCodes.E:
                case keyCodes.NUMPAD_9:
                    c.up = 1.0;
                    break;

                case keyCodes.Q:
                case keyCodes.NUMPAD_7:
                    c.down = 1.0;
                    break;
            }
        };

        var onkeyupFn = function (keynum) {
            switch (keynum) {
                case keyCodes.A:
                case keyCodes.LEFT:
                case keyCodes.NUMPAD_4:
                    c.left = 0.0;
                    break;

                case keyCodes.D:
                case keyCodes.RIGHT:
                case keyCodes.NUMPAD_6:
                    c.right = 0.0;
                    break;

                case keyCodes.W:
                case keyCodes.UP:
                case keyCodes.NUMPAD_8:
                    c.forward = 0.0;
                    break;

                case keyCodes.S:
                case keyCodes.DOWN:
                case keyCodes.NUMPAD_2:
                    c.backward = 0.0;
                    break;

                case keyCodes.E:
                case keyCodes.NUMPAD_9:
                    c.up = 0.0;
                    break;

                case keyCodes.Q:
                case keyCodes.NUMPAD_7:
                    c.down = 0.0;
                    break;

                case keyCodes.RETURN:
                    gd.fullscreen = !gd.fullscreen;
                    break;
            }
        };

        if (log) {
            c.onkeydown = function onkeydownLogFn(keynum) {
                log.innerHTML += " KeyDown:&nbsp;" + keynum;
                onkeydownFn(keynum);
            };

            c.onkeyup = function onkeyupLogFn(keynum) {
                if (keynum === keyCodes.BACKSPACE) {
                    log.innerHTML = "";
                } else {
                    log.innerHTML += " KeyUp:&nbsp;" + keynum;
                }
                onkeyupFn(keynum);
            };
        } else {
            c.onkeydown = onkeydownFn;
            c.onkeyup = onkeyupFn;
        }

        // Mouse handling
        c.onmouseup = function onmouseupFn(/* button, x, y */ ) {
            if (!id.isLocked()) {
                id.lockMouse();
            }
        };

        c.onmousewheel = function onmousewheelFn(delta) {
            c.step = delta * 5;
        };

        c.onmousemove = function onmousemoveFn(deltaX, deltaY) {
            c.turn += deltaX;
            c.pitch += deltaY;
        };

        // Pad handling
        c.onpadmove = function onpadmoveFn(lX, lY, lZ, rX, rY/*, rZ, dpadState */ ) {
            c.turn += lX * 10.0;
            c.pitch += lY * 10.0;

            if (rX >= 0) {
                c.padright = rX;
                c.padleft = 0;
            } else {
                c.padright = 0;
                c.padleft = -rX;
            }

            if (rY >= 0) {
                c.padforward = rY;
                c.padbackward = 0.0;
            } else {
                c.padforward = 0.0;
                c.padbackward = -rY;
            }
        };

        c.onmouselocklost = function onmouselocklostFn() {
            id.unlockMouse();
        };

        c.ontouchstart = function ontouchstartFn(touchEvent) {
            var changedTouches = touchEvent.changedTouches;
            var numTouches = changedTouches.length;
            var t;
            var halfScreenWidth = gd.width * 0.5;
            for (t = 0; t < numTouches; t += 1) {
                var touchId = changedTouches[t].identifier;
                var touchX = changedTouches[t].positionX;
                var touchY = changedTouches[t].positionY;
                if (touchX < halfScreenWidth && c.looktouch.id === -1) {
                    c.looktouch.id = touchId;
                    c.looktouch.originX = touchX;
                    c.looktouch.originY = touchY;
                } else if (touchX >= halfScreenWidth && c.movetouch.id === -1) {
                    c.movetouch.id = touchId;
                    c.movetouch.originX = touchX;
                    c.movetouch.originY = touchY;
                }
            }
        };

        c.ontouchend = function ontouchendFn(touchEvent) {
            var changedTouches = touchEvent.changedTouches;
            var numTouches = changedTouches.length;
            var t;
            for (t = 0; t < numTouches; t += 1) {
                var touchId = changedTouches[t].identifier;
                if (c.looktouch.id === touchId) {
                    c.looktouch.id = -1;
                    c.looktouch.originX = 0;
                    c.looktouch.originY = 0;
                    c.turn = 0;
                    c.pitch = 0;
                } else if (c.movetouch.id === touchId) {
                    c.movetouch.id = -1;
                    c.movetouch.originX = 0;
                    c.movetouch.originY = 0;
                    c.left = 0.0;
                    c.right = 0.0;
                    c.forward = 0.0;
                    c.backward = 0.0;
                }
            }
        };

        c.ontouchmove = function ontouchmoveFn(touchEvent) {
            var changedTouches = touchEvent.changedTouches;
            var numTouches = changedTouches.length;
            var deadzone = 16.0;
            var t;
            for (t = 0; t < numTouches; t += 1) {
                var touchId = changedTouches[t].identifier;
                var touchX = changedTouches[t].positionX;
                var touchY = changedTouches[t].positionY;
                if (c.looktouch.id === touchId) {
                    if (touchX - c.looktouch.originX > deadzone || touchX - c.looktouch.originX < -deadzone) {
                        c.turn = (touchX - c.looktouch.originX) / deadzone;
                    } else {
                        c.turn = 0.0;
                    }
                    if (touchY - c.looktouch.originY > deadzone || touchY - c.looktouch.originY < -deadzone) {
                        c.pitch = (touchY - c.looktouch.originY) / 16.0;
                    } else {
                        c.pitch = 0.0;
                    }
                } else if (c.movetouch.id === touchId) {
                    if (touchX - c.movetouch.originX > deadzone) {
                        c.left = 0.0;
                        c.right = 1.0;
                    } else if (touchX - c.movetouch.originX < -deadzone) {
                        c.left = 1.0;
                        c.right = 0.0;
                    } else {
                        c.left = 0.0;
                        c.right = 0.0;
                    }
                    if (touchY - c.movetouch.originY > deadzone) {
                        c.forward = 0.0;
                        c.backward = 1.0;
                    } else if (touchY - c.movetouch.originY < -deadzone) {
                        c.forward = 1.0;
                        c.backward = 0.0;
                    } else {
                        c.forward = 0.0;
                        c.backward = 0.0;
                    }
                }
            }
        };

        // Attach to an InputDevice
        c.attach = function attachFn(id) {
            id.addEventListener('keydown', c.onkeydown);
            id.addEventListener('keyup', c.onkeyup);
            id.addEventListener('mouseup', c.onmouseup);
            id.addEventListener('mousewheel', c.onmousewheel);
            id.addEventListener('mousemove', c.onmousemove);
            id.addEventListener('padmove', c.onpadmove);
            id.addEventListener('mouselocklost', c.onmouselocklost);
            id.addEventListener('touchstart', c.ontouchstart);
            id.addEventListener('touchend', c.ontouchend);
            id.addEventListener('touchmove', c.ontouchmove);
        };

        if (id) {
            c.attach(id);
        }

        return c;
    };
    CameraController.version = 1;
    return CameraController;
})();
// Copyright (c) 2009-2013 Turbulenz Limited
/*global TurbulenzEngine:false*/
/*global Profile:false*/
;

var CharacterController = (function () {
    function CharacterController() {
    }
    CharacterController.create = function (gd, id, pd, dynamicsWorld, matrix, params, log) {
        var c = new CharacterController();

        var md = TurbulenzEngine.getMathDevice();
        c.md = md;
        c.matrix = matrix.slice();
        c.turn = 0.0;
        c.pitch = 0.0;
        c.right = 0.0;
        c.left = 0.0;
        c.up = 0.0;
        c.forward = 0.0;
        c.backward = 0.0;
        c.padright = 0.0;
        c.padleft = 0.0;
        c.padforward = 0.0;
        c.padbackward = 0.0;
        c.looktouch = {
            id: -1,
            originX: 0,
            originY: 0
        };
        c.movetouch = {
            id: -1,
            originX: 0,
            originY: 0
        };
        c.step = 0.0;
        c.extents = md.aabbBuildEmpty();

        //
        // Character creation
        //
        var radius = 16;
        var height = 74;
        var crouchheight = 38;
        c.radius = radius;
        c.halfHeight = (height / 2);
        c.crouchHalfHeight = (crouchheight / 2);
        c.rotateSpeed = 2.0;
        c.mouseRotateFactor = 0.1;
        c.collisionMargin = 0.30;
        c.maxSpeed = 160;
        c.speedModifier = 1;
        c.maxStepHeight = 8;
        c.maxJumpHeight = 48;
        c.jump = false;
        c.jumped = false;
        c.crouch = false;
        c.onGround = false;
        c.dead = false;
        c.god = false;

        if (params) {
            c.radius = params.radius || c.radius;
            c.halfHeight = params.halfHeight || c.halfHeight;
            c.crouchHalfHeight = params.crouchHalfHeight || c.crouchHalfHeight;
            c.rotateSpeed = params.rotateSpeed || c.rotateSpeed;
            c.mouseRotateFactor = params.mouseRotateFactor || c.mouseRotateFactor;
            c.collisionMargin = params.collisionMargin || c.collisionMargin;
            c.maxSpeed = params.maxSpeed || c.maxSpeed;
            c.maxStepHeight = params.maxStepHeight || c.maxStepHeight;
            c.maxJumpHeight = params.maxJumpHeight || c.maxJumpHeight;
        }

        var at = md.m43At(matrix);
        c.walkDirection = md.v3Normalize(md.v3Build(at[0], 0, at[2]));

        var physicsHeightOffset = md.v3Build(0, c.halfHeight, 0);
        c.physicsHeightOffset = physicsHeightOffset;
        c.physicsStandingHeightOffset = physicsHeightOffset;
        c.physicsCrouchingHeightOffset = md.v3Build(0, c.crouchHalfHeight, 0);
        c.deadHeightOffset = md.v3BuildZero();

        var physicsMatrix = matrix.slice();
        physicsMatrix[10] += c.halfHeight;
        c.updateExtents(md.m43Pos(physicsMatrix));

        c.character = pd.createCharacter({
            transform: physicsMatrix,
            mass: 100.0,
            radius: c.radius,
            height: (2 * c.halfHeight),
            crouchHeight: (2 * c.crouchHalfHeight),
            stepHeight: c.maxStepHeight,
            maxJumpHeight: c.maxJumpHeight,
            restitution: 0.1,
            friction: 0.7
        });

        dynamicsWorld.addCharacter(c.character);

        // keyboard handling
        var keyCodes, padCodes;
        if (id) {
            keyCodes = id.keyCodes;
            padCodes = id.padCodes;
        }

        var onkeydownFn = function onkeydownFnFn(keynum) {
            if (!c.dead) {
                switch (keynum) {
                    case keyCodes.A:
                    case keyCodes.LEFT:
                    case keyCodes.NUMPAD_4:
                        c.left = 1.0;
                        break;

                    case keyCodes.D:
                    case keyCodes.RIGHT:
                    case keyCodes.NUMPAD_6:
                        c.right = 1.0;
                        break;

                    case keyCodes.W:
                    case keyCodes.UP:
                    case keyCodes.NUMPAD_8:
                        c.forward = 1.0;
                        break;

                    case keyCodes.S:
                    case keyCodes.DOWN:
                    case keyCodes.NUMPAD_2:
                        c.backward = 1.0;
                        break;

                    case keyCodes.SPACE:
                        c.jump = true;
                        break;

                    case keyCodes.C:
                        c.crouch = true;
                        c.physicsHeightOffset = c.physicsCrouchingHeightOffset;
                        break;
                }
            }
        };

        var onkeyupFn = function onkeyupFnFn(keynum) {
            if (!c.dead) {
                switch (keynum) {
                    case keyCodes.A:
                    case keyCodes.LEFT:
                    case keyCodes.NUMPAD_4:
                        c.left = 0.0;
                        break;

                    case keyCodes.D:
                    case keyCodes.RIGHT:
                    case keyCodes.NUMPAD_6:
                        c.right = 0.0;
                        break;

                    case keyCodes.W:
                    case keyCodes.UP:
                    case keyCodes.NUMPAD_8:
                        c.forward = 0.0;
                        break;

                    case keyCodes.S:
                    case keyCodes.DOWN:
                    case keyCodes.NUMPAD_2:
                        c.backward = 0.0;
                        break;

                    case keyCodes.C:
                        c.crouch = false;
                        c.physicsHeightOffset = c.physicsStandingHeightOffset;
                        break;
                }
            }
            if (keynum === keyCodes.G) {
                c.god = !c.god;
                if (c.god) {
                    c.character.velocity = c.md.v3BuildZero();
                } else {
                    var characterPosition = c.md.m43Pos(c.matrix);
                    c.character.position = c.md.v3Add(characterPosition, c.physicsHeightOffset);
                }
            } else if (keynum === keyCodes.RETURN) {
                gd.fullscreen = !gd.fullscreen;
            }

            if (keynum === keyCodes.P && Profile) {
                Profile.reset();
            }
        };

        if (log) {
            c.onkeydown = function onkeydownLogFn(keynum) {
                log.innerHTML += " KeyDown:&nbsp;" + keynum;
                onkeydownFn(keynum);
            };

            c.onkeyup = function onkeyupLogFn(keynum) {
                if (keynum === keyCodes.BACKSPACE) {
                    log.innerHTML = "";
                } else {
                    log.innerHTML += " KeyUp:&nbsp;" + keynum;
                }
                onkeyupFn(keynum);
            };
        } else {
            c.onkeydown = onkeydownFn;
            c.onkeyup = onkeyupFn;
        }

        // Mouse handling
        c.onmousewheel = function onmousewheelFn(delta) {
            if (!c.dead) {
                if (delta !== 0.0) {
                    if (c.god) {
                        c.step = delta * 5;
                    }
                }
            }
        };

        c.onmousemove = function onmousemoveFn(deltaX, deltaY) {
            if (!c.dead) {
                c.turn += deltaX;
                c.pitch += deltaY;
            }
        };

        // Pad handling
        c.onpadmove = function onpadmoveFn(lX, lY, lZ, rX, rY/*, rZ, dpadState */ ) {
            if (!c.dead) {
                c.turn += rX * 15.0;
                c.pitch -= rY * 15.0;

                if (lX >= 0) {
                    c.padright = lX;
                    c.padleft = 0;
                } else {
                    c.padright = 0;
                    c.padleft = -lX;
                }

                if (lY >= 0) {
                    c.padforward = lY;
                    c.padbackward = 0.0;
                } else {
                    c.padforward = 0.0;
                    c.padbackward = -lY;
                }
            }
        };

        c.onpaddown = function onpaddownFn(buttonnum) {
            if (!c.dead) {
                if (buttonnum === padCodes.A) {
                    c.jump = true;
                } else if (buttonnum === padCodes.LEFT_THUMB) {
                    c.crouch = !c.crouch;
                    c.physicsHeightOffset = c.crouch ? c.physicsCrouchingHeightOffset : c.physicsStandingHeightOffset;
                }
            }
            if (buttonnum === padCodes.BACK) {
                c.god = !c.god;
                if (c.god) {
                    c.character.velocity = c.md.v3BuildZero();
                } else {
                    var characterPosition = c.md.m43Pos(c.matrix);
                    c.character.position = c.md.v3Add(characterPosition, c.physicsHeightOffset);
                }
            }
        };

        c.ontouchstart = function ontouchstartFn(touchEvent) {
            var changedTouches = touchEvent.changedTouches;
            var numTouches = changedTouches.length;
            var t;
            var halfScreenWidth = gd.width * 0.5;
            for (t = 0; t < numTouches; t += 1) {
                var touchId = changedTouches[t].identifier;
                var touchX = changedTouches[t].positionX;
                var touchY = changedTouches[t].positionY;
                if (touchX < halfScreenWidth && c.looktouch.id === -1) {
                    c.looktouch.id = touchId;
                    c.looktouch.originX = touchX;
                    c.looktouch.originY = touchY;
                } else if (touchX >= halfScreenWidth && c.movetouch.id === -1) {
                    c.movetouch.id = touchId;
                    c.movetouch.originX = touchX;
                    c.movetouch.originY = touchY;
                }
            }
        };

        c.ontouchend = function ontouchendFn(touchEvent) {
            var changedTouches = touchEvent.changedTouches;
            var numTouches = changedTouches.length;
            var t;
            for (t = 0; t < numTouches; t += 1) {
                var touchId = changedTouches[t].identifier;
                if (c.looktouch.id === touchId) {
                    c.looktouch.id = -1;
                    c.looktouch.originX = 0;
                    c.looktouch.originY = 0;
                    c.turn = 0;
                    c.pitch = 0;
                } else if (c.movetouch.id === touchId) {
                    c.movetouch.id = -1;
                    c.movetouch.originX = 0;
                    c.movetouch.originY = 0;
                    c.left = 0.0;
                    c.right = 0.0;
                    c.forward = 0.0;
                    c.backward = 0.0;
                }
            }
        };

        c.ontouchmove = function ontouchmoveFn(touchEvent) {
            var changedTouches = touchEvent.changedTouches;
            var numTouches = changedTouches.length;
            var deadzone = 16.0;
            var t;
            for (t = 0; t < numTouches; t += 1) {
                var touchId = changedTouches[t].identifier;
                var touchX = changedTouches[t].positionX;
                var touchY = changedTouches[t].positionY;
                if (c.looktouch.id === touchId) {
                    if (touchX - c.looktouch.originX > deadzone || touchX - c.looktouch.originX < -deadzone) {
                        c.turn = (touchX - c.looktouch.originX) / deadzone;
                    } else {
                        c.turn = 0.0;
                    }
                    if (touchY - c.looktouch.originY > deadzone || touchY - c.looktouch.originY < -deadzone) {
                        c.pitch = (touchY - c.looktouch.originY) / deadzone;
                    } else {
                        c.pitch = 0.0;
                    }
                } else if (c.movetouch.id === touchId) {
                    if (touchX - c.movetouch.originX > deadzone) {
                        c.left = 0.0;
                        c.right = 1.0;
                    } else if (touchX - c.movetouch.originX < -deadzone) {
                        c.left = 1.0;
                        c.right = 0.0;
                    } else {
                        c.left = 0.0;
                        c.right = 0.0;
                    }
                    if (touchY - c.movetouch.originY > deadzone) {
                        c.forward = 0.0;
                        c.backward = 1.0;
                    } else if (touchY - c.movetouch.originY < -deadzone) {
                        c.forward = 1.0;
                        c.backward = 0.0;
                    } else {
                        c.forward = 0.0;
                        c.backward = 0.0;
                    }
                }
            }
        };

        // Attach to an InputDevice
        c.attach = function attachFn(inputDevice) {
            inputDevice.addEventListener('keydown', c.onkeydown);
            inputDevice.addEventListener('keyup', c.onkeyup);
            inputDevice.addEventListener('mousewheel', c.onmousewheel);
            inputDevice.addEventListener('mousemove', c.onmousemove);
            inputDevice.addEventListener('padmove', c.onpadmove);
            inputDevice.addEventListener('paddown', c.onpaddown);
            inputDevice.addEventListener('touchstart', c.ontouchstart);
            inputDevice.addEventListener('touchend', c.ontouchend);
            inputDevice.addEventListener('touchmove', c.ontouchmove);
        };

        if (id) {
            c.attach(id);
        }

        return c;
    };

    CharacterController.prototype.rotate = function (turn, pitch) {
        var md = this.md;
        var degreestoradians = (Math.PI / 180.0);
        var mul = md.m43Mul;
        var axisRotation = md.m43FromAxisRotation;
        var matrix = this.matrix;
        var pos = md.m43Pos(matrix);
        md.m43SetPos(matrix, md.v3BuildZero());

        var rotate;
        if (pitch !== 0.0) {
            pitch *= this.rotateSpeed * degreestoradians;
            pitch *= this.mouseRotateFactor;

            var right = md.v3Normalize(md.m43Right(matrix));
            md.m43SetRight(matrix, right);

            rotate = axisRotation.call(md, right, pitch);

            matrix = mul.call(md, matrix, rotate);
        }

        if (turn !== 0.0) {
            turn *= this.rotateSpeed * degreestoradians;
            turn *= this.mouseRotateFactor;

            rotate = axisRotation.call(md, md.v3BuildYAxis(), turn);

            this.walkDirection = md.m43TransformVector(rotate, this.walkDirection, this.walkDirection);

            matrix = mul.call(md, matrix, rotate);
        }

        md.m43SetPos(matrix, pos);

        this.matrix = matrix;
    };

    CharacterController.prototype.setPosition = function (position) {
        var md = this.md;
        var physicsPosition = md.v3Add(position, this.physicsHeightOffset);
        this.character.position = physicsPosition;
        this.updateExtents(physicsPosition);
        md.m43SetPos(this.matrix, position);
    };

    CharacterController.prototype.setDead = function (dead) {
        if (dead && !this.dead) {
            this.dead = true;
            this.crouch = false;
            this.jump = false;
            this.jumped = false;
            this.forward = 0.0;
            this.backward = 0.0;
            this.left = 0.0;
            this.right = 0.0;
            this.character.dead = true;
            this.physicsHeightOffset = this.deadHeightOffset;
        } else if (!dead && this.dead) {
            this.dead = false;
            this.crouch = false;
            this.character.dead = false;
            this.physicsHeightOffset = this.physicsStandingHeightOffset;
        }
    };

    CharacterController.prototype.updateExtents = function (position) {
        var radius = this.radius;
        var halfHeight = this.halfHeight;
        if (this.crouch) {
            halfHeight = this.crouchHalfHeight;
        } else if (this.dead) {
            halfHeight = this.radius;
        }
        var p0 = position[0];
        var p1 = position[1];
        var p2 = position[2];
        var extents = this.extents;
        extents[0] = (p0 - radius);
        extents[1] = (p1);
        extents[2] = (p2 - radius);
        extents[3] = (p0 + radius);
        extents[4] = (p1 + (halfHeight * 2));
        extents[5] = (p2 + radius);
    };

    CharacterController.prototype.update = function (deltaTime) {
        var md = this.md;
        var position;
        if (this.dead) {
            // If we're dead we ignore input and just update based on the physics changes
            var charPosition = this.character.position;
            position = md.v3Sub(charPosition, this.physicsHeightOffset);
            this.updateExtents(position);
            md.m43SetPos(this.matrix, position);
            this.turn = 0.0;
            this.pitch = 0.0;
            this.step = 0.0;
            return;
        }

        if (this.turn !== 0.0 || this.pitch !== 0.0) {
            this.rotate(this.turn, this.pitch);

            this.turn = 0.0;
            this.pitch = 0.0;
        }

        var step = this.step;
        if (step > 0) {
            this.forward += step;
        } else if (step < 0) {
            this.backward -= step;
        }

        var matrix = this.matrix;
        var character = this.character;
        var maxSpeed = this.maxSpeed;
        var right = ((this.right + this.padright) - (this.left + this.padleft));
        var forward = ((this.forward + this.padforward) - (this.backward + this.padbackward));

        if (this.god) {
            // Clamp character velocities at zero for when god mode is switched off
            character.velocity = md.v3BuildZero();
            position = md.m43Pos(matrix);

            var up = this.up;
            if (right !== 0.0 || up !== 0.0 || forward !== 0.0) {
                var muls = md.v3ScalarMul;
                var speed = (maxSpeed * deltaTime);
                position = md.v3Add4(muls.call(md, md.m43Right(matrix), (speed * right)), muls.call(md, md.m43Up(matrix), (speed * up)), muls.call(md, md.m43At(matrix), -(speed * forward)), position);

                this.updateExtents(position);
            }
            this.onGround = false;
        } else {
            var onGround = character.onGround;

            var oldVelocity = character.velocity;
            var oldVelocity0 = oldVelocity[0];
            var oldVelocity1 = oldVelocity[1];
            var oldVelocity2 = oldVelocity[2];

            if (right !== 0.0 || forward !== 0.0) {
                var walkAt = this.walkDirection;
                var walkAt0 = -walkAt[0];
                var walkAt2 = -walkAt[2];

                //var walkRight = this.md.v3Cross([0, 1, 0], walkAt);
                var walkRight0 = -walkAt2;
                var walkRight2 = walkAt0;

                if (this.crouch) {
                    maxSpeed *= 0.5;
                }

                maxSpeed *= this.speedModifier;

                var acceleration = (maxSpeed * deltaTime);
                if (onGround) {
                    acceleration *= 15.0;
                } else {
                    acceleration *= 1.18;
                }
                var newVelocity0 = (oldVelocity0 + (acceleration * (walkRight0 * right + walkAt0 * forward)));
                var newVelocity2 = (oldVelocity2 + (acceleration * (walkRight2 * right + walkAt2 * forward)));

                var velocityMagnitudeSq = ((newVelocity0 * newVelocity0) + (newVelocity2 * newVelocity2));
                if (velocityMagnitudeSq > (maxSpeed * maxSpeed)) {
                    var velocityClamp;
                    var oldVelocityMagnitudeSq = ((oldVelocity0 * oldVelocity0) + (oldVelocity2 * oldVelocity2));
                    if (oldVelocityMagnitudeSq < (maxSpeed * maxSpeed)) {
                        // If we weren't already above max walking speed then clamp the velocity to that
                        velocityClamp = maxSpeed / Math.sqrt(velocityMagnitudeSq);
                    } else {
                        // Otherwise make sure we don't increase the speed
                        velocityClamp = Math.sqrt(oldVelocityMagnitudeSq) / Math.sqrt(velocityMagnitudeSq);
                    }
                    newVelocity0 *= velocityClamp;
                    newVelocity2 *= velocityClamp;
                }

                character.velocity = md.v3Build(newVelocity0, oldVelocity1, newVelocity2);
            } else {
                if (onGround) {
                    var dampingScale = Math.pow((1.0 - 0.8), deltaTime);
                    character.velocity = md.v3Build(((Math.abs(oldVelocity0) < 0.01) ? 0.0 : (oldVelocity0 * dampingScale)), oldVelocity1, ((Math.abs(oldVelocity2) < 0.01) ? 0.0 : (oldVelocity2 * dampingScale)));
                }
            }

            character.crouch = this.crouch;

            if (this.jump && onGround) {
                this.jump = false;
                character.jump();
                this.jumped = true;
            } else {
                this.jumped = false;
            }

            this.onGround = onGround;

            var physicsPosition = character.position;
            position = md.v3Sub(physicsPosition, this.physicsHeightOffset);
            this.updateExtents(position);
        }

        if (step > 0) {
            this.forward -= step;
            this.step = 0.0;
        } else if (step < 0) {
            this.backward += step;
            this.step = 0.0;
        }

        md.m43SetPos(matrix, position);
    };
    CharacterController.version = 1;
    return CharacterController;
})();
// Copyright (c) 2010-2013 Turbulenz Limited
;

;

;

;

//
// IndexBufferManager
//
var IndexBufferManager = (function () {
    function IndexBufferManager() {
        this.maxIndicesPerIndexBuffer = 262144;
        this.numBuckets = 10;
    }
    //
    // bucket
    //
    IndexBufferManager.prototype.bucket = function (numIndices) {
        if (numIndices <= 64) {
            if (numIndices <= 16) {
                if (numIndices <= 8) {
                    return 0;
                }
                return 1;
            }

            if (numIndices <= 32) {
                return 2;
            }
            return 3;
        }

        if (numIndices <= 512) {
            if (numIndices <= 256) {
                if (numIndices <= 128) {
                    return 4;
                }
                return 5;
            }
            return 6;
        }

        if (numIndices <= 2048) {
            if (numIndices <= 1024) {
                return 7;
            }
            return 8;
        }
        return 9;
    };

    //
    // makeBuckets
    //
    IndexBufferManager.prototype.makeBuckets = function () {
        var result = [];

        for (var index = 0; index < this.numBuckets; index += 1) {
            result.push({ headChunk: null });
        }
        return result;
    };

    //
    // allocate
    //
    IndexBufferManager.prototype.allocate = function (numIndices, format) {
        var indexbuffer = null;
        var baseIndex = 0;

        if (typeof format === "string") {
            format = this.graphicsDevice['INDEXFORMAT_' + format];
        }

        var indexbufferParameters = {
            numIndices: undefined,
            format: format,
            dynamic: this.dynamicIndexBuffers
        };

        var poolIndex;
        var maxIndicesPerIndexBuffer = this.maxIndicesPerIndexBuffer;

        var numIndexBuffersPools = this.indexBuffersPools.length;
        var indexBuffersPool;

        for (poolIndex = 0; poolIndex < numIndexBuffersPools; poolIndex += 1) {
            if (this.indexBuffersPools[poolIndex].format === format) {
                indexBuffersPool = this.indexBuffersPools[poolIndex];
                break;
            }
        }

        if (!indexBuffersPool) {
            indexBuffersPool = {
                format: format,
                indexBufferData: []
            };
            this.indexBuffersPools.push(indexBuffersPool);
        }

        var indexBufferData;
        if (numIndices < maxIndicesPerIndexBuffer) {
            for (var bucketIndex = this.bucket(numIndices); !indexbuffer && bucketIndex < this.numBuckets; bucketIndex += 1) {
                var previousChunk;
                for (var indexBufferIndex = 0; !indexbuffer && (indexBufferIndex < indexBuffersPool.indexBufferData.length); indexBufferIndex += 1) {
                    indexBufferData = indexBuffersPool.indexBufferData[indexBufferIndex];

                    //Now find a to chunk allocate from
                    previousChunk = null;

                    for (var chunk = indexBufferData.bucket[bucketIndex].headChunk; chunk; chunk = chunk.nextChunk) {
                        if (numIndices <= chunk.length) {
                            indexbuffer = indexBufferData.indexBuffer;
                            baseIndex = chunk.baseIndex;
                            if (numIndices < chunk.length) {
                                chunk.baseIndex = (baseIndex + numIndices);
                                chunk.length -= numIndices;
                                var newBucketIndex = this.bucket(chunk.length);
                                if (newBucketIndex !== bucketIndex) {
                                    if (previousChunk) {
                                        previousChunk.nextChunk = chunk.nextChunk;
                                    } else {
                                        indexBufferData.bucket[bucketIndex].headChunk = chunk.nextChunk;
                                    }

                                    //Add to new bucket
                                    chunk.nextChunk = indexBufferData.bucket[newBucketIndex].headChunk;
                                    indexBufferData.bucket[newBucketIndex].headChunk = chunk;
                                }
                            } else {
                                if (previousChunk) {
                                    previousChunk.nextChunk = chunk.nextChunk;
                                } else {
                                    indexBufferData.bucket[bucketIndex].headChunk = chunk.nextChunk;
                                }
                                chunk.indexBuffer = null;
                            }
                            break;
                        }
                        previousChunk = chunk;
                    }
                }
            }

            if (!indexbuffer) {
                indexbufferParameters.numIndices = maxIndicesPerIndexBuffer;
                indexbuffer = this.graphicsDevice.createIndexBuffer(indexbufferParameters);
                this.debugCreatedIndexBuffers += 1;

                debug.assert(indexbuffer, "IndexBuffer not created.");

                if (indexbuffer) {
                    indexBufferData = {
                        indexBuffer: indexbuffer,
                        bucket: this.makeBuckets()
                    };

                    indexBufferData.bucket[this.bucket(maxIndicesPerIndexBuffer - numIndices)].headChunk = {
                        baseIndex: numIndices,
                        length: maxIndicesPerIndexBuffer - numIndices,
                        nextChunk: null
                    };

                    indexBuffersPool.indexBufferData.push(indexBufferData);
                }
            }
        }

        if (!indexbuffer) {
            indexbufferParameters.numIndices = numIndices;
            indexbuffer = this.graphicsDevice.createIndexBuffer(indexbufferParameters);
            this.debugCreatedIndexBuffers += 1;

            debug.assert(indexbuffer, "IndexBuffer not created.");

            if (indexbuffer) {
                indexBuffersPool.indexBufferData.push({
                    indexBuffer: indexbuffer,
                    bucket: this.makeBuckets()
                });
            }
        }

        return {
            indexBuffer: indexbuffer,
            baseIndex: baseIndex,
            length: numIndices,
            poolIndex: poolIndex
        };
    };

    //
    // free
    //
    IndexBufferManager.prototype.free = function (allocation) {
        var indexBuffersPool = this.indexBuffersPools[allocation.poolIndex];
        var indexBufferData;
        for (var indexBufferIndex = 0; indexBufferIndex < indexBuffersPool.indexBufferData.length; indexBufferIndex += 1) {
            if (allocation.indexBuffer === indexBuffersPool.indexBufferData[indexBufferIndex].indexBuffer) {
                indexBufferData = indexBuffersPool.indexBufferData[indexBufferIndex];
                break;
            }
        }

        //TODO: optimise
        var leftChunk;
        var leftChunkPrevious;
        var rightChunk;
        var rightChunkPrevious;
        var previous;
        for (var bucketIndex = 0; !(leftChunk && rightChunk) && (bucketIndex < this.numBuckets); bucketIndex += 1) {
            previous = null;
            for (var chunk = indexBufferData.bucket[bucketIndex].headChunk; chunk && !(leftChunk && rightChunk); chunk = chunk.nextChunk) {
                if (!leftChunk) {
                    if (chunk.baseIndex + chunk.length === allocation.baseIndex) {
                        leftChunk = chunk;
                        leftChunkPrevious = previous;
                    }
                }
                if (!rightChunk) {
                    if (chunk.baseIndex === allocation.baseIndex + allocation.length) {
                        rightChunk = chunk;
                        rightChunkPrevious = previous;
                    }
                }
                previous = chunk;
            }
        }

        var oldBucketIndex;
        var newBucketIndex;
        if (leftChunk && rightChunk) {
            oldBucketIndex = this.bucket(leftChunk.length);
            leftChunk.length += allocation.length + rightChunk.length;

            if (rightChunkPrevious) {
                rightChunkPrevious.nextChunk = rightChunk.nextChunk;
                if (rightChunk === leftChunkPrevious) {
                    leftChunkPrevious = rightChunkPrevious;
                }
            } else {
                indexBufferData.bucket[this.bucket(rightChunk.length)].headChunk = rightChunk.nextChunk;
                if (rightChunk === leftChunkPrevious) {
                    leftChunkPrevious = null;
                }
            }

            //move left if it needs to
            newBucketIndex = this.bucket(leftChunk.length);
            if (newBucketIndex !== oldBucketIndex) {
                if (leftChunkPrevious) {
                    leftChunkPrevious.nextChunk = leftChunk.nextChunk;
                } else {
                    indexBufferData.bucket[oldBucketIndex].headChunk = leftChunk.nextChunk;
                }

                //Add to new bucket
                leftChunk.nextChunk = indexBufferData.bucket[newBucketIndex].headChunk;
                indexBufferData.bucket[newBucketIndex].headChunk = leftChunk;
            }
        } else if (leftChunk) {
            oldBucketIndex = this.bucket(leftChunk.length);
            leftChunk.length += allocation.length;

            newBucketIndex = this.bucket(leftChunk.length);

            if (newBucketIndex !== oldBucketIndex) {
                if (leftChunkPrevious) {
                    leftChunkPrevious.nextChunk = leftChunk.nextChunk;
                } else {
                    indexBufferData.bucket[oldBucketIndex].headChunk = leftChunk.nextChunk;
                }

                //Add to new bucket
                leftChunk.nextChunk = indexBufferData.bucket[newBucketIndex].headChunk;
                indexBufferData.bucket[newBucketIndex].headChunk = leftChunk;
            }
        } else if (rightChunk) {
            oldBucketIndex = this.bucket(rightChunk.length);
            rightChunk.baseIndex = allocation.baseIndex;
            rightChunk.length += allocation.length;

            newBucketIndex = this.bucket(rightChunk.length);

            if (newBucketIndex !== oldBucketIndex) {
                if (rightChunkPrevious) {
                    rightChunkPrevious.nextChunk = rightChunk.nextChunk;
                } else {
                    indexBufferData.bucket[oldBucketIndex].headChunk = rightChunk.nextChunk;
                }

                //Add to new bucket
                rightChunk.nextChunk = indexBufferData.bucket[newBucketIndex].headChunk;
                indexBufferData.bucket[newBucketIndex].headChunk = rightChunk;
            }
        } else {
            var bucket = indexBufferData.bucket[this.bucket(allocation.length)];
            bucket.headChunk = {
                baseIndex: allocation.baseIndex,
                length: allocation.length,
                nextChunk: bucket.headChunk
            };
        }

        //See if the whole thing is free and if so free the VB
        var lastChunk = indexBufferData.bucket[this.numBuckets - 1].headChunk;
        if (lastChunk && lastChunk.length >= this.maxIndicesPerIndexBuffer) {
            indexBuffersPool.indexBufferData.splice(indexBufferIndex, 1);
            indexBufferData.indexBuffer.destroy();
            indexBufferData.indexBuffer = null;
            indexBufferData.bucket.length = 0;
            indexBufferData.bucket = null;
        }
    };

    //
    // destroy
    //
    IndexBufferManager.prototype.destroy = function () {
        var indexBuffersPools = this.indexBuffersPools;
        if (indexBuffersPools) {
            var numIndexBuffersPools = indexBuffersPools.length;
            var i, j;
            for (i = 0; i < numIndexBuffersPools; i += 1) {
                var indexBuffersPool = indexBuffersPools[i];

                var indexBufferDataArray = indexBuffersPool.indexBufferData;
                var numIndexBufferData = indexBufferDataArray.length;
                for (j = 0; j < numIndexBufferData; j += 1) {
                    var indexBufferData = indexBufferDataArray[j];

                    var bucketArray = indexBufferData.bucket;
                    if (bucketArray) {
                        bucketArray.length = 0;
                        indexBufferData.bucket = null;
                    }

                    var indexbuffer = indexBufferData.indexBuffer;
                    if (indexbuffer) {
                        indexbuffer.destroy();
                        indexBufferData.indexBuffer = null;
                    }
                }
                indexBufferDataArray.length = 0;
            }
            indexBuffersPools.length = 0;

            this.indexBuffersPools = null;
        }

        this.graphicsDevice = null;
    };

    IndexBufferManager.create = //
    // create
    //
    function (graphicsDevice, dynamicIndexBuffers) {
        var manager = new IndexBufferManager();

        manager.indexBuffersPools = [];
        manager.debugCreatedIndexBuffers = 0;
        manager.graphicsDevice = graphicsDevice;
        manager.dynamicIndexBuffers = dynamicIndexBuffers ? true : false;

        return manager;
    };
    IndexBufferManager.version = 1;
    return IndexBufferManager;
})();
// Copyright (c) 2009-2012 Turbulenz Limited
/*global Observer: false*/
/*global TurbulenzEngine: false*/
"use strict";
;
;

/**
@class  Sound manager
@private

@since TurbulenzEngine 0.1.0
*/
var SoundManager = (function () {
    function SoundManager() {
    }
    SoundManager.prototype.get = function (path) {
        debug.abort("this method should be overridden");
        return {};
    };

    SoundManager.beep = /**
    Generates beep sound data
    @return {array} returns an Array of numbers with the sample data
    */
    function (amplitude, frequency, wavefrequency, length) {
        var sin = Math.sin;
        var twoPI = (2.0 * Math.PI);
        var dphi = (twoPI * wavefrequency / frequency);
        var numSamples = (frequency * length);
        var data, phase, value;

        if (typeof Float32Array !== "undefined") {
            data = new Float32Array(numSamples);
        } else {
            data = new Array(numSamples);
        }

        phase = 0;
        for (var k = 0; k < numSamples; k += 1) {
            value = (sin(phase) * amplitude);

            phase += dphi;
            if (phase >= twoPI) {
                phase -= twoPI;
            }

            data[k] = value;
        }

        return data;
    };

    SoundManager.create = /**
    @constructs Constructs a SoundManager object.
    
    @return {SoundManager} object, null if failed
    */
    function (sd, rh, ds, errorCallback, log) {
        if (!errorCallback) {
            errorCallback = function (/* e */ ) {
            };
        }

        var defaultSoundName = "default";

        var defaultSound;
        if (ds) {
            defaultSound = ds;
        } else {
            var soundParams = {
                name: defaultSoundName,
                data: SoundManager.beep(1.0, 4000, 400, 1),
                channels: 1,
                frequency: 4000,
                uncompress: true,
                onload: function (s) {
                    defaultSound = s;
                }
            };

            if (!sd.createSound(soundParams)) {
                errorCallback("Default sound not created.");
            }
        }

        var sounds = {};
        var loadingSound = {};
        var loadedObservers = {};
        var numLoadingSounds = 0;
        var pathRemapping = null;
        var pathPrefix = "";

        sounds[defaultSoundName] = defaultSound;

        /**
        Loads a sound
        
        @memberOf SoundManager.prototype
        @public
        @function
        @name load
        
        @param {string} path Path to the sound file
        @param {boolean} uncompress Uncompress the sound for faster playback
        @param {function()} onSoundLoaded function called once the sound has loaded
        
        @return {Sound} object, returns the default sound if the file at given path is not yet loaded
        */
        var loadSound = function loadSoundFn(path, uncompress, onSoundLoaded) {
            var sound = sounds[path];
            if (!sound) {
                if (!loadingSound[path]) {
                    loadingSound[path] = true;
                    numLoadingSounds += 1;

                    var observer = Observer.create();
                    loadedObservers[path] = observer;
                    if (onSoundLoaded) {
                        observer.subscribe(onSoundLoaded);
                    }

                    var soundLoaded = function soundLoadedFn(sound/*, status */ ) {
                        if (sound) {
                            sounds[path] = sound;
                            observer.notify(sound);
                            delete loadedObservers[path];
                        } else {
                            delete sounds[path];
                        }
                        delete loadingSound[path];
                        numLoadingSounds -= 1;
                    };

                    var requestSound = function requestSoundFn(url, onload/*, callContext */ ) {
                        var sound = sd.createSound({
                            src: url,
                            uncompress: uncompress,
                            onload: onload
                        });
                        if (!sound) {
                            errorCallback("Sound '" + path + "' not created.");
                        }
                    };

                    rh.request({
                        src: ((pathRemapping && pathRemapping[path]) || (pathPrefix + path)),
                        requestFn: requestSound,
                        onload: soundLoaded
                    });
                } else if (onSoundLoaded) {
                    loadedObservers[path].subscribe(onSoundLoaded);
                }

                return defaultSound;
            } else if (onSoundLoaded) {
                // the callback should always be called asynchronously
                TurbulenzEngine.setTimeout(function soundAlreadyLoadedFn() {
                    onSoundLoaded(sound);
                }, 0);
            }
            return sound;
        };

        /**
        Alias one sound to another name
        
        @memberOf SoundManager.prototype
        @public
        @function
        @name map
        
        @param {string} dst Name of the alias
        @param {string} src Name of the sound to be aliased
        */
        var mapSound = function mapSoundFn(dst, src) {
            sounds[dst] = sounds[src];
        };

        /**
        Get sound created from a given sound file or with the given name
        
        @memberOf SoundManager.prototype
        @public
        @function
        @name get
        
        @param {string} path Path or name of the sound
        
        @return {Sound} object, returns the default sound if the sound is not yet loaded or the sound file didn't exist
        */
        var getSound = function getSoundFn(path) {
            var sound = sounds[path];
            if (!sound) {
                return defaultSound;
            }
            return sound;
        };

        /**
        Removes a sound from the manager
        
        @memberOf SoundManager.prototype
        @public
        @function
        @name remove
        
        @param {string} path Path or name of the sound
        */
        var removeSound = function removeSoundFn(path) {
            if (typeof sounds[path] !== 'undefined') {
                delete sounds[path];
            }
        };

        /**
        Reloads a sound
        
        @memberOf SoundManager.prototype
        @public
        @function
        @name reload
        
        @param {string} path Path or name of the sound
        */
        var reloadSound = function reloadSoundFn(path) {
            removeSound(path);
            loadSound(path);
        };

        var sm = new SoundManager();

        if (log) {
            sm.load = function loadSoundLogFn(path, uncompress) {
                log.innerHTML += "SoundManager.load:&nbsp;'" + path + "'";
                return loadSound(path, uncompress);
            };

            sm.map = function mapSoundLogFn(dst, src) {
                log.innerHTML += "SoundManager.map:&nbsp;'" + src + "' -> '" + dst + "'";
                mapSound(dst, src);
            };

            sm.get = function getSoundLogFn(path) {
                log.innerHTML += "SoundManager.get:&nbsp;'" + path + "'";
                return getSound(path);
            };

            sm.remove = function removeSoundLogFn(path) {
                log.innerHTML += "SoundManager.remove:&nbsp;'" + path + "'";
                removeSound(path);
            };

            sm.reload = function reloadSoundLogFn(path) {
                log.innerHTML += "SoundManager. reload:&nbsp;'" + path + "'";
                reloadSound(path);
            };
        } else {
            sm.load = loadSound;
            sm.map = mapSound;
            sm.get = getSound;
            sm.remove = removeSound;
            sm.reload = reloadSound;
        }

        /**
        Reloads all sounds
        
        @memberOf SoundManager.prototype
        @public
        @function
        @name reloadAll
        */
        sm.reloadAll = function reloadAllSoundsFn() {
            for (var t in sounds) {
                if (sounds.hasOwnProperty(t) && t !== defaultSoundName) {
                    reloadSound(t);
                }
            }
        };

        /**
        Get object containing all loaded sounds
        
        @memberOf SoundManager.prototype
        @public
        @function
        @name getAll
        
        @return {object}
        */
        sm.getAll = function getAllSoundsFn() {
            return sounds;
        };

        /**
        Get number of sounds pending
        
        @memberOf SoundManager.prototype
        @public
        @function
        @name getNumLoadingSounds
        
        @return {number}
        */
        sm.getNumPendingSounds = function getNumPendingSoundsFn() {
            return numLoadingSounds;
        };

        /**
        Check if a sound is not pending
        
        @memberOf SoundManager.prototype
        @public
        @function
        @name isSoundLoaded
        
        @param {string} path Path or name of the sound
        
        @return {boolean}
        */
        sm.isSoundLoaded = function isSoundLoadedFn(path) {
            return !loadingSound[path];
        };

        /**
        Check if a sound is missing
        
        @memberOf SoundManager.prototype
        @public
        @function
        @name isSoundMissing
        
        @param {string} path Path or name of the sound
        
        @return {boolean}
        */
        sm.isSoundMissing = function isSoundMissingFn(path) {
            return !sounds[path];
        };

        /**
        Set path remapping dictionary
        
        @memberOf SoundManager.prototype
        @public
        @function
        @name setPathRemapping
        
        @param {string} prm Path remapping dictionary
        @param {string} assetUrl Asset prefix for all assets loaded
        */
        sm.setPathRemapping = function setPathRemappingFn(prm, assetUrl) {
            pathRemapping = prm;
            pathPrefix = assetUrl;
        };

        sm.destroy = function shaderManagerDestroyFn() {
            if (sounds) {
                var p;
                for (p in sounds) {
                    if (sounds.hasOwnProperty(p)) {
                        var sound = sounds[p];
                        if (sound) {
                            sound.destroy();
                        }
                    }
                }
                sounds = null;
            }

            defaultSound = null;
            loadingSound = null;
            loadedObservers = null;
            numLoadingSounds = 0;
            pathRemapping = null;
            pathPrefix = null;
            rh = null;
            sd = null;
        };

        return sm;
    };
    SoundManager.version = 1;
    return SoundManager;
})();
// Copyright (c) 2009-2012 Turbulenz Limited
/*global Reference: false*/
/*global Observer: false*/
/*global TurbulenzEngine: false*/
"use strict";
var TextureInstance = (function () {
    function TextureInstance() {
    }
    //
    // setTexture
    //
    TextureInstance.prototype.setTexture = function (texture) {
        this.texture = texture;
        if (this.textureChangedObserver) {
            this.textureChangedObserver.notify(this);
        }
    };

    //
    // getTexture
    //
    TextureInstance.prototype.getTexture = function () {
        return this.texture;
    };

    //
    // subscribeTextureChanged
    //
    TextureInstance.prototype.subscribeTextureChanged = function (observerFunction) {
        if (!this.textureChangedObserver) {
            this.textureChangedObserver = Observer.create();
        }
        this.textureChangedObserver.subscribe(observerFunction);
    };

    //
    // usubscribeTextureChanged
    //
    TextureInstance.prototype.unsubscribeTextureChanged = function (observerFunction) {
        this.textureChangedObserver.unsubscribe(observerFunction);
    };

    //
    // destroy
    //
    TextureInstance.prototype.destroy = function () {
        if (this.texture.name !== "default") {
            this.texture.destroy();
        }
        delete this.texture;
        delete this.textureChangedObserver;
    };

    TextureInstance.create = //
    // TextureInstance.create
    //
    function (name, texture) {
        var textureInstance = new TextureInstance();
        textureInstance.name = name;
        textureInstance.texture = texture;
        textureInstance.reference = Reference.create(textureInstance);

        return textureInstance;
    };
    TextureInstance.version = 1;
    return TextureInstance;
})();

/**
@class  Texture manager
@private

@since TurbulenzEngine 0.1.0
*/
var TextureManager = (function () {
    function TextureManager() {
    }
    /**
    Adds external texture
    
    @memberOf TextureManager.prototype
    @public
    @function
    @name add
    
    @param {string} name Name of the texture
    @param {Texture} texture Texture
    */
    TextureManager.prototype.add = function (name, texture, internal) {
        var textureInstance = this.textureInstances[name];
        if (!textureInstance) {
            this.textureInstances[name] = TextureInstance.create(name, texture);
            this.textureInstances[name].reference.subscribeDestroyed(this.onTextureInstanceDestroyed);
        } else {
            textureInstance.setTexture(texture);
        }

        if (internal) {
            this.internalTexture[name] = true;
            this.textureInstances[name].reference.add();
        }
    };

    /**
    Get texture created from a given file or with the given name
    
    @memberOf TextureManager.prototype
    @public
    @function
    @name get
    
    @param {string} path Path or name of the texture
    
    @return {Texture} object, returns the default texture if the texture is not yet loaded or the file didn't exist
    */
    TextureManager.prototype.get = function (path) {
        var instance = this.textureInstances[path];
        if (!instance) {
            return this.defaultTexture;
        }
        return instance.getTexture();
    };

    //
    // getInstanceFn
    //
    TextureManager.prototype.getInstance = function (path) {
        return this.textureInstances[path];
    };

    /**
    Creates texture from an image file
    
    @memberOf TextureManager.prototype
    @public
    @function
    @name load
    
    @param {string} path Path to the image file
    @param {boolean} nomipmaps True to disable mipmaps
    @param {function()} onTextureLoaded function to call once the texture is loaded
    
    @return {Texture} object, returns the default Texture if the file at given path is not yet loaded
    */
    TextureManager.prototype.load = function (path, nomipmaps, onTextureLoaded) {
        var that = this;

        if (path === undefined) {
            this.errorCallback("Invalid texture path passed to TextureManager.Load");
        }
        var textureInstance = this.textureInstances[path];
        if (!textureInstance || (textureInstance.texture === this.defaultTexture && path !== "default")) {
            if (!textureInstance) {
                this.add(path, this.defaultTexture, false);
            }

            if (!(path in this.loadingTexture)) {
                if (0 === this.numLoadingArchives) {
                    this.loadingTexture[path] = true;
                    this.numLoadingTextures += 1;

                    var mipmaps = true;
                    if (nomipmaps) {
                        mipmaps = false;
                    }

                    var loadedObserver = Observer.create();
                    this.loadedTextureObservers[path] = loadedObserver;
                    if (onTextureLoaded) {
                        loadedObserver.subscribe(onTextureLoaded);
                    }

                    var textureLoaded = function textureLoadedFn(texture, status) {
                        if (status === 200 && texture) {
                            that.add(path, texture, false);
                        }

                        loadedObserver.notify(texture);
                        delete that.loadedTextureObservers[path];

                        //Missing textures are left with the previous, usually default, texture.
                        delete that.loadingTexture[path];
                        that.numLoadingTextures -= 1;
                    };

                    var textureRequest = function textureRequestFn(url, onload/*, callContext */ ) {
                        var texture = that.graphicsDevice.createTexture({
                            src: url,
                            mipmaps: mipmaps,
                            onload: onload
                        });
                        if (!texture) {
                            that.errorCallback("Texture '" + url + "' not created.");
                        }
                    };

                    this.requestHandler.request({
                        src: ((this.pathRemapping && this.pathRemapping[path]) || (this.pathPrefix + path)),
                        requestFn: textureRequest,
                        onload: textureLoaded
                    });
                } else {
                    this.delayedTextures[path] = {
                        nomipmaps: nomipmaps,
                        onload: onTextureLoaded
                    };

                    return this.get(path);
                }
            } else if (onTextureLoaded) {
                this.loadedTextureObservers[path].subscribe(onTextureLoaded);
            }

            return this.get(path);
        } else {
            var texture = this.get(path);
            if (onTextureLoaded) {
                // the callback should always be called asynchronously
                TurbulenzEngine.setTimeout(function textureAlreadyLoadedFn() {
                    onTextureLoaded(texture);
                }, 0);
            }
            return texture;
        }
    };

    /**
    Alias one texture to another name
    
    @memberOf TextureManager.prototype
    @public
    @function
    @name map
    
    @param {string} dst Name of the alias
    @param {string} src Name of the texture to be aliased
    */
    TextureManager.prototype.map = function (dst, src) {
        if (!this.textureInstances[dst]) {
            this.textureInstances[dst] = TextureInstance.create(dst, this.textureInstances[src].getTexture());
            this.textureInstances[dst].reference.subscribeDestroyed(this.onTextureInstanceDestroyed);
        } else {
            this.textureInstances[dst].setTexture(this.textureInstances[src].getTexture());
        }
        this.internalTexture[dst] = true;
    };

    /**
    Removes a texture from the manager
    
    @memberOf TextureManager.prototype
    @public
    @function
    @name remove
    
    @param {string} path Path or name of the texture
    */
    TextureManager.prototype.remove = function (path) {
        if (!this.internalTexture[path]) {
            if (path in this.textureInstances) {
                this.textureInstances[path].reference.unsubscribeDestroyed(this.onTextureInstanceDestroyed);
                delete this.textureInstances[path];
            }
        }
    };

    /**
    Loads a textures archive
    
    @memberOf TextureManager.prototype
    @public
    @function
    @name loadArchive
    
    @param {string} path Path to the archive file
    @param {boolean} nomipmaps True to disable mipmaps
    */
    TextureManager.prototype.loadArchive = function (path, nomipmaps, onTextureLoaded, onArchiveLoaded) {
        var that = this;
        var archive = this.archivesLoaded[path];
        if (!archive) {
            if (!(path in this.loadingArchives)) {
                var mipmaps = true;
                if (nomipmaps) {
                    mipmaps = false;
                }
                this.loadingArchives[path] = { textures: {} };
                this.numLoadingArchives += 1;

                var observer = Observer.create();
                this.loadedArchiveObservers[path] = observer;
                if (onArchiveLoaded) {
                    observer.subscribe(onArchiveLoaded);
                }

                var textureArchiveLoaded = function textureArchiveLoadedFn(success, status) {
                    var loadedArchive;
                    if (status === 200 && success) {
                        loadedArchive = { textures: that.loadingArchives[path].textures };
                        that.archivesLoaded[path] = loadedArchive;
                    }

                    observer.notify(loadedArchive);
                    delete that.loadedArchiveObservers[path];

                    delete that.loadingArchives[path];
                    that.numLoadingArchives -= 1;
                    if (0 === that.numLoadingArchives) {
                        var name;
                        for (name in that.delayedTextures) {
                            if (that.delayedTextures.hasOwnProperty(name)) {
                                var delayedTexture = that.delayedTextures[name];
                                that.load(name, delayedTexture.nomipmaps, delayedTexture.onload);
                            }
                        }
                        that.delayedTextures = {};
                    }
                };

                var requestTextureArchive = function requestTextureArchiveFn(url, onload) {
                    var ontextureload = function ontextureloadFn(texture) {
                        var name = texture.name;
                        if (!(name in that.textureInstances) || that.textureInstances[name].texture === that.defaultTexture) {
                            that.add(name, texture, false);
                            that.loadingArchives[path].textures[name] = texture;
                        }

                        if (onTextureLoaded) {
                            onTextureLoaded(texture);
                        }

                        delete that.delayedTextures[name];
                        if (path in that.loadingTexture) {
                            delete that.loadingTexture[path];
                            that.numLoadingTextures -= 1;
                        }
                    };

                    if (!that.graphicsDevice.loadTexturesArchive({
                        src: url,
                        mipmaps: mipmaps,
                        ontextureload: ontextureload,
                        onload: onload
                    })) {
                        that.errorCallback("Archive '" + path + "' not loaded.");
                    }
                };

                that.requestHandler.request({
                    src: ((that.pathRemapping && that.pathRemapping[path]) || (that.pathPrefix + path)),
                    requestFn: requestTextureArchive,
                    onload: textureArchiveLoaded
                });
            } else if (onTextureLoaded) {
                this.loadedArchiveObservers[path].subscribe(function textureArchiveLoadedFn() {
                    var archive = that.archivesLoaded[path];
                    var texturesInArchive = archive.textures;
                    var t;
                    for (t in texturesInArchive) {
                        if (texturesInArchive.hasOwnProperty(t)) {
                            // the texture has already been loaded so we call onload manaually
                            onTextureLoaded(texturesInArchive[t]);
                        }
                    }
                    if (onArchiveLoaded) {
                        onArchiveLoaded(archive);
                    }
                });
            }
        } else {
            if (onTextureLoaded) {
                var texturesInArchive = archive.textures;
                var numTexturesLoading = 0;

                var textureAlreadyLoadedWrapper = function textureAlreadyLoadedWrapper(texture) {
                    return function textureAlreadyLoadedFn() {
                        onTextureLoaded(texture);
                        numTexturesLoading -= 1;
                        if (numTexturesLoading === 0 && onArchiveLoaded) {
                            onArchiveLoaded(archive);
                        }
                    };
                };

                var t;
                for (t in texturesInArchive) {
                    if (texturesInArchive.hasOwnProperty(t)) {
                        numTexturesLoading += 1;

                        // the callback should always be called asynchronously
                        TurbulenzEngine.setTimeout(textureAlreadyLoadedWrapper(texturesInArchive[t]), 0);
                    }
                }
            }
        }
    };

    /**
    Check if an archive is not pending
    
    @memberOf TextureManager.prototype
    @public
    @function
    @name isArchiveLoaded
    
    @param {string} path Path or name of the archive
    
    @return {boolean}
    */
    TextureManager.prototype.isArchiveLoaded = function (path) {
        return path in this.archivesLoaded;
    };

    /**
    Removes a textures archive and all the textures it references.
    
    @memberOf TextureManager.prototype
    @public
    @function
    @name removeArchive
    
    @param {string} path Path of the archive file
    */
    TextureManager.prototype.removeArchive = function (path) {
        if (path in this.archivesLoaded) {
            var archiveTextures = this.archivesLoaded[path].textures;
            var texture;
            for (texture in archiveTextures) {
                if (archiveTextures.hasOwnProperty(texture)) {
                    this.remove(texture);
                }
            }
            delete this.archivesLoaded[path];
        }
    };

    /**
    Get object containing all loaded textures
    
    @memberOf TextureManager.prototype
    @public
    @function
    @name getAll
    
    @return {object}
    */
    TextureManager.prototype.getAll = function () {
        return this.textureInstances;
    };

    /**
    Get number of textures pending
    
    @memberOf TextureManager.prototype
    @public
    @function
    @name getNumLoadingTextures
    
    @return {number}
    */
    TextureManager.prototype.getNumPendingTextures = function () {
        return (this.numLoadingTextures + this.numLoadingArchives);
    };

    /**
    Check if a texture is not pending
    
    @memberOf TextureManager.prototype
    @public
    @function
    @name isTextureLoaded
    
    @param {string} path Path or name of the texture
    
    @return {boolean}
    */
    TextureManager.prototype.isTextureLoaded = function (path) {
        return (!(path in this.loadingTexture) && !(path in this.delayedTextures));
    };

    /**
    Check if a texture is missing
    
    @memberOf TextureManager.prototype
    @public
    @function
    @name isTextureMissing
    
    @param {string} path Path or name of the texture
    
    @return {boolean}
    */
    TextureManager.prototype.isTextureMissing = function (path) {
        return !(path in this.textureInstances);
    };

    /**
    Set path remapping dictionary
    
    @memberOf TextureManager.prototype
    @public
    @function
    @name setPathRemapping
    
    @param {string} prm Path remapping dictionary
    @param {string} assetUrl Asset prefix for all assets loaded
    */
    TextureManager.prototype.setPathRemapping = function (prm, assetUrl) {
        this.pathRemapping = prm;
        this.pathPrefix = assetUrl;
    };

    TextureManager.prototype.addProceduralTexture = function (params) {
        var name = params.name;
        var procTexture = this.graphicsDevice.createTexture(params);
        if (!procTexture) {
            this.errorCallback("Failed to create '" + name + "' texture.");
        } else {
            this.add(name, procTexture, true);
        }
    };

    TextureManager.prototype.destroy = function () {
        if (this.textureInstances) {
            var p;
            for (p in this.textureInstances) {
                if (this.textureInstances.hasOwnProperty(p)) {
                    var textureInstance = this.textureInstances[p];
                    if (textureInstance) {
                        textureInstance.destroy();
                    }
                }
            }
            this.textureInstances = null;
        }

        if (this.defaultTexture) {
            this.defaultTexture.destroy();
            this.defaultTexture = null;
        }

        this.loadingTexture = null;
        this.loadedTextureObservers = null;
        this.delayedTextures = null;
        this.numLoadingTextures = 0;
        this.archivesLoaded = null;
        this.loadingArchives = null;
        this.loadedArchiveObservers = null;
        this.numLoadingArchives = 0;
        this.internalTexture = null;
        this.pathRemapping = null;
        this.pathPrefix = null;
        this.requestHandler = null;
        this.graphicsDevice = null;
    };

    TextureManager.create = /**
    @constructs Constructs a TextureManager object.
    
    @param {GraphicsDevice} graphicsDevice Graphics device
    @param {Texture} dt Default texture
    @param {Element} log Logging element
    
    @return {TextureManager} object, null if failed
    */
    function (graphicsDevice, requestHandler, dt, errorCallback, log) {
        var textureManager = new TextureManager();

        if (!errorCallback) {
            errorCallback = function (/* e */ ) {
            };
        }

        var defaultTextureName = "default";

        var defaultTexture;
        if (dt) {
            defaultTexture = dt;
        } else {
            defaultTexture = graphicsDevice.createTexture({
                name: defaultTextureName,
                width: 2,
                height: 2,
                depth: 1,
                format: 'R8G8B8A8',
                cubemap: false,
                mipmaps: true,
                dynamic: false,
                data: [
                    255,
                    20,
                    147,
                    255,
                    255,
                    0,
                    0,
                    255,
                    255,
                    255,
                    255,
                    255,
                    255,
                    20,
                    147,
                    255
                ]
            });
            if (!defaultTexture) {
                errorCallback("Default texture not created.");
            }
        }

        textureManager.textureInstances = {};
        textureManager.loadingTexture = {};
        textureManager.loadedTextureObservers = {};
        textureManager.delayedTextures = {};
        textureManager.numLoadingTextures = 0;
        textureManager.archivesLoaded = {};
        textureManager.loadingArchives = {};
        textureManager.loadedArchiveObservers = {};
        textureManager.numLoadingArchives = 0;
        textureManager.internalTexture = {};
        textureManager.pathRemapping = null;
        textureManager.pathPrefix = "";

        textureManager.graphicsDevice = graphicsDevice;
        textureManager.requestHandler = requestHandler;
        textureManager.defaultTexture = defaultTexture;
        textureManager.errorCallback = errorCallback;

        //
        // onTextureInstanceDestroyed callback
        //
        var onTextureInstanceDestroyed = function onTextureInstanceDestroyedFn(textureInstance) {
            textureInstance.reference.unsubscribeDestroyed(onTextureInstanceDestroyed);
            delete textureManager.textureInstances[textureInstance.name];
        };
        textureManager.onTextureInstanceDestroyed = onTextureInstanceDestroyed;

        if (log) {
            textureManager.add = function addTextureLogFn(name, tex) {
                log.innerHTML += "TextureManager.add:&nbsp;'" + name + "'";
                return TextureManager.prototype.add.call(textureManager, name, tex);
            };

            textureManager.load = function loadTextureLogFn(path, nomipmaps) {
                log.innerHTML += "TextureManager.load:&nbsp;'" + path + "'";
                return TextureManager.prototype.load.call(textureManager, path, nomipmaps);
            };

            textureManager.loadArchive = function loadArchiveLogFn(path, nomipmaps) {
                log.innerHTML += "TextureManager.loadArchive:&nbsp;'" + path + "'";
                return TextureManager.prototype.loadArchive.call(textureManager, path, nomipmaps);
            };

            textureManager.isArchiveLoaded = function isArchiveLoadedLogFn(path) {
                log.innerHTML += "TextureManager.isArchiveLoaded:&nbsp;'" + path + "'";
                return TextureManager.prototype.isArchiveLoaded.call(textureManager, path);
            };

            textureManager.removeArchive = function removeArchiveLogFn(path) {
                log.innerHTML += "TextureManager.removeArchive:&nbsp;'" + path + "'";
                return TextureManager.prototype.removeArchive.call(textureManager, path);
            };

            textureManager.map = function mapTextureLogFn(dst, src) {
                log.innerHTML += "TextureManager.map:&nbsp;'" + src + "' -> '" + dst + "'";
                TextureManager.prototype.map.call(textureManager, dst, src);
            };

            textureManager.get = function getTextureLogFn(path) {
                log.innerHTML += "TextureManager.get:&nbsp;'" + path + "'";
                return TextureManager.prototype.get.call(textureManager, path);
            };

            textureManager.getInstance = function getTextureInstanceLogFn(path) {
                log.innerHTML += "TextureManager.getInstance:&nbsp;'" + path + "'";
                return TextureManager.prototype.getInstance.call(textureManager, path);
            };

            textureManager.remove = function removeTextureLogFn(path) {
                log.innerHTML += "TextureManager.remove:&nbsp;'" + path + "'";
                TextureManager.prototype.remove.call(textureManager, path);
            };
        }

        // Add procedural textures
        textureManager.add(defaultTextureName, defaultTexture, true);

        textureManager.addProceduralTexture({
            name: "white",
            width: 2,
            height: 2,
            depth: 1,
            format: 'R8G8B8A8',
            cubemap: false,
            mipmaps: true,
            dynamic: false,
            data: [
                255,
                255,
                255,
                255,
                255,
                255,
                255,
                255,
                255,
                255,
                255,
                255,
                255,
                255,
                255,
                255
            ]
        });

        textureManager.addProceduralTexture({
            name: "black",
            width: 2,
            height: 2,
            depth: 1,
            format: 'R8G8B8A8',
            cubemap: false,
            mipmaps: true,
            dynamic: false,
            data: [
                0,
                0,
                0,
                255,
                0,
                0,
                0,
                255,
                0,
                0,
                0,
                255,
                0,
                0,
                0,
                255
            ]
        });

        textureManager.addProceduralTexture({
            name: "flat",
            width: 2,
            height: 2,
            depth: 1,
            format: 'R8G8B8A8',
            cubemap: false,
            mipmaps: true,
            dynamic: false,
            data: [
                128,
                128,
                255,
                255,
                128,
                128,
                255,
                255,
                128,
                128,
                255,
                255,
                128,
                128,
                255,
                255
            ]
        });

        var abs = Math.abs;
        var x, y;
        var quadraticData = [];
        for (y = 0; y < 4; y += 1) {
            for (x = 0; x < 32; x += 1) {
                var s = ((x + 0.5) * (2.0 / 32.0) - 1.0);
                s = abs(s) - (1.0 / 32.0);
                var value = (1.0 - (s * 2.0) + (s * s));
                if (value <= 0) {
                    quadraticData.push(0);
                } else if (value >= 1) {
                    quadraticData.push(255);
                } else {
                    quadraticData.push(value * 255);
                }
            }
        }
        textureManager.addProceduralTexture({
            name: "quadratic",
            width: 32,
            height: 4,
            depth: 1,
            format: 'L8',
            cubemap: false,
            mipmaps: true,
            dynamic: false,
            data: quadraticData
        });
        quadraticData = null;

        var nofalloffData = [];
        for (y = 0; y < 4; y += 1) {
            nofalloffData.push(0);
            for (x = 1; x < 31; x += 1) {
                nofalloffData.push(255);
            }
            nofalloffData.push(0);
        }
        textureManager.addProceduralTexture({
            name: "nofalloff",
            width: 32,
            height: 4,
            depth: 1,
            format: 'L8',
            cubemap: false,
            mipmaps: true,
            dynamic: false,
            data: nofalloffData
        });
        nofalloffData = null;

        return textureManager;
    };
    TextureManager.version = 1;
    return TextureManager;
})();
// Copyright (c) 2010-2013 Turbulenz Limited
;

;

;

;

//
// VertexBufferManager
//
var VertexBufferManager = (function () {
    function VertexBufferManager() {
        this.maxVerticesPerVertexBuffer = 65535;
        this.numBuckets = 10;
    }
    //
    // bucket
    //
    VertexBufferManager.prototype.bucket = function (numVertices) {
        if (numVertices <= 64) {
            if (numVertices <= 16) {
                if (numVertices <= 8) {
                    return 0;
                }
                return 1;
            }

            if (numVertices <= 32) {
                return 2;
            }
            return 3;
        }

        if (numVertices <= 512) {
            if (numVertices <= 256) {
                if (numVertices <= 128) {
                    return 4;
                }
                return 5;
            }
            return 6;
        }

        if (numVertices <= 2048) {
            if (numVertices <= 1024) {
                return 7;
            }
            return 8;
        }
        return 9;
    };

    //
    // makeBuckets
    //
    VertexBufferManager.prototype.makeBuckets = function () {
        var result = [];

        for (var index = 0; index < this.numBuckets; index += 1) {
            result.push({ headChunk: null });
        }
        return result;
    };

    //
    // allocate
    //
    VertexBufferManager.prototype.allocate = function (numVertices, attributes) {
        var vertexbuffer = null;
        var baseIndex = 0;

        var vertexbufferParameters = {
            numVertices: undefined,
            attributes: attributes,
            dynamic: this.dynamicVertexBuffers
        };

        var poolIndex;
        var maxVerticesPerVertexBuffer = this.maxVerticesPerVertexBuffer;

        var attributesHash = '';
        var attributeIndex;
        var attribute;
        for (attributeIndex = 0; attributeIndex < attributes.length; attributeIndex += 1) {
            attribute = attributes[attributeIndex];
            if (attribute.name) {
                attributesHash += attribute.name;
            } else if (typeof attribute === "number") {
                attributesHash += attribute;
            } else {
                attributesHash += attribute.toString();
            }
            attributesHash += ',';
        }

        var numVertexBuffersPools = this.vertexBuffersPools.length;
        var vertexBuffersPool;

        for (poolIndex = 0; poolIndex < numVertexBuffersPools; poolIndex += 1) {
            if (this.vertexBuffersPools[poolIndex].attributesHash === attributesHash) {
                vertexBuffersPool = this.vertexBuffersPools[poolIndex];
                break;
            }
        }

        if (!vertexBuffersPool) {
            vertexBuffersPool = {
                attributesHash: attributesHash,
                vertexBufferData: []
            };
            this.vertexBuffersPools.push(vertexBuffersPool);
        }

        var vertexBufferData;
        if (numVertices < maxVerticesPerVertexBuffer) {
            for (var bucketIndex = this.bucket(numVertices); !vertexbuffer && bucketIndex < this.numBuckets; bucketIndex += 1) {
                var previousChunk;
                for (var vertexBufferIndex = 0; !vertexbuffer && (vertexBufferIndex < vertexBuffersPool.vertexBufferData.length); vertexBufferIndex += 1) {
                    vertexBufferData = vertexBuffersPool.vertexBufferData[vertexBufferIndex];

                    //Now find a to chunk allocate from
                    previousChunk = null;

                    for (var chunk = vertexBufferData.bucket[bucketIndex].headChunk; chunk; chunk = chunk.nextChunk) {
                        if (numVertices <= chunk.length) {
                            vertexbuffer = vertexBufferData.vertexBuffer;
                            baseIndex = chunk.baseIndex;
                            if (numVertices < chunk.length) {
                                chunk.baseIndex = (baseIndex + numVertices);
                                chunk.length -= numVertices;
                                var newBucketIndex = this.bucket(chunk.length);
                                if (newBucketIndex !== bucketIndex) {
                                    if (previousChunk) {
                                        previousChunk.nextChunk = chunk.nextChunk;
                                    } else {
                                        vertexBufferData.bucket[bucketIndex].headChunk = chunk.nextChunk;
                                    }

                                    //Add to new bucket
                                    chunk.nextChunk = vertexBufferData.bucket[newBucketIndex].headChunk;
                                    vertexBufferData.bucket[newBucketIndex].headChunk = chunk;
                                }
                            } else {
                                if (previousChunk) {
                                    previousChunk.nextChunk = chunk.nextChunk;
                                } else {
                                    vertexBufferData.bucket[bucketIndex].headChunk = chunk.nextChunk;
                                }
                                chunk.vertexBuffer = null;
                            }
                            break;
                        }
                        previousChunk = chunk;
                    }
                }
            }

            if (!vertexbuffer) {
                vertexbufferParameters.numVertices = maxVerticesPerVertexBuffer;
                vertexbuffer = this.graphicsDevice.createVertexBuffer(vertexbufferParameters);
                this.debugCreatedVertexBuffers += 1;

                debug.assert(vertexbuffer, "VertexBuffer not created.");

                if (vertexbuffer) {
                    vertexBufferData = {
                        vertexBuffer: vertexbuffer,
                        bucket: this.makeBuckets()
                    };

                    vertexBufferData.bucket[this.bucket(maxVerticesPerVertexBuffer - numVertices)].headChunk = {
                        baseIndex: numVertices,
                        length: maxVerticesPerVertexBuffer - numVertices,
                        nextChunk: null
                    };

                    vertexBuffersPool.vertexBufferData.push(vertexBufferData);
                }
            }
        }

        if (!vertexbuffer) {
            vertexbufferParameters.numVertices = numVertices;
            vertexbuffer = this.graphicsDevice.createVertexBuffer(vertexbufferParameters);
            this.debugCreatedVertexBuffers += 1;

            debug.assert(vertexbuffer, "VertexBuffer not created.");

            if (vertexbuffer) {
                vertexBuffersPool.vertexBufferData.push({
                    vertexBuffer: vertexbuffer,
                    bucket: this.makeBuckets()
                });
            }
        }

        return {
            vertexBuffer: vertexbuffer,
            baseIndex: baseIndex,
            length: numVertices,
            poolIndex: poolIndex
        };
    };

    //
    // free
    //
    VertexBufferManager.prototype.free = function (allocation) {
        var vertexBuffersPool = this.vertexBuffersPools[allocation.poolIndex];
        var vertexBufferData;
        for (var vertexBufferIndex = 0; vertexBufferIndex < vertexBuffersPool.vertexBufferData.length; vertexBufferIndex += 1) {
            if (allocation.vertexBuffer === vertexBuffersPool.vertexBufferData[vertexBufferIndex].vertexBuffer) {
                vertexBufferData = vertexBuffersPool.vertexBufferData[vertexBufferIndex];
                break;
            }
        }

        //TODO: optimise
        var leftChunk;
        var leftChunkPrevious;
        var rightChunk;
        var rightChunkPrevious;
        var previous;
        for (var bucketIndex = 0; !(leftChunk && rightChunk) && (bucketIndex < this.numBuckets); bucketIndex += 1) {
            previous = null;
            for (var chunk = vertexBufferData.bucket[bucketIndex].headChunk; chunk && !(leftChunk && rightChunk); chunk = chunk.nextChunk) {
                if (!leftChunk) {
                    if (chunk.baseIndex + chunk.length === allocation.baseIndex) {
                        leftChunk = chunk;
                        leftChunkPrevious = previous;
                    }
                }
                if (!rightChunk) {
                    if (chunk.baseIndex === allocation.baseIndex + allocation.length) {
                        rightChunk = chunk;
                        rightChunkPrevious = previous;
                    }
                }
                previous = chunk;
            }
        }

        var oldBucketIndex;
        var newBucketIndex;
        if (leftChunk && rightChunk) {
            oldBucketIndex = this.bucket(leftChunk.length);
            leftChunk.length += allocation.length + rightChunk.length;

            if (rightChunkPrevious) {
                rightChunkPrevious.nextChunk = rightChunk.nextChunk;
                if (rightChunk === leftChunkPrevious) {
                    leftChunkPrevious = rightChunkPrevious;
                }
            } else {
                vertexBufferData.bucket[this.bucket(rightChunk.length)].headChunk = rightChunk.nextChunk;
                if (rightChunk === leftChunkPrevious) {
                    leftChunkPrevious = null;
                }
            }

            //move left if it needs to
            newBucketIndex = this.bucket(leftChunk.length);
            if (newBucketIndex !== oldBucketIndex) {
                if (leftChunkPrevious) {
                    leftChunkPrevious.nextChunk = leftChunk.nextChunk;
                } else {
                    vertexBufferData.bucket[oldBucketIndex].headChunk = leftChunk.nextChunk;
                }

                //Add to new bucket
                leftChunk.nextChunk = vertexBufferData.bucket[newBucketIndex].headChunk;
                vertexBufferData.bucket[newBucketIndex].headChunk = leftChunk;
            }
        } else if (leftChunk) {
            oldBucketIndex = this.bucket(leftChunk.length);
            leftChunk.length += allocation.length;

            newBucketIndex = this.bucket(leftChunk.length);

            if (newBucketIndex !== oldBucketIndex) {
                if (leftChunkPrevious) {
                    leftChunkPrevious.nextChunk = leftChunk.nextChunk;
                } else {
                    vertexBufferData.bucket[oldBucketIndex].headChunk = leftChunk.nextChunk;
                }

                //Add to new bucket
                leftChunk.nextChunk = vertexBufferData.bucket[newBucketIndex].headChunk;
                vertexBufferData.bucket[newBucketIndex].headChunk = leftChunk;
            }
        } else if (rightChunk) {
            oldBucketIndex = this.bucket(rightChunk.length);
            rightChunk.baseIndex = allocation.baseIndex;
            rightChunk.length += allocation.length;

            newBucketIndex = this.bucket(rightChunk.length);

            if (newBucketIndex !== oldBucketIndex) {
                if (rightChunkPrevious) {
                    rightChunkPrevious.nextChunk = rightChunk.nextChunk;
                } else {
                    vertexBufferData.bucket[oldBucketIndex].headChunk = rightChunk.nextChunk;
                }

                //Add to new bucket
                rightChunk.nextChunk = vertexBufferData.bucket[newBucketIndex].headChunk;
                vertexBufferData.bucket[newBucketIndex].headChunk = rightChunk;
            }
        } else {
            var bucket = vertexBufferData.bucket[this.bucket(allocation.length)];
            bucket.headChunk = {
                baseIndex: allocation.baseIndex,
                length: allocation.length,
                nextChunk: bucket.headChunk
            };
        }

        //See if the whole thing is free and if so free the VB
        var lastChunk = vertexBufferData.bucket[this.numBuckets - 1].headChunk;
        if (lastChunk && lastChunk.length >= this.maxVerticesPerVertexBuffer) {
            vertexBuffersPool.vertexBufferData.splice(vertexBufferIndex, 1);
            vertexBufferData.vertexBuffer.destroy();
            vertexBufferData.vertexBuffer = null;
            vertexBufferData.bucket.length = 0;
            vertexBufferData.bucket = null;
        }
    };

    //
    // destroy
    //
    VertexBufferManager.prototype.destroy = function () {
        var vertexBuffersPools = this.vertexBuffersPools;
        if (vertexBuffersPools) {
            var numVertexBuffersPools = vertexBuffersPools.length;
            var i, j;
            for (i = 0; i < numVertexBuffersPools; i += 1) {
                var vertexBuffersPool = vertexBuffersPools[i];

                var vertexBufferDataArray = vertexBuffersPool.vertexBufferData;
                var numVertexBufferData = vertexBufferDataArray.length;
                for (j = 0; j < numVertexBufferData; j += 1) {
                    var vertexBufferData = vertexBufferDataArray[j];

                    var bucketArray = vertexBufferData.bucket;
                    if (bucketArray) {
                        bucketArray.length = 0;
                        vertexBufferData.bucket = null;
                    }

                    var vertexbuffer = vertexBufferData.vertexBuffer;
                    if (vertexbuffer) {
                        vertexbuffer.destroy();
                        vertexBufferData.vertexBuffer = null;
                    }
                }
                vertexBufferDataArray.length = 0;
            }
            vertexBuffersPools.length = 0;

            this.vertexBuffersPools = null;
        }

        this.graphicsDevice = null;
    };

    VertexBufferManager.create = //
    // create
    //
    function (graphicsDevice, dynamicVertexBuffers) {
        var manager = new VertexBufferManager();

        manager.vertexBuffersPools = [];
        manager.debugCreatedVertexBuffers = 0;
        manager.graphicsDevice = graphicsDevice;
        manager.dynamicVertexBuffers = dynamicVertexBuffers ? true : false;

        return manager;
    };
    VertexBufferManager.version = 1;
    return VertexBufferManager;
})();
// Copyright (c) 2009-2014 Turbulenz Limited
/*global Observer: false*/
/*global TurbulenzEngine: false*/
"use strict";
//
// ShaderManager
//
var ShaderManager = (function () {
    function ShaderManager() {
    }
    ShaderManager.prototype.get = function (path) {
        debug.abort("abstract method");
        return null;
    };

    ShaderManager.create = /**
    @constructs Constructs a ShaderManager object.
    
    @param {GraphicsDevice} gd Graphics device
    @param {RequestHandler} rh RequestHandler device
    @param {Shader} ds Default shader
    @param {Element} log Logging element
    
    @return {ShaderManager} object, null if failed
    */
    function (gd, rh, ds, errorCallback, log) {
        if (!errorCallback) {
            errorCallback = function (/* e */ ) {
            };
        }

        var defaultShaderName = "default";

        var defaultShader;
        if (ds) {
            defaultShader = ds;
        } else {
            var shaderParams = {
                "version": 1,
                "name": "default.cgfx",
                "parameters": {
                    "worldViewProjection": {
                        "type": "float",
                        "rows": 4,
                        "columns": 4
                    },
                    "diffuse": {
                        "type": "sampler2D"
                    }
                },
                "techniques": {
                    "textured3D": [
                        {
                            "parameters": ["worldViewProjection", "diffuse"],
                            "semantics": ["POSITION", "TEXCOORD0"],
                            "states": {
                                "DepthTestEnable": true,
                                "DepthFunc": 515,
                                "DepthMask": true,
                                "CullFaceEnable": true,
                                "CullFace": 1029,
                                "BlendEnable": false
                            },
                            "programs": ["vp", "fp"]
                        }
                    ]
                },
                "programs": {
                    "fp": {
                        "type": "fragment",
                        "code": "#ifdef GL_ES\nprecision mediump float;precision mediump int;\n#endif\nvarying vec4 tz_TexCoord[1];vec4 _ret_0;uniform sampler2D diffuse;void main()\n{_ret_0=texture2D(diffuse,tz_TexCoord[0].xy);gl_FragColor=_ret_0;}"
                    },
                    "vp": {
                        "type": "vertex",
                        "code": "#ifdef GL_ES\nprecision mediump float;precision mediump int;\n#endif\nvarying vec4 tz_TexCoord[1];attribute vec4 ATTR0;attribute vec4 ATTR8;\nvec4 _OUTpos1;vec2 _OUTuv1;uniform vec4 worldViewProjection[4];void main()\n{_OUTpos1=ATTR0.xxxx*worldViewProjection[0]+ATTR0.yyyy*worldViewProjection[1]+ATTR0.zzzz*worldViewProjection[2]+worldViewProjection[3];_OUTuv1=ATTR8.xy;tz_TexCoord[0].xy=ATTR8.xy;gl_Position=_OUTpos1;}"
                    }
                }
            };

            defaultShader = gd.createShader(shaderParams);
            if (!defaultShader) {
                errorCallback("Default shader not created.");
            }
        }

        var shaders = {};
        var loadingShader = {};
        var loadedObservers = {};
        var numLoadingShaders = 0;
        var pathRemapping = null;
        var pathPrefix = "";
        var doPreprocess = false;
        var resizeParameters = {};

        shaders[defaultShaderName] = defaultShader;

        function preprocessShader(shader) {
            var parameters = shader.parameters;
            var techniques = shader.techniques;
            var programs = shader.programs;
            var p, resize, programsToUpdate, t;
            var passes, numPasses, a, pass, passPrograms;
            var length, n, reg, rep, u, program;
            for (p in parameters) {
                if (parameters.hasOwnProperty(p)) {
                    resize = resizeParameters[p];
                    if (resize !== undefined) {
                        parameters[p].rows = resize;

                        programsToUpdate = {};
                        for (t in techniques) {
                            if (techniques.hasOwnProperty(t)) {
                                passes = techniques[t];
                                numPasses = passes.length;
                                for (a = 0; a < numPasses; a += 1) {
                                    pass = passes[a];
                                    if (pass.parameters.indexOf(p) !== -1) {
                                        passPrograms = pass.programs;
                                        length = passPrograms.length;
                                        for (n = 0; n < length; n += 1) {
                                            programsToUpdate[passPrograms[n]] = true;
                                        }
                                    }
                                }
                            }
                        }

                        reg = new RegExp("uniform\\s+(\\w+)\\s+" + p + "\\s*\\[[^\\]]+\\]", "mg");
                        rep = "uniform $1 " + p + "[" + resize + "]";
                        for (u in programsToUpdate) {
                            if (programsToUpdate.hasOwnProperty(u)) {
                                program = programs[u];
                                program.code = program.code.replace(reg, rep);
                            }
                        }
                    }
                }
            }
        }

        /**
        Creates shader from an cgfx file
        
        @memberOf ShaderManager.prototype
        @public
        @function
        @name load
        
        @param {string} path Path to the cgfx file
        
        @return {Shader} object, returns the default shader if the file at given path is not yet loaded
        */
        var loadShader = function loadShaderFn(path, onShaderLoaded) {
            if (path === undefined) {
                errorCallback("Invalid texture path passed to ShaderManager.Load");
            }
            var shader = shaders[path];
            if (!shader) {
                if (!loadingShader[path]) {
                    loadingShader[path] = true;
                    numLoadingShaders += 1;

                    var observer = Observer.create();
                    loadedObservers[path] = observer;
                    if (onShaderLoaded) {
                        observer.subscribe(onShaderLoaded);
                    }

                    var shaderLoaded = function shaderLoadedFn(shaderText/*, status, callContext */ ) {
                        if (shaderText) {
                            var shaderParameters = JSON.parse(shaderText);
                            if (doPreprocess) {
                                preprocessShader(shaderParameters);
                            }
                            var s = gd.createShader(shaderParameters);
                            if (s) {
                                shaders[path] = s;
                            } else {
                                delete shaders[path];
                            }

                            observer.notify(s);
                            delete loadedObservers[path];
                        } else {
                            if (log) {
                                log.innerHTML += "ShaderManager.load:&nbsp;'" + path + "' failed to load<br>";
                            }
                            delete shaders[path];
                        }
                        delete loadingShader[path];

                        numLoadingShaders -= 1;
                    };

                    rh.request({
                        src: ((pathRemapping && pathRemapping[path]) || (pathPrefix + path)),
                        onload: shaderLoaded
                    });
                } else if (onShaderLoaded) {
                    loadedObservers[path].subscribe(onShaderLoaded);
                }

                return defaultShader;
            } else if (onShaderLoaded) {
                // the callback should always be called asynchronously
                TurbulenzEngine.setTimeout(function shaderAlreadyLoadedFn() {
                    onShaderLoaded(shader);
                }, 0);
            }

            return shader;
        };

        /**
        Alias one shader to another name
        
        @memberOf ShaderManager.prototype
        @public
        @function
        @name map
        
        @param {string} dst Name of the alias
        @param {string} src Name of the shader to be aliased
        */
        var mapShader = function mapShaderFn(dst, src) {
            shaders[dst] = shaders[src];
        };

        /**
        Get shader created from a given shader file or with the given name
        
        @memberOf ShaderManager.prototype
        @public
        @function
        @name get
        
        @param {string} path Path or name of the shader
        
        @return {Shader} object, returns the default shader if the shader is not yet loaded or the shader file didn't exist
        */
        var getShader = function getShaderFn(path) {
            var shader = shaders[path];
            if (!shader) {
                return defaultShader;
            }
            return shader;
        };

        /**
        Removes a shader from the manager
        
        @memberOf ShaderManager.prototype
        @public
        @function
        @name remove
        
        @param {string} path Path or name of the shader
        */
        var removeShader = function removeShaderFn(path) {
            if (typeof shaders[path] !== 'undefined') {
                delete shaders[path];
            }
        };

        /**
        Reloads a shader
        
        @memberOf ShaderManager.prototype
        @public
        @function
        @name reload
        
        @param {string} path Path or name of the shader
        */
        var reloadShader = function reloadShaderFn(path, callback) {
            removeShader(path);
            loadShader(path, callback);
        };

        var sm = new ShaderManager();

        if (log) {
            sm.load = function loadShaderLogFn(path, callback) {
                log.innerHTML += "ShaderManager.load:&nbsp;'" + path + "'<br>";
                return loadShader(path, callback);
            };

            sm.map = function mapShaderLogFn(dst, src) {
                log.innerHTML += "ShaderManager.map:&nbsp;'" + src + "' -> '" + dst + "'<br>";
                mapShader(dst, src);
            };

            sm.get = function getShaderLogFn(path) {
                log.innerHTML += "ShaderManager.get:&nbsp;'" + path + "'<br>";
                return getShader(path);
            };

            sm.remove = function removeShaderLogFn(path) {
                log.innerHTML += "ShaderManager.remove:&nbsp;'" + path + "'<br>";
                removeShader(path);
            };

            sm.reload = function reloadShaderLogFn(path, callback) {
                log.innerHTML += "ShaderManager. reload:&nbsp;'" + path + "'<br>";
                reloadShader(path, callback);
            };
        } else {
            sm.load = loadShader;
            sm.map = mapShader;
            sm.get = getShader;
            sm.remove = removeShader;
            sm.reload = reloadShader;
        }

        /**
        Reloads all shaders
        
        @memberOf ShaderManager.prototype
        @public
        @function
        @name reloadAll
        */
        sm.reloadAll = function reloadAllShadersFn() {
            for (var t in shaders) {
                if (shaders.hasOwnProperty(t) && t !== defaultShaderName) {
                    reloadShader(t);
                }
            }
        };

        /**
        Get object containing all loaded shaders
        
        @memberOf ShaderManager.prototype
        @public
        @function
        @name getAll
        
        @return {object}
        */
        sm.getAll = function getAllShadersFn() {
            return shaders;
        };

        /**
        Get number of shaders pending
        
        @memberOf ShaderManager.prototype
        @public
        @function
        @name getNumLoadingShaders
        
        @return {number}
        */
        sm.getNumPendingShaders = function getNumPendingShadersFn() {
            return numLoadingShaders;
        };

        /**
        Check if a shader is not pending
        
        @memberOf ShaderManager.prototype
        @public
        @function
        @name isShaderLoaded
        
        @param {string} path Path or name of the shader
        
        @return {boolean}
        */
        sm.isShaderLoaded = function isShaderLoadedFn(path) {
            return !loadingShader[path];
        };

        /**
        Check if a shader is missing
        
        @memberOf ShaderManager.prototype
        @public
        @function
        @name isShaderMissing
        
        @param {string} path Path or name of the shader
        
        @return {boolean}
        */
        sm.isShaderMissing = function isShaderMissingFn(path) {
            return !shaders[path];
        };

        /**
        Set path remapping dictionary
        
        @memberOf ShaderManager.prototype
        @public
        @function
        @name setPathRemapping
        
        @param {string} prm Path remapping dictionary
        @param {string} assetUrl Asset prefix for all assets loaded
        */
        sm.setPathRemapping = function setPathRemappingFn(prm, assetUrl) {
            pathRemapping = prm;
            pathPrefix = assetUrl;
        };

        sm.setAutomaticParameterResize = function setAutomaticParameterResizeFn(name, size) {
            doPreprocess = true;
            resizeParameters[name] = size;
        };

        sm.destroy = function shaderManagerDestroyFn() {
            if (shaders) {
                var p;
                for (p in shaders) {
                    if (shaders.hasOwnProperty(p)) {
                        var shader = shaders[p];
                        if (shader) {
                            shader.destroy();
                        }
                    }
                }
                shaders = null;
            }

            defaultShader = null;
            loadingShader = null;
            loadedObservers = null;
            numLoadingShaders = 0;
            pathRemapping = null;
            pathPrefix = null;
            rh = null;
            gd = null;
        };

        return sm;
    };
    ShaderManager.version = 1;
    return ShaderManager;
})();
