// Copyright (c) 2011-2012 Turbulenz Limited
;

//badges is created by Turbulenzservices.createBadges
var BadgeManager = (function () {
    function BadgeManager() {
    }
    // list all badges (just queries the yaml file)
    BadgeManager.prototype.listUserBadges = function (callbackFn, errorCallbackFn) {
        var that = this;
        var cb = function cbFn(jsonResponse, status) {
            if (status === 200) {
                callbackFn(jsonResponse.data);
            } else if (status === 404) {
                callbackFn(null);
            } else {
                var errorCallback = errorCallbackFn || that.errorCallbackFn;
                errorCallback("Badges.listUserBadges failed with status " + status + ": " + jsonResponse.msg, status, [callbackFn]);
            }
        };

        this.service.request({
            url: '/api/v1/badges/progress/read/' + this.gameSession.gameSlug,
            method: 'GET',
            callback: cb,
            requestHandler: this.requestHandler
        });
    };

    BadgeManager.prototype.awardUserBadge = function (badge_key, callbackFn, errorCallbackFn) {
        this.addUserBadge(badge_key, null, callbackFn, errorCallbackFn);
    };

    BadgeManager.prototype.updateUserBadgeProgress = function (badge_key, current, callbackFn, errorCallbackFn) {
        var that = this;
        if (current && typeof current === 'number') {
            this.addUserBadge(badge_key, current, callbackFn, errorCallbackFn);
        } else {
            var errorCallback = errorCallbackFn || that.errorCallbackFn;
            errorCallback("Badges.updateUserBadgeProgress expects a numeric value for current", 400, [badge_key, current, callbackFn]);
        }
    };

    // add a badge to a user (gets passed a badge and a current level
    // over POST, the username is taken from the environment)
    BadgeManager.prototype.addUserBadge = function (badge_key, current, callbackFn, errorCallbackFn) {
        var that = this;
        var cb = function cbFn(jsonResponse, status) {
            if (status === 200) {
                var userbadge = jsonResponse.data;
                userbadge.gameSlug = that.gameSession.gameSlug;
                TurbulenzBridge.updateUserBadge(userbadge);
                callbackFn(userbadge);
            } else {
                var errorCallback = errorCallbackFn || that.errorCallbackFn;
                errorCallback("Badges.addUserBadge failed with status " + status + ": " + jsonResponse.msg, status, [badge_key, current, callbackFn]);
            }
        };

        var dataSpec = {};
        dataSpec.gameSessionId = this.gameSessionId;
        dataSpec.badge_key = badge_key;

        var url = '/api/v1/badges/progress/add/' + this.gameSession.gameSlug;

        if (current) {
            dataSpec.current = current;
        }

        if (TurbulenzServices.bridgeServices) {
            TurbulenzServices.addSignature(dataSpec, url);
            TurbulenzServices.callOnBridge('badge.add', dataSpec, function unpackResponse(response) {
                cb(response, response.status);
            });
        } else {
            this.service.request({
                url: url,
                method: 'POST',
                data: dataSpec,
                callback: cb,
                requestHandler: this.requestHandler,
                encrypt: true
            });
        }
    };

    // list all badges (just queries the yaml file)
    BadgeManager.prototype.listBadges = function (callbackFn, errorCallbackFn) {
        var that = this;
        var cb = function cbFn(jsonResponse, status) {
            if (status === 200) {
                callbackFn(jsonResponse.data);
            } else if (status === 404) {
                callbackFn(null);
            } else {
                var errorCallback = errorCallbackFn || that.errorCallbackFn;
                errorCallback("Badges.listBadges failed with status " + status + ": " + jsonResponse.msg, status, [callbackFn]);
            }
        };

        this.service.request({
            url: '/api/v1/badges/read/' + that.gameSession.gameSlug,
            method: 'GET',
            callback: cb,
            requestHandler: this.requestHandler
        });
    };

    BadgeManager.prototype.errorCallbackFn = function () {
        var x = Array.prototype.slice.call(arguments);
        Utilities.log('BadgeManager error: ', x);
    };

    BadgeManager.create = function (requestHandler, gameSession) {
        if (!TurbulenzServices.available()) {
            return null;
        }

        var badgeManager = new BadgeManager();

        badgeManager.gameSession = gameSession;
        badgeManager.gameSessionId = gameSession.gameSessionId;
        badgeManager.service = TurbulenzServices.getService('badges');
        badgeManager.requestHandler = requestHandler;

        return badgeManager;
    };
    BadgeManager.version = 1;
    return BadgeManager;
})();
// Copyright (c) 2011-2013 Turbulenz Limited
;

;

;

;

;

;

;

;

;

;

//
// DataShare
//
var DataShare = (function () {
    function DataShare() {
    }
    DataShare.prototype.validateKey = function (key) {
        if (!key || typeof (key) !== "string") {
            throw new Error("Invalid key string (Key string is empty or not a string)");
        }

        if (!DataShare.keyValidate.test(key)) {
            throw new Error("Invalid key string (Only alphanumeric characters and .- are permitted)");
        }
    };

    DataShare.prototype.getKey = function (params) {
        var key;
        if (params.hasOwnProperty('key')) {
            key = params.key;
            this.validateKey(key);
        } else {
            throw new Error('Key missing from parameters');
        }
        return key;
    };

    DataShare.prototype.getAccess = function (params) {
        var access;
        if (params.hasOwnProperty('access')) {
            access = params.access;
            if (access !== DataShare.publicReadOnly && access !== DataShare.publicReadAndWrite) {
                throw new Error('Access must be publicReadOnly or publicReadAndWrite');
            }
        } else {
            access = null;
        }
        return access;
    };

    DataShare.prototype.isJoined = function (username) {
        var users = this.users;
        var usersLength = users.length;
        var usersIndex;
        var lowerUsername = username.toLowerCase();

        for (usersIndex = 0; usersIndex < usersLength; usersIndex += 1) {
            if (lowerUsername === users[usersIndex].toLowerCase()) {
                return true;
            }
        }
        return false;
    };

    DataShare.prototype.join = function (callbackFn, errorCallbackFn) {
        var that = this;
        var dataShareJoinCallback = function dataShareJoinCallbackFn(jsonResponse, status) {
            var errorCallback = errorCallbackFn || that.errorCallbackFn;
            if (status === 200) {
                that.users = jsonResponse.data.users;
                that.joinable = true;
                if (callbackFn) {
                    callbackFn(true);
                }
            } else if (status === 403) {
                that.joinable = false;
                if (callbackFn) {
                    callbackFn(false);
                }
            } else if (errorCallback) {
                errorCallback("DataShare.join failed with " + "status " + status + ": " + jsonResponse.msg, status, that.join, [callbackFn]);
            }
        };

        this.service.request({
            url: '/api/v1/data-share/join/' + this.gameSession.gameSlug + '/' + this.id,
            method: 'POST',
            callback: dataShareJoinCallback,
            requestHandler: this.requestHandler
        });
    };

    DataShare.prototype.setJoinable = function (joinable, callbackFn, errorCallbackFn) {
        var that = this;
        var dataShareSetJoinableCallback = function dataShareSetJoinableCallbackFn(jsonResponse, status) {
            var errorCallback = errorCallbackFn || that.errorCallbackFn;
            if (status === 200) {
                if (callbackFn) {
                    callbackFn();
                }
            } else if (errorCallback) {
                errorCallback("DataShare.setJoinable failed with " + "status " + status + ": " + jsonResponse.msg, status, that.setJoinable, [joinable, callbackFn]);
            }
        };

        if (joinable) {
            joinable = 1;
        } else {
            joinable = 0;
        }

        this.service.request({
            url: '/api/v1/data-share/set-properties/' + this.gameSession.gameSlug + '/' + this.id,
            method: 'POST',
            data: {
                joinable: joinable
            },
            callback: dataShareSetJoinableCallback,
            requestHandler: this.requestHandler
        });
    };

    DataShare.prototype.leave = function (callbackFn, errorCallbackFn) {
        var that = this;
        var dataShareLeaveCallback = function dataShareLeaveCallbackFn(jsonResponse, status) {
            var errorCallback = errorCallbackFn || that.errorCallbackFn;

            if (status === 200 || status === 403 || status === 404) {
                if (callbackFn) {
                    callbackFn();
                }
            } else if (errorCallback) {
                errorCallback("DataShare.leave failed with " + "status " + status + ": " + jsonResponse.msg, status, that.leave, [callbackFn]);
            }
        };

        this.service.request({
            url: '/api/v1/data-share/leave/' + this.gameSession.gameSlug + '/' + this.id,
            method: 'POST',
            callback: dataShareLeaveCallback,
            requestHandler: this.requestHandler
        });
    };

    DataShare.prototype.getKeys = function (callbackFn, errorCallbackFn) {
        var that = this;

        var dataShareGetKeysCallback = function dataShareGetKeysCallbackFn(jsonResponse, status) {
            var errorCallback = errorCallbackFn || that.errorCallbackFn;
            if (status === 200) {
                var keys = jsonResponse.data.keys;
                callbackFn(keys);
            } else if (errorCallback) {
                errorCallback("DataShare.getKeys failed with " + "status " + status + ": " + jsonResponse.msg, status, that.getKeys, [callbackFn]);
            }
        };

        this.service.request({
            url: '/api/v1/data-share/read/' + this.id,
            method: 'GET',
            data: {
                gameSessionId: this.gameSessionId
            },
            callback: dataShareGetKeysCallback,
            requestHandler: this.requestHandler,
            encrypt: true
        });
    };

    DataShare.prototype.get = function (key, callbackFn, errorCallbackFn) {
        var that = this;
        this.validateKey(key);

        var dataShareGetCallback = function dataShareGetCallbackFn(jsonResponse, status) {
            var errorCallback = errorCallbackFn || that.errorCallbackFn;
            if (status === 200) {
                var responseData = jsonResponse.data;
                if (responseData === null) {
                    delete that.tokens[key];
                    callbackFn(responseData);
                } else {
                    that.tokens[key] = responseData.token;
                    callbackFn(responseData);
                }
            } else if (errorCallback) {
                errorCallback("DataShare.get failed with " + "status " + status + ": " + jsonResponse.msg, status, that.get, [key, callbackFn]);
            }
        };

        this.service.request({
            url: '/api/v1/data-share/read/' + this.id + '/' + key,
            method: 'GET',
            data: {
                gameSessionId: this.gameSessionId
            },
            callback: dataShareGetCallback,
            requestHandler: this.requestHandler,
            encrypt: true
        });
    };

    DataShare.prototype.checkUnauthoizedError = function (jsonResponse, status) {
        if (status === 403 && jsonResponse.data && jsonResponse.data.reason) {
            if (jsonResponse.data.reason === 'read_only') {
                return DataShare.notSetReason.readOnly;
            }
            if (jsonResponse.data.reason === 'read_and_write') {
                return DataShare.notSetReason.readAndWrite;
            }
        }
        return null;
    };

    DataShare.prototype.set = function (params) {
        var that = this;
        var key = this.getKey(params);

        var dataShareSetCallback = function dataShareSetCallbackFn(jsonResponse, status) {
            if (status === 200) {
                var token = jsonResponse.data.token;
                if (token) {
                    that.tokens[key] = token;
                } else {
                    delete that.tokens[key];
                }
                if (params.callback) {
                    params.callback(true);
                }
            } else {
                var reason = that.checkUnauthoizedError(jsonResponse, status);
                if (reason) {
                    if (params.callback) {
                        params.callback(false, reason);
                    }
                } else {
                    var errorCallback = params.errorCallback || that.errorCallbackFn;
                    if (errorCallback) {
                        errorCallback("DataShare.set failed with " + "status " + status + ": " + jsonResponse.msg, status, that.set, [params]);
                    }
                }
            }
        };

        var dataSpec = {
            gameSessionId: this.gameSessionId,
            value: params.value
        };

        this.service.request({
            url: '/api/v1/data-share/set/' + this.id + '/' + key,
            method: 'POST',
            data: dataSpec,
            callback: dataShareSetCallback,
            requestHandler: this.requestHandler,
            encrypt: true
        });
    };

    DataShare.prototype.compareAndSet = function (params) {
        var that = this;
        var key = this.getKey(params);

        var dataShareCompareAndSetCallback = function dataShareCompareAndSetCallbackFn(jsonResponse, status) {
            var errorCallback = params.errorCallback || that.errorCallbackFn;
            if (status === 200) {
                var responseData = jsonResponse.data;
                if (responseData.wasSet) {
                    if (responseData.token) {
                        that.tokens[key] = responseData.token;
                    } else {
                        delete that.tokens[key];
                    }
                    if (params.callback) {
                        params.callback(true);
                    }
                } else if (params.callback) {
                    params.callback(false, DataShare.notSetReason.changed);
                }
            } else {
                var reason = that.checkUnauthoizedError(jsonResponse, status);
                if (reason) {
                    if (params.callback) {
                        params.callback(false, reason);
                    }
                } else {
                    var errorCallback = params.errorCallback || that.errorCallbackFn;
                    errorCallback("DataShare.compareAndSet failed with " + "status " + status + ": " + jsonResponse.msg, status, that.compareAndSet, [params]);
                }
            }
        };

        var dataSpec = {
            gameSessionId: this.gameSessionId,
            token: this.tokens[key] || '',
            value: params.value
        };
        var access = this.getAccess(params);
        if (access !== null) {
            dataSpec.access = access;
        }

        this.service.request({
            url: '/api/v1/data-share/compare-and-set/' + this.id + '/' + key,
            method: 'POST',
            data: dataSpec,
            callback: dataShareCompareAndSetCallback,
            requestHandler: this.requestHandler,
            encrypt: true
        });
    };

    DataShare.create = function (requestHandler, gameSession, params, errorCallbackFn) {
        if (!TurbulenzServices.available()) {
            debug.log("dataShareCreateFn: !! TurbulenzServices not available");

            // Call error callback on a timeout to get the same behaviour as the ajax call
            TurbulenzEngine.setTimeout(function () {
                if (errorCallbackFn) {
                    errorCallbackFn('DataShare.create requires Turbulenz services');
                }
            }, 0);
            return null;
        }

        var dataShare = new DataShare();

        dataShare.gameSession = gameSession;
        dataShare.gameSessionId = gameSession.gameSessionId;
        dataShare.errorCallbackFn = errorCallbackFn || TurbulenzServices.defaultErrorCallback;
        dataShare.service = TurbulenzServices.getService('datashare');
        dataShare.requestHandler = requestHandler;

        dataShare.id = params.id;
        dataShare.created = params.created;
        dataShare.owner = params.owner;
        dataShare.users = params.users;
        dataShare.joinable = params.joinable;

        dataShare.tokens = {};

        return dataShare;
    };
    DataShare.version = 1;

    DataShare.keyValidate = new RegExp('[A-Za-z0-9]+([\-\.][A-Za-z0-9]+)*');

    DataShare.publicReadOnly = 0;
    DataShare.publicReadAndWrite = 1;

    DataShare.notSetReason = {
        changed: 'changed',
        readOnly: 'readOnly',
        readAndWrite: 'readAndWrite'
    };
    return DataShare;
})();

//
// DataShareManager
//
var DataShareManager = (function () {
    function DataShareManager() {
    }
    DataShareManager.prototype.createDataShare = function (callbackFn, errorCallbackFn) {
        var that = this;

        var createDataShareCallback = function createDataShareCallbackFn(jsonResponse, status) {
            if (status === 200) {
                var dataShare = DataShare.create(that.requestHandler, that.gameSession, jsonResponse.data.datashare, errorCallback);
                callbackFn(dataShare);
            } else {
                var errorCallback = errorCallbackFn || that.errorCallbackFn;
                if (errorCallback) {
                    errorCallback("DataShareManager.createDataShare failed with " + "status " + status + ": " + jsonResponse.msg, status, that.createDataShare, [callbackFn, errorCallbackFn]);
                }
            }
        };

        var dataSpec = {
            gameSessionId: this.gameSessionId
        };

        this.service.request({
            url: '/api/v1/data-share/create/' + this.gameSession.gameSlug,
            method: 'POST',
            data: dataSpec,
            callback: createDataShareCallback,
            requestHandler: this.requestHandler
        });
    };

    DataShareManager.prototype.findDataShares = function (params) {
        var that = this;
        if (!params.callback) {
            throw new Error('findDataShares missing callback parameter');
        }

        var findDataSharesCallback = function findDataSharesCallbackFn(jsonResponse, status) {
            var errorCallback = params.errorCallback || that.errorCallbackFn;
            if (status === 200) {
                var id;
                var dataShareMeta = jsonResponse.data.datashares;
                var dataShares = [];

                var dataShareMetaLength = dataShareMeta.length;
                var dataShareMetaIndex;
                for (dataShareMetaIndex = 0; dataShareMetaIndex < dataShareMetaLength; dataShareMetaIndex += 1) {
                    dataShares.push(DataShare.create(that.requestHandler, that.gameSession, dataShareMeta[dataShareMetaIndex], errorCallback));
                }
                params.callback(dataShares);
            } else if (errorCallback) {
                errorCallback("DataShareManager.findDataShares failed with " + "status " + status + ": " + jsonResponse.msg, status, that.findDataShares, [params]);
            }
        };

        var dataSpec = {};

        if (params.user) {
            dataSpec.username = params.user;
        }

        if (params.friendsOnly) {
            dataSpec.friendsOnly = 1;
        }

        this.service.request({
            url: '/api/v1/data-share/find/' + this.gameSession.gameSlug,
            method: 'GET',
            data: dataSpec,
            callback: findDataSharesCallback,
            requestHandler: this.requestHandler
        });
    };

    DataShareManager.create = function (requestHandler, gameSession, errorCallbackFn) {
        if (!TurbulenzServices.available()) {
            debug.log("dataShareManagerCreateFn: !! TurbulenzServices not available");

            if (errorCallbackFn) {
                TurbulenzEngine.setTimeout(function () {
                    errorCallbackFn('DataShareManager.create requires Turbulenz services');
                }, 0);
            }
            return null;
        }

        var dataShareManager = new DataShareManager();

        dataShareManager.gameSession = gameSession;
        dataShareManager.gameSessionId = gameSession.gameSessionId;
        dataShareManager.errorCallbackFn = errorCallbackFn || TurbulenzServices.defaultErrorCallback;
        dataShareManager.service = TurbulenzServices.getService('datashare');
        dataShareManager.requestHandler = requestHandler;

        return dataShareManager;
    };
    DataShareManager.version = 1;
    return DataShareManager;
})();
// Copyright (c) 2012 Turbulenz Limited
var GameProfileManager = (function () {
    function GameProfileManager() {
        this.maxValueSize = 1024;
        this.maxGetListUsernames = 64;
    }
    GameProfileManager.prototype.set = function (value, callbackFn, errorCallbackFn) {
        if (!value) {
            return this.remove(callbackFn, errorCallbackFn);
        }

        if (value.length > this.maxValueSize) {
            return false;
        }

        var that = this;
        var setCallback = function setCallbackFn(jsonResponse, status) {
            if (status === 200) {
                if (callbackFn) {
                    callbackFn();
                }
            } else {
                var errorCallback = errorCallbackFn || that.errorCallbackFn;
                errorCallback("GameProfileManager.set failed with status " + status + ": " + jsonResponse.msg, status, that.set, [value, callbackFn]);
            }
        };

        var dataSpec = {
            value: value,
            gameSessionId: that.gameSessionId
        };

        var url = '/api/v1/game-profile/set';

        if (TurbulenzServices.bridgeServices) {
            TurbulenzServices.addSignature(dataSpec, url);
            TurbulenzServices.callOnBridge('gameprofile.set', dataSpec, function unpackResponse(response) {
                setCallback(response, response.status);
            });
        } else {
            this.service.request({
                url: url,
                method: 'POST',
                data: dataSpec,
                callback: setCallback,
                requestHandler: this.requestHandler,
                encrypt: true
            });
        }

        return true;
    };

    GameProfileManager.prototype.remove = function (callbackFn, errorCallbackFn) {
        var that = this;
        function removeCallbackFn(jsonResponse, status) {
            if (status === 200 || status === 404) {
                if (callbackFn) {
                    callbackFn();
                }
            } else {
                var errorCallback = errorCallbackFn || that.errorCallbackFn;
                errorCallback("GameProfileManager.remove failed with status " + status + ": " + jsonResponse.msg, status, that.remove, [callbackFn]);
            }
        }

        var dataSpec = {
            gameSessionId: that.gameSessionId
        };

        var url = '/api/v1/game-profile/remove';

        if (TurbulenzServices.bridgeServices) {
            TurbulenzServices.addSignature(dataSpec, url);
            TurbulenzServices.callOnBridge('gameprofile.remove', dataSpec, function unpackResponse(response) {
                removeCallbackFn(response, response.status);
            });
        } else {
            this.service.request({
                url: url,
                method: 'POST',
                data: dataSpec,
                callback: removeCallbackFn,
                requestHandler: this.requestHandler,
                encrypt: true
            });
        }

        return true;
    };

    GameProfileManager.prototype.get = function (username, callbackFn, errorCallbackFn) {
        var callbackWrapper = function callbackWrapperFn(gameProfiles) {
            if (gameProfiles.hasOwnProperty(username)) {
                callbackFn(username, gameProfiles[username]);
            } else {
                callbackFn(username, null);
            }
        };
        return this.getList([username], callbackWrapper, errorCallbackFn);
    };

    GameProfileManager.prototype.getList = function (usernames, callbackFn, errorCallbackFn) {
        if (usernames.length > this.maxGetListUsernames) {
            return false;
        }

        var that = this;
        var getCallback = function getCallbackFn(jsonResponse, status) {
            if (status === 200) {
                callbackFn(jsonResponse.data.profiles);
            } else if (status === 404) {
                callbackFn(null);
            } else {
                var errorCallback = errorCallbackFn || that.errorCallbackFn;
                errorCallback("GameProfileManager.getList failed with status " + status + ": " + jsonResponse.msg, status, that.getList, [callbackFn]);
            }
        };

        var dataSpec = {
            gameSessionId: that.gameSessionId,
            usernames: JSON.stringify(usernames)
        };

        this.service.request({
            url: '/api/v1/game-profile/read',
            method: 'GET',
            data: dataSpec,
            callback: getCallback,
            requestHandler: this.requestHandler
        });

        return true;
    };

    GameProfileManager.create = // Constructor function
    function (requestHandler, gameSession, errorCallbackFn) {
        if (!TurbulenzServices.available()) {
            return null;
        }

        var gameProfileManager = new GameProfileManager();
        gameProfileManager.requestHandler = requestHandler;
        gameProfileManager.errorCallbackFn = errorCallbackFn || TurbulenzServices.defaultErrorCallback;
        gameProfileManager.gameSessionId = gameSession.gameSessionId;

        gameProfileManager.service = TurbulenzServices.getService('gameProfile');

        return gameProfileManager;
    };
    GameProfileManager.version = 1;
    return GameProfileManager;
})();
// Copyright (c) 2011-2012 Turbulenz Limited
;

;

var GameSession = (function () {
    function GameSession() {
        this.post_delay = 1000;
    }
    GameSession.prototype.setStatus = function (status) {
        if (this.destroyed || this.status === status) {
            return;
        }

        this.status = status;
        TurbulenzBridge.setGameSessionStatus(this.gameSessionId, status);
    };

    // callbackFn is for testing only!
    // It will not be called if destroy is called in TurbulenzEngine.onUnload
    GameSession.prototype.destroy = function (callbackFn) {
        var dataSpec;
        if (this.pendingUpdate) {
            TurbulenzEngine.clearTimeout(this.pendingUpdate);
            this.pendingUpdate = null;
        }

        if (!this.destroyed && this.gameSessionId) {
            // we can't wait for the callback as the browser doesn't
            // call async callbacks after onbeforeunload has been called
            TurbulenzBridge.destroyedGameSession(this.gameSessionId);
            this.destroyed = true;

            dataSpec = { 'gameSessionId': this.gameSessionId };

            if (TurbulenzServices.bridgeServices) {
                TurbulenzServices.callOnBridge('gamesession.destroy', dataSpec, callbackFn);
            } else {
                Utilities.ajax({
                    url: '/api/v1/games/destroy-session',
                    method: 'POST',
                    data: dataSpec,
                    callback: callbackFn,
                    requestHandler: this.requestHandler
                });
            }
        } else {
            if (callbackFn) {
                TurbulenzEngine.setTimeout(callbackFn, 0);
            }
        }
    };

    /**
    * Handle player metadata
    */
    GameSession.prototype.setTeamInfo = function (teamList) {
        var sessionData = this.info.sessionData;
        var oldTeamList = sessionData.teamList || [];
        if (teamList.join('#') !== oldTeamList.join('#')) {
            sessionData.teamList = teamList;
            this.update();
        }
    };

    GameSession.prototype.setPlayerInfo = function (playerId, data) {
        var playerData = this.info.playerSessionData[playerId];
        var key;
        var dirty = false;

        if (!playerData) {
            playerData = {};
            this.info.playerSessionData[playerId] = playerData;
            dirty = true;
        }

        for (key in data) {
            if (data.hasOwnProperty(key)) {
                if (!this.templatePlayerData.hasOwnProperty(key)) {
                    throw "unknown session data property " + key;
                }
                if (playerData[key] !== data[key]) {
                    playerData[key] = data[key];
                    dirty = true;
                }
            }
        }

        if (dirty) {
            this.update();
        }
    };

    GameSession.prototype.removePlayerInfo = function (playerId) {
        delete this.info.playerSessionData[playerId];
        this.update();
    };

    GameSession.prototype.clearAllPlayerInfo = function () {
        this.info.playerSessionData = {};
        this.update();
    };

    GameSession.prototype.update = function () {
        if (!this.pendingUpdate) {
            // Debounce the update to pick up any other changes.
            this.pendingUpdate = TurbulenzEngine.setTimeout(this.postData, this.post_delay);
        }
    };

    GameSession.create = function (requestHandler, sessionCreatedFn, errorCallbackFn) {
        var gameSession = new GameSession();
        var gameSlug = window.gameSlug;
        var turbulenz = window.top.Turbulenz;
        var turbulenzData = (turbulenz && turbulenz.Data) || {};
        var mode = turbulenzData.mode || TurbulenzServices.mode;
        var createSessionURL = '/api/v1/games/create-session/' + gameSlug;
        gameSession.info = {
            sessionData: {},
            playerSessionData: {}
        };

        gameSession.templatePlayerData = {
            team: null,
            color: null,
            status: null,
            rank: null,
            score: null,
            sortkey: null
        };

        gameSession.postData = function postDataFn() {
            TurbulenzBridge.setGameSessionInfo(JSON.stringify(gameSession.info));
            gameSession.pendingUpdate = null;
        };

        gameSession.pendingUpdate = null;

        gameSession.gameSlug = gameSlug;

        gameSession.requestHandler = requestHandler;
        gameSession.errorCallbackFn = errorCallbackFn || TurbulenzServices.defaultErrorCallback;
        gameSession.gameSessionId = null;
        gameSession.service = TurbulenzServices.getService('gameSessions');
        gameSession.status = null;

        if (!TurbulenzServices.available()) {
            if (sessionCreatedFn) {
                // On a timeout so it happens asynchronously, like an
                // ajax call.
                TurbulenzEngine.setTimeout(function sessionCreatedCall() {
                    sessionCreatedFn(gameSession);
                }, 0);
            }
            return gameSession;
        }

        var gameSessionRequestCallback = function gameSessionRequestCallbackFn(jsonResponse, status) {
            if (status === 200) {
                gameSession.mappingTable = jsonResponse.mappingTable;
                gameSession.gameSessionId = jsonResponse.gameSessionId;

                if (sessionCreatedFn) {
                    sessionCreatedFn(gameSession);
                }

                TurbulenzBridge.createdGameSession(gameSession.gameSessionId);
            } else if (404 === status) {
                // Treat this case as the equivalent of services being
                // unavailable.
                window.gameSlug = undefined;
                gameSession.gameSlug = undefined;

                if (sessionCreatedFn) {
                    sessionCreatedFn(gameSession);
                }
            } else {
                gameSession.errorCallbackFn("TurbulenzServices.createGameSession error with HTTP status " + status + ": " + jsonResponse.msg, status);
            }
        };

        if (mode) {
            createSessionURL += '/' + mode;
        }

        gameSession.service.request({
            url: createSessionURL,
            method: 'POST',
            callback: gameSessionRequestCallback,
            requestHandler: requestHandler,
            neverDiscard: true
        });

        return gameSession;
    };
    GameSession.version = 1;
    return GameSession;
})();
// Copyright (c) 2011-2012 Turbulenz Limited
/*global TurbulenzEngine: false*/
/*global TurbulenzBridge*/
/*global TurbulenzServices*/
//
// API
//
var LeaderboardManager = (function () {
    function LeaderboardManager() {
        this.getTypes = {
            top: 'top',
            near: 'near',
            above: 'above',
            below: 'below'
        };
        this.maxGetSize = 32;
    }
    LeaderboardManager.prototype.getOverview = function (spec, callbackFn, errorCallbackFn) {
        var errorCallback = errorCallbackFn || this.errorCallbackFn;
        if (!this.meta) {
            errorCallback("The leaderboard manager failed to initialize properly.");
            return;
        }

        var that = this;
        var getOverviewCallback = function getOverviewCallbackFn(jsonResponse, status) {
            if (status === 200) {
                var overview = jsonResponse.data;
                var overviewLength = overview.length;
                for (var i = 0; i < overviewLength; i += 1) {
                    var leaderboard = overview[i];
                    if (leaderboard.hasOwnProperty('score')) {
                        that.meta[leaderboard.key].bestScore = leaderboard.score;
                    }
                }
                callbackFn(overview);
            } else {
                errorCallback("LeaderboardManager.getKeys failed with status " + status + ": " + jsonResponse.msg, status, that.getOverview, [spec, callbackFn]);
            }
        };

        var dataSpec = {};
        if (spec.friendsOnly) {
            dataSpec.friendsonly = spec.friendsOnly && 1;
        }

        this.service.request({
            url: '/api/v1/leaderboards/scores/read/' + that.gameSession.gameSlug,
            method: 'GET',
            data: dataSpec,
            callback: getOverviewCallback,
            requestHandler: this.requestHandler
        });
    };

    LeaderboardManager.prototype.getAggregates = function (spec, callbackFn, errorCallbackFn) {
        var errorCallback = errorCallbackFn || this.errorCallbackFn;
        if (!this.meta) {
            errorCallback("The leaderboard manager failed to initialize properly.");
            return;
        }

        var that = this;
        var getAggregatesCallback = function getAggregatesCallbackFn(jsonResponse, status) {
            if (status === 200) {
                var aggregates = jsonResponse.data;
                callbackFn(aggregates);
            } else {
                errorCallback("LeaderboardManager.getKeys failed with status " + status + ": " + jsonResponse.msg, status, that.getAggregates, [spec, callbackFn, errorCallbackFn]);
            }
        };

        var dataSpec = {};

        this.service.request({
            url: '/api/v1/leaderboards/aggregates/read/' + that.gameSession.gameSlug,
            method: 'GET',
            data: dataSpec,
            callback: getAggregatesCallback,
            requestHandler: this.requestHandler
        });
    };

    LeaderboardManager.prototype.getRaw = function (key, spec, callbackFn, errorCallbackFn) {
        var that = this;
        var errorCallback = errorCallbackFn || this.errorCallbackFn;
        var getCallback = function getCallbackFn(jsonResponse, status) {
            if (status === 200) {
                var data = jsonResponse.data;
                callbackFn(data);
            } else {
                errorCallback("LeaderboardManager.get failed with status " + status + ": " + jsonResponse.msg, status, that.get, [key, spec, callbackFn]);
            }
        };

        this.service.request({
            url: '/api/v1/leaderboards/scores/read/' + that.gameSession.gameSlug + '/' + key,
            method: 'GET',
            data: spec,
            callback: getCallback,
            requestHandler: this.requestHandler
        });
        return true;
    };

    LeaderboardManager.prototype.get = function (key, spec, callbackFn, errorCallbackFn) {
        var errorCallback = errorCallbackFn || this.errorCallbackFn;
        if (!this.meta) {
            errorCallback("The leaderboard manager failed to initialize properly.");
            return false;
        }

        var meta = this.meta[key];
        if (!meta) {
            errorCallback("No leaderboard with the name '" + key + "' exists.");
            return false;
        }

        var dataSpec = {};

        if (spec.numNear) {
            dataSpec.type = this.getTypes.near;
            dataSpec.size = spec.numNear * 2 + 1;
        }
        if (spec.numTop) {
            dataSpec.type = this.getTypes.top;
            dataSpec.size = spec.numTop;
        }

        if (spec.size) {
            dataSpec.size = spec.size;
        }
        if (!dataSpec.size) {
            // default value
            dataSpec.size = 9;
        }
        if (dataSpec.size > this.maxGetSize) {
            throw new Error('Leaderboard get request size must be smaller than ' + this.maxGetSize);
        }

        if (spec.friendsOnly) {
            dataSpec.friendsonly = spec.friendsOnly && 1;
        }

        if (spec.type) {
            dataSpec.type = spec.type;
        }
        if (spec.hasOwnProperty('score')) {
            dataSpec.score = spec.score;
        }
        if (spec.hasOwnProperty('time')) {
            dataSpec.time = spec.time;
        }

        var that = this;
        var callbackWrapper = function callbackWrapperFn(data) {
            var lbr = LeaderboardResult.create(that, key, dataSpec, data);
            callbackFn(key, lbr);
        };

        return this.getRaw(key, dataSpec, callbackWrapper, errorCallbackFn);
    };

    LeaderboardManager.prototype.set = function (key, score, callbackFn, errorCallbackFn) {
        var errorCallback = errorCallbackFn || this.errorCallbackFn;
        if (!this.meta) {
            errorCallback("The leaderboard manager failed to initialize properly.");
            return;
        }

        var meta = this.meta[key];
        if (!meta) {
            errorCallback("No leaderboard with the name '" + key + "' exists.");
            return;
        }

        if (typeof (score) !== 'number' || isNaN(score)) {
            throw new Error("Score must be a number.");
        }

        if (score < 0) {
            throw new Error("Score cannot be negative.");
        }

        var sortBy = meta.sortBy;
        var bestScore = meta.bestScore;

        if ((bestScore && ((sortBy === 1 && score <= bestScore) || (sortBy === -1 && score >= bestScore)))) {
            TurbulenzEngine.setTimeout(function () {
                callbackFn(key, score, false, bestScore);
            }, 0);
            return;
        }

        var that = this;
        var setCallback = function setCallbackFn(jsonResponse, status) {
            if (status === 200) {
                var data = jsonResponse.data;
                var bestScore = data.bestScore || data.lastScore || null;
                var newBest = data.newBest || false;
                if (newBest) {
                    bestScore = score;

                    // Assemble data for notification system.
                    var scoreData = {
                        key: key,
                        title: meta.title,
                        sortBy: meta.sortBy,
                        score: score,
                        prevBest: data.prevBest,
                        gameSlug: that.gameSession.gameSlug
                    };

                    // Trigger notification (only for new best scores).
                    TurbulenzBridge.updateLeaderBoard(scoreData);
                }
                meta.bestScore = bestScore;
                callbackFn(key, score, newBest, bestScore);
            } else {
                errorCallback("LeaderboardManager.set failed with status " + status + ": " + jsonResponse.msg, status, that.set, [key, score, callbackFn]);
            }
        };

        var dataSpec = {
            score: score,
            gameSessionId: that.gameSessionId,
            key: undefined
        };
        var url = '/api/v1/leaderboards/scores/set/' + key;

        if (TurbulenzServices.bridgeServices) {
            TurbulenzServices.addSignature(dataSpec, url);
            dataSpec.key = key;
            TurbulenzServices.callOnBridge('leaderboard.set', dataSpec, function unpackResponse(response) {
                setCallback(response, response.status);
            });
        } else {
            this.service.request({
                url: url,
                method: 'POST',
                data: dataSpec,
                callback: setCallback,
                requestHandler: this.requestHandler,
                encrypt: true
            });
        }
    };

    // ONLY available on Local and Hub
    LeaderboardManager.prototype.reset = function (callbackFn, errorCallbackFn) {
        var errorCallback = errorCallbackFn || this.errorCallbackFn;
        if (!this.meta) {
            errorCallback("The leaderboard manager failed to initialize properly.");
            return;
        }

        var that = this;
        var resetCallback = function resetCallbackFn(jsonResponse, status) {
            if (status === 200) {
                var meta = that.meta;
                var m;
                for (m in meta) {
                    if (meta.hasOwnProperty(m)) {
                        delete meta[m].bestScore;
                    }
                }
                if (callbackFn) {
                    callbackFn();
                }
            } else {
                errorCallback("LeaderboardManager.reset failed with status " + status + ": " + jsonResponse.msg, status, that.reset, [callbackFn]);
            }
        };

        // for testing only (this is not available on the Gamesite)
        this.service.request({
            url: '/api/v1/leaderboards/scores/remove-all/' + this.gameSession.gameSlug,
            method: 'POST',
            callback: resetCallback,
            requestHandler: this.requestHandler
        });
    };

    LeaderboardManager.create = function (requestHandler, gameSession, leaderboardMetaReceived, errorCallbackFn) {
        if (!TurbulenzServices.available()) {
            // Call error callback on a timeout to get the same behaviour as the ajax call
            TurbulenzEngine.setTimeout(function () {
                if (errorCallbackFn) {
                    errorCallbackFn('TurbulenzServices.createLeaderboardManager could not load leaderboards meta data');
                }
            }, 0);
            return null;
        }

        var leaderboardManager = new LeaderboardManager();

        leaderboardManager.gameSession = gameSession;
        leaderboardManager.gameSessionId = gameSession.gameSessionId;
        leaderboardManager.errorCallbackFn = errorCallbackFn || TurbulenzServices.defaultErrorCallback;
        leaderboardManager.service = TurbulenzServices.getService('leaderboards');
        leaderboardManager.requestHandler = requestHandler;
        leaderboardManager.ready = false;

        leaderboardManager.service.request({
            url: '/api/v1/leaderboards/read/' + gameSession.gameSlug,
            method: 'GET',
            callback: function createLeaderboardManagerAjaxErrorCheck(jsonResponse, status) {
                if (status === 200) {
                    var metaArray = jsonResponse.data;
                    if (metaArray) {
                        leaderboardManager.meta = {};
                        var metaLength = metaArray.length;
                        var i;
                        for (i = 0; i < metaLength; i += 1) {
                            var board = metaArray[i];
                            leaderboardManager.meta[board.key] = board;
                        }
                    }
                    leaderboardManager.ready = true;
                    if (leaderboardMetaReceived) {
                        leaderboardMetaReceived(leaderboardManager);
                    }
                } else {
                    leaderboardManager.errorCallbackFn("TurbulenzServices.createLeaderboardManager error with HTTP status " + status + ": " + jsonResponse.msg, status);
                }
            },
            requestHandler: requestHandler,
            neverDiscard: true
        });

        return leaderboardManager;
    };
    LeaderboardManager.version = 1;
    return LeaderboardManager;
})();

var LeaderboardResult = (function () {
    function LeaderboardResult() {
    }
    LeaderboardResult.prototype.computeOverlap = function () {
        // calculates the number of scores that the leaderboard results have overlapped
        // this only happens at the end of the leaderboards
        var results = this.results;
        var overlap = 0;
        if (results.top || results.bottom) {
            var ranking = results.ranking;
            var rankingLength = ranking.length;
            var sortBy = this.leaderboardManager.meta[this.key].sortBy;
            var aboveType = this.leaderboardManager.getTypes.above;
            var specScore = results.spec.score;
            var specTime = results.spec.time;

            var i;
            for (i = 0; i < rankingLength; i += 1) {
                var rank = ranking[i];

                if (rank.score * sortBy < specScore * sortBy || (rank.score === specScore && rank.time >= specTime)) {
                    if (results.spec.type === aboveType) {
                        overlap = rankingLength - i;
                    } else {
                        overlap = i + 1;
                    }
                    break;
                }
            }
        }
        results.overlap = overlap;
    };

    LeaderboardResult.prototype.getPageOffset = function (type, offsetIndex, callbackFn, errorCallbackFn) {
        var offsetScore = this.results.ranking[offsetIndex];
        if (!offsetScore) {
            TurbulenzEngine.setTimeout(callbackFn, 0);
            return false;
        }

        var newSpec = {
            type: type,
            score: offsetScore.score,
            time: offsetScore.time,
            size: this.requestSize,
            // remeber to map to backend lowercase format!
            friendsonly: this.originalSpec.friendsOnly && 1 || 0
        };

        // store the spec for refresh calls
        this.spec = newSpec;

        var that = this;
        function parseResults(data) {
            that.parseResults(that.key, newSpec, data);
            that.computeOverlap();
            callbackFn();
        }

        this.leaderboardManager.getRaw(this.key, newSpec, parseResults, errorCallbackFn);
        return true;
    };

    LeaderboardResult.prototype.viewOperationBegin = function () {
        if (this.viewLock) {
            return false;
        }
        this.viewLock = true;
        return true;
    };

    LeaderboardResult.prototype.viewOperationEnd = function (callbackFn) {
        // unlock the view object so other page/scroll calls can be made
        this.viewLock = false;

        var that = this;
        function callbackWrapperFn() {
            callbackFn(that.key, that);
        }

        if (callbackFn) {
            TurbulenzEngine.setTimeout(callbackWrapperFn, 0);
        }
    };

    LeaderboardResult.prototype.wrapViewOperationError = function (errorCallbackFn) {
        var that = this;
        return function errorWrapper(errorMsg, httpStatus, calledByFn, calledByParams) {
            // unlock the view object so other page/scroll calls can be made
            that.viewLock = false;
            errorCallbackFn(errorMsg, httpStatus, calledByFn, calledByParams);
        };
    };

    LeaderboardResult.prototype.refresh = function (callbackFn, errorCallbackFn) {
        if (!this.viewOperationBegin()) {
            return false;
        }
        var that = this;
        function parseResults(data) {
            that.parseResults(that.key, that.spec, data);
            that.computeOverlap();
            that.invalidView = true;

            if (that.onSlidingWindowUpdate) {
                that.onSlidingWindowUpdate();
            }
            that.viewOperationEnd(callbackFn);
        }

        this.leaderboardManager.getRaw(this.key, this.spec, parseResults, this.wrapViewOperationError(errorCallbackFn));

        return true;
    };

    LeaderboardResult.prototype.moveUp = function (offset, callbackFn, errorCallbackFn) {
        if (!this.viewOperationBegin()) {
            return false;
        }

        var that = this;
        function newResult() {
            var results = that.results;
            that.viewTop = Math.max(0, results.ranking.length - that.viewSize - results.overlap);
            that.invalidView = true;

            if (that.onSlidingWindowUpdate) {
                that.onSlidingWindowUpdate();
            }
            that.viewOperationEnd(callbackFn);
        }

        if (this.viewTop - offset < 0) {
            if (this.results.top) {
                this.viewTop = 0;
                this.viewOperationEnd(callbackFn);
            } else {
                this.getPageOffset(this.leaderboardManager.getTypes.above, this.viewTop + this.viewSize - offset, newResult, this.wrapViewOperationError(errorCallbackFn));
            }
            return true;
        }

        this.viewTop -= offset;
        this.invalidView = true;
        this.viewOperationEnd(callbackFn);
        return true;
    };

    LeaderboardResult.prototype.moveDown = function (offset, callbackFn, errorCallbackFn) {
        if (!this.viewOperationBegin()) {
            return false;
        }

        var that = this;
        function newResult() {
            var results = that.results;
            that.viewTop = Math.min(results.overlap, Math.max(results.ranking.length - that.viewSize, 0));
            that.invalidView = true;

            if (that.onSlidingWindowUpdate) {
                that.onSlidingWindowUpdate();
            }
            that.viewOperationEnd(callbackFn);
        }

        var results = this.results;
        if (this.viewTop + this.viewSize + offset > results.ranking.length) {
            if (results.bottom) {
                var orginalViewTop = this.viewTop;
                this.viewTop = Math.max(results.ranking.length - this.viewSize, 0);
                this.invalidView = this.invalidView || (this.viewTop !== orginalViewTop);
                this.viewOperationEnd(callbackFn);
            } else {
                this.getPageOffset(this.leaderboardManager.getTypes.below, this.viewTop + offset - 1, newResult, this.wrapViewOperationError(errorCallbackFn));
            }
            return true;
        }

        this.viewTop += offset;
        this.invalidView = true;
        this.viewOperationEnd(callbackFn);
        return true;
    };

    LeaderboardResult.prototype.pageUp = function (callbackFn, errorCallbackFn) {
        return this.moveUp(this.viewSize, callbackFn, errorCallbackFn);
    };

    LeaderboardResult.prototype.pageDown = function (callbackFn, errorCallbackFn) {
        return this.moveDown(this.viewSize, callbackFn, errorCallbackFn);
    };

    LeaderboardResult.prototype.scrollUp = function (callbackFn, errorCallbackFn) {
        return this.moveUp(1, callbackFn, errorCallbackFn);
    };

    LeaderboardResult.prototype.scrollDown = function (callbackFn, errorCallbackFn) {
        return this.moveDown(1, callbackFn, errorCallbackFn);
    };

    LeaderboardResult.prototype.getView = function () {
        if (this.invalidView) {
            var viewTop = this.viewTop;
            var viewSize = this.viewSize;
            var results = this.results;
            var ranking = results.ranking;
            var rankingLength = ranking.length;

            var playerIndex = null;
            if (results.playerIndex !== undefined) {
                playerIndex = results.playerIndex - viewTop;
                if (playerIndex < 0 || playerIndex >= viewSize) {
                    playerIndex = null;
                }
            }

            this.view = {
                ranking: ranking.slice(viewTop, Math.min(viewTop + viewSize, rankingLength)),
                top: results.top && (viewTop === 0),
                bottom: results.bottom && (viewTop >= rankingLength - viewSize),
                player: results.player,
                playerIndex: playerIndex
            };
        }
        return this.view;
    };

    LeaderboardResult.prototype.getSlidingWindow = function () {
        return this.results;
    };

    LeaderboardResult.prototype.parseResults = function (key, spec, data) {
        var results = {
            spec: spec,
            overlap: null
        };

        var player = results.player = data.player;
        var ranking = results.ranking = data.ranking;

        var entities = data.entities;
        var playerUsername;

        if (player) {
            this.leaderboardManager.meta[key].bestScore = player.score;
            if (entities) {
                player.user = entities[player.user];
            }
            playerUsername = player.user.username;
        }

        var rankingLength = ranking.length;
        var i;
        for (i = 0; i < rankingLength; i += 1) {
            var rank = ranking[i];
            if (entities) {
                rank.user = entities[rank.user];
            }

            if (rank.user.username === playerUsername) {
                results.playerIndex = i;
            }
        }

        results.top = data.top;
        results.bottom = data.bottom;

        this.results = results;
        return results;
    };

    LeaderboardResult.create = function (leaderboardManager, key, spec, data) {
        var leaderboardResult = new LeaderboardResult();

        leaderboardResult.leaderboardManager = leaderboardManager;

        leaderboardResult.key = key;

        // patch up friendsOnly for frontend
        spec.friendsOnly = (0 != spec.friendsonly);
        delete spec.friendsonly;

        // store the original spec used to create the results
        leaderboardResult.originalSpec = spec;

        // the spec used to generate the current results
        leaderboardResult.spec = spec;

        var results = leaderboardResult.results = leaderboardResult.parseResults(key, spec, data);

        leaderboardResult.viewTop = 0;
        leaderboardResult.viewSize = spec.size;

        // lock to stop multiple synchronous view operations
        // as that will have unknown consequences
        leaderboardResult.viewLock = false;

        // for lazy evaluation
        leaderboardResult.view = {
            player: results.player,
            ranking: results.ranking,
            playerIndex: results.playerIndex,
            top: results.top,
            bottom: results.bottom
        };
        leaderboardResult.invalidView = false;

        // callback called when the results is requested
        leaderboardResult.onSlidingWindowUpdate = null;

        return leaderboardResult;
    };
    return LeaderboardResult;
})();

LeaderboardResult.prototype.version = 1;
LeaderboardResult.prototype.requestSize = 64;
// Copyright (c) 2011 Turbulenz Limited
;
;

;

;

;

;

var MappingTable = (function () {
    function MappingTable() {
    }
    MappingTable.prototype.getURL = function (assetPath, missingCallbackFn) {
        var overrides = this.overrides;
        var profile = this.currentProfile;
        var override = overrides[profile];

        var url;
        while (override) {
            url = override.urnmapping[assetPath];
            if (url) {
                return url;
            }

            override = overrides[override.parent];
        }

        url = this.urlMapping[assetPath];
        if (url) {
            return url;
        } else {
            if (missingCallbackFn) {
                missingCallbackFn(assetPath);
            }
            return (this.assetPrefix + assetPath);
        }
    };

    // Overides and previously set mapping
    MappingTable.prototype.setMapping = function (mapping) {
        this.urlMapping = mapping;
    };

    MappingTable.prototype.map = function (logicalPath, physicalPath) {
        this.urlMapping[logicalPath] = physicalPath;
    };

    MappingTable.prototype.alias = function (alias, logicalPath) {
        var urlMapping = this.urlMapping;
        urlMapping[alias] = urlMapping[logicalPath];
    };

    MappingTable.prototype.getCurrentProfile = function () {
        return this.currentProfile;
    };

    MappingTable.prototype.setProfile = function (profile) {
        if (this.overrides.hasOwnProperty(profile)) {
            this.currentProfile = profile;
        } else {
            this.currentProfile = undefined;
        }
    };

    MappingTable.create = function (params) {
        var mappingTable = new MappingTable();

        mappingTable.mappingTableURL = params.mappingTableURL;
        mappingTable.tablePrefix = params.mappingTablePrefix;
        mappingTable.assetPrefix = params.assetPrefix;
        mappingTable.overrides = {};

        mappingTable.errorCallbackFn = params.errorCallback || TurbulenzServices.defaultErrorCallback;
        mappingTable.currentProfile = TurbulenzEngine.getSystemInfo().platformProfile;

        var onMappingTableLoad = function onMappingTableLoadFn(tableData) {
            var urlMapping = tableData.urnmapping || tableData.urnremapping || {};
            var overrides = tableData.overrides || {};

            mappingTable.urlMapping = urlMapping;
            mappingTable.overrides = overrides;

            // Prepend all the mapped physical paths with the asset server
            var tablePrefix = mappingTable.tablePrefix;
            if (tablePrefix) {
                var appendPrefix = function appendPrefix(map) {
                    var source;
                    for (source in map) {
                        if (map.hasOwnProperty(source)) {
                            map[source] = tablePrefix + map[source];
                        }
                    }
                };

                // Apply the prefix to the main runmapping table, and
                // any override tables.
                appendPrefix(urlMapping);
                var o;
                for (o in overrides) {
                    if (overrides.hasOwnProperty(o)) {
                        appendPrefix(overrides[o].urnmapping);
                    }
                }
            }

            params.onload(mappingTable);
        };

        if (!mappingTable.mappingTableURL) {
            if (params.mappingTableData) {
                TurbulenzEngine.setTimeout(function () {
                    onMappingTableLoad(JSON.parse(params.mappingTableData));
                }, 0);
            } else {
                TurbulenzEngine.setTimeout(function () {
                    mappingTable.errorCallbackFn("!! mappingtable params contain no url or data");
                }, 0);
            }
        } else {
            params.requestHandler.request({
                src: mappingTable.mappingTableURL,
                onload: function jsonifyResponse(jsonResponse, status) {
                    if (status === 200) {
                        var obj = JSON.parse(jsonResponse);
                        onMappingTableLoad(obj);
                    } else {
                        mappingTable.urlMapping = {};
                        jsonResponse = jsonResponse || { msg: "(no response)" };
                        mappingTable.errorCallbackFn("MappingTable.create: HTTP status " + status + ": " + jsonResponse.msg, status);
                    }
                }
            });
        }

        return mappingTable;
    };
    MappingTable.version = 1;
    return MappingTable;
})();
// Copyright (c) 2011-2012 Turbulenz Limited
/*global TurbulenzEngine: false*/
/*global TurbulenzServices: false*/
/*global TurbulenzBridge: false*/
/*global Utilities: false*/
//
// API
//
var MultiPlayerSession = (function () {
    function MultiPlayerSession() {
    }
    // Public API
    MultiPlayerSession.prototype.sendTo = function (destinationID, messageType, messageData) {
        var packet = (destinationID + ':' + messageType + ':');
        if (messageData) {
            packet += messageData;
        }

        var socket = this.socket;
        if (socket) {
            socket.send(packet);
        } else {
            this.queue.push(packet);
        }
    };

    MultiPlayerSession.prototype.sendToGroup = function (destinationIDs, messageType, messageData) {
        var packet = (destinationIDs.join(',') + ':' + messageType + ':');
        if (messageData) {
            packet += messageData;
        }

        var socket = this.socket;
        if (socket) {
            socket.send(packet);
        } else {
            this.queue.push(packet);
        }
    };

    MultiPlayerSession.prototype.sendToAll = function (messageType, messageData) {
        var packet = (':' + messageType + ':');
        if (messageData) {
            packet += messageData;
        }

        var socket = this.socket;
        if (socket) {
            socket.send(packet);
        } else {
            this.queue.push(packet);
        }
    };

    MultiPlayerSession.prototype.makePublic = function (callbackFn) {
        var sessionId = this.sessionId;
        this.service.request({
            url: '/api/v1/multiplayer/session/make-public',
            method: 'POST',
            data: { 'session': sessionId },
            callback: function () {
                TurbulenzBridge.triggerMultiplayerSessionMakePublic(sessionId);
                if (callbackFn) {
                    callbackFn.call(arguments);
                }
            },
            requestHandler: this.requestHandler
        });
    };

    MultiPlayerSession.prototype.destroy = function (callbackFn) {
        var sessionId = this.sessionId;
        if (sessionId) {
            this.sessionId = null;

            var playerId = this.playerId;
            this.playerId = null;

            var gameSessionId = this.gameSessionId;
            this.gameSessionId = null;

            var socket = this.socket;
            if (socket) {
                this.socket = null;

                socket.onopen = null;
                socket.onmessage = null;
                socket.onclose = null;
                socket.onerror = null;

                socket.close();
                socket = null;
            }

            this.queue = null;

            this.onmessage = null;
            this.onclose = null;

            // we can't wait for the callback as the browser doesn't
            // call async callbacks after onbeforeunload has been called
            TurbulenzBridge.triggerLeaveMultiplayerSession(sessionId);

            Utilities.ajax({
                url: '/api/v1/multiplayer/session/leave',
                method: 'POST',
                data: {
                    'session': sessionId,
                    'player': playerId,
                    'gameSessionId': gameSessionId
                },
                callback: callbackFn,
                requestHandler: this.requestHandler
            });
        } else {
            if (callbackFn) {
                TurbulenzEngine.setTimeout(callbackFn, 0);
            }
        }
    };

    MultiPlayerSession.prototype.connected = function () {
        return (!!this.socket);
    };

    // Private API
    MultiPlayerSession.prototype.flushQueue = function () {
        var socket = this.socket;
        var queue = this.queue;
        var numPackets = queue.length;
        for (var n = 0; n < numPackets; n += 1) {
            socket.send(queue[n]);
        }
    };

    MultiPlayerSession.create = //
    // Constructor
    //
    function (sessionData, createdCB, errorCB) {
        var ms = new MultiPlayerSession();
        ms.sessionId = sessionData.sessionid;
        ms.playerId = sessionData.playerid;
        ms.gameSessionId = sessionData.gameSessionId;
        ms.socket = null;
        ms.queue = [];
        ms.onmessage = null;
        ms.onclose = null;
        ms.requestHandler = sessionData.requestHandler;
        ms.service = TurbulenzServices.getService('multiplayer');

        var numplayers = sessionData.numplayers;

        var serverURL = sessionData.server;

        var socket;

        sessionData = null;

        var multiPlayerOnMessage = function multiPlayerOnMessageFn(packet) {
            var onmessage = ms.onmessage;
            if (onmessage) {
                var message = packet.data;
                var firstSplitIndex = message.indexOf(':');
                var secondSplitIndex = message.indexOf(':', (firstSplitIndex + 1));
                var senderID = message.slice(0, firstSplitIndex);

                /*jshint bitwise:false*/
                // The |0 ensures 'messageType' is an integer
                var messageType = (message.slice((firstSplitIndex + 1), secondSplitIndex) | 0);

                /*jshint bitwise:true*/
                var messageData = message.slice(secondSplitIndex + 1);

                onmessage(senderID, messageType, messageData);
            }
        };

        var multiPlayerConnect = function multiPlayerConnectFn() {
            var multiPlayerConnectionError = function multiPlayerConnectionErrorFn() {
                if (!socket) {
                    socket = ms.socket;
                }

                ms.socket = null;

                if (socket) {
                    socket.onopen = null;
                    socket.onmessage = null;
                    socket.onclose = null;
                    socket.onerror = null;
                    socket = null;
                }

                // current server URL does not respond, ask for a new one
                var requestCallback = function requestCallbackFn(jsonResponse, status) {
                    if (status === 200) {
                        var reconnectData = jsonResponse.data;
                        numplayers = reconnectData.numplayers;
                        serverURL = reconnectData.server;
                        ms.sessionId = reconnectData.sessionid;
                        ms.playerId = reconnectData.playerid;

                        TurbulenzEngine.setTimeout(multiPlayerConnect, 0);
                    } else {
                        if (errorCB) {
                            errorCB("MultiPlayerSession failed: Server not available", 0);
                            errorCB = null;
                            createdCB = null;
                        } else {
                            var onclose = ms.onclose;
                            if (onclose) {
                                ms.onclose = null;
                                onclose();
                            }
                        }
                    }
                };

                ms.service.request({
                    url: '/api/v1/multiplayer/session/join',
                    method: 'POST',
                    data: {
                        'session': ms.sessionId,
                        'gameSessionId': ms.gameSessionId
                    },
                    callback: requestCallback,
                    requestHandler: ms.requestHandler
                });
            };

            try  {
                var nd = TurbulenzEngine.getNetworkDevice();
                if (!nd) {
                    nd = TurbulenzEngine.createNetworkDevice({});
                }

                socket = nd.createWebSocket(serverURL);

                socket.onopen = function multiPlayerOnOpen() {
                    ms.socket = socket;

                    socket.onopen = null;

                    socket.onmessage = multiPlayerOnMessage;

                    socket = null;

                    ms.flushQueue();

                    TurbulenzBridge.triggerJoinedMultiplayerSession({
                        sessionId: ms.sessionId,
                        playerId: ms.playerId,
                        serverURL: serverURL,
                        numplayers: numplayers
                    });

                    if (createdCB) {
                        createdCB(ms, numplayers);
                        createdCB = null;
                        errorCB = null;
                    }
                };

                socket.onclose = socket.onerror = multiPlayerConnectionError;
            } catch (exc) {
                multiPlayerConnectionError();
            }
        };

        multiPlayerConnect();

        return ms;
    };
    MultiPlayerSession.version = 1;
    return MultiPlayerSession;
})();
// Copyright (c) 2012 Turbulenz Limited
/*global TurbulenzServices: false*/
/*global MultiPlayerSession: false*/
//
// API
//
var MultiPlayerSessionManager = (function () {
    function MultiPlayerSessionManager() {
    }
    // Public API
    MultiPlayerSessionManager.prototype.createSession = function (numSlots, sessionCreatedFn, errorCallbackFn) {
        var gameSession = this.gameSession;
        var gameSessionId = gameSession.gameSessionId;
        var requestHandler = this.requestHandler;
        var that = this;
        var request = {
            url: '/api/v1/multiplayer/session/create/' + gameSession.gameSlug,
            method: 'POST',
            data: {
                'slots': numSlots,
                'gameSessionId': gameSessionId
            },
            requestHandler: requestHandler
        };

        var successCallback = function successCallbackFn(jsonResponse) {
            var mpSession;
            var sessionData = jsonResponse.data;
            sessionData.requestHandler = requestHandler;
            sessionData.gameSessionId = gameSessionId;
            mpSession = MultiPlayerSession.create(sessionData, sessionCreatedFn, errorCallbackFn);
            that.sessionList.push(mpSession);
        };

        this.processRequest("createSession", request, successCallback, errorCallbackFn);
    };

    MultiPlayerSessionManager.prototype.getJoinRequestQueue = function () {
        return TurbulenzServices.multiplayerJoinRequestQueue;
    };

    MultiPlayerSessionManager.prototype.joinSession = function (sessionID, sessionJoinedFn, errorCallbackFn) {
        var gameSessionId = this.gameSession.gameSessionId;
        var requestHandler = this.requestHandler;
        var that = this;
        var request = {
            url: '/api/v1/multiplayer/session/join',
            method: 'POST',
            data: {
                'session': sessionID,
                'gameSessionId': gameSessionId
            },
            requestHandler: requestHandler
        };

        var successCallback = function successCallbackFn(jsonResponse) {
            var mpSession;
            var sessionData = jsonResponse.data;
            sessionData.requestHandler = requestHandler;
            sessionData.gameSessionId = gameSessionId;
            mpSession = MultiPlayerSession.create(sessionData, sessionJoinedFn, errorCallbackFn);
            that.sessionList.push(mpSession);
        };

        this.processRequest("joinSession", request, successCallback, errorCallbackFn);
    };

    MultiPlayerSessionManager.prototype.joinAnySession = function (sessionJoinedFn, failCallbackFn, errorCallbackFn) {
        var gameSession = this.gameSession;
        var gameSessionId = gameSession.gameSessionId;
        var requestHandler = this.requestHandler;
        var that = this;
        var request = {
            url: '/api/v1/multiplayer/session/join-any/' + gameSession.gameSlug,
            method: 'POST',
            data: {
                'gameSessionId': gameSessionId
            },
            requestHandler: requestHandler
        };

        var successCallback = function successCallbackFn(jsonResponse) {
            var sessionData = jsonResponse.data;
            var mpSession;

            if (sessionData.sessionid) {
                sessionData.requestHandler = requestHandler;
                sessionData.gameSessionId = gameSessionId;
                mpSession = MultiPlayerSession.create(sessionData, sessionJoinedFn, errorCallbackFn);
                that.sessionList.push(mpSession);
            } else {
                failCallbackFn();
            }
        };

        this.processRequest("joinAnySession", request, successCallback, errorCallbackFn);
    };

    MultiPlayerSessionManager.prototype.joinOrCreateSession = function (numSlots, sessionJoinCreatedFn, errorCallbackFn) {
        var that = this;
        var joinFailedCallback = function joinFailedCallbackFn() {
            that.createSession(numSlots, sessionJoinCreatedFn, errorCallbackFn);
        };

        this.joinAnySession(sessionJoinCreatedFn, joinFailedCallback, errorCallbackFn);
    };

    MultiPlayerSessionManager.prototype.getFriendsSessions = function (querySuccessFn, errorCallbackFn) {
        var requestHandler = this.requestHandler;

        var request = {
            url: '/api/v1/multiplayer/session/list/' + this.gameSession.gameSlug,
            method: 'GET',
            requestHandler: requestHandler
        };

        var successCallback = function successCallbackFn(jsonResponse) {
            querySuccessFn(jsonResponse.data);
        };

        this.processRequest("getFriendsSessions", request, successCallback, errorCallbackFn);
    };

    MultiPlayerSessionManager.prototype.destroy = function () {
        var sessionList = this.sessionList;
        var sessionListLength = sessionList.length;
        var i;
        for (i = 0; i < sessionListLength; i += 1) {
            sessionList[i].destroy();
        }

        delete this.sessionList;
    };

    // Helper Functions
    MultiPlayerSessionManager.prototype.processRequest = function (source, request, successFn, errorFn) {
        if (!errorFn) {
            errorFn = TurbulenzServices.defaultErrorCallback;
        }

        if (TurbulenzServices.available()) {
            request.callback = function requestCallbackFn(jsonResponse, status) {
                if (status === 200) {
                    successFn(jsonResponse);
                } else if (errorFn) {
                    errorFn("MultiPlayerSessionManager." + source + " error with HTTP status " + status + ": " + jsonResponse.msg, status);
                }
            };

            TurbulenzServices.getService('multiplayer').request(request);
        } else {
            if (errorFn) {
                errorFn(source + " failed: Service not available", 0);
            }
        }
    };

    MultiPlayerSessionManager.create = function (requestHandler, gameSession) {
        var manager = new MultiPlayerSessionManager();
        manager.requestHandler = requestHandler;
        manager.gameSession = gameSession;
        manager.sessionList = [];
        return manager;
    };
    return MultiPlayerSessionManager;
})();
// Copyright (c) 2011-2013 Turbulenz Limited
;

;

;

var NotificationPromise = (function () {
    function NotificationPromise(nm) {
        this.__successCallback = null;
        this.__errorCallback = null;
        this.__id = null;
        this.__error = null;
        this.__nm = null;
        this.__toCancel = false;
        this.__nm = nm;
    }
    NotificationPromise.prototype.success = function (callback) {
        this.__successCallback = callback;

        var id = this.__id;
        if (id) {
            TurbulenzEngine.setTimeout(function () {
                callback(id);
            }, 0);
        }
        return this;
    };

    NotificationPromise.prototype.error = function (callback) {
        this.__errorCallback = callback;

        var error = this.__error;
        if (error) {
            TurbulenzEngine.setTimeout(function () {
                callback(error);
            }, 0);
        }
        return this;
    };

    NotificationPromise.prototype.cancel = function () {
        this.__toCancel = true;

        var id = this.__id;
        if (id) {
            this.__nm.cancelNotificationByID(id);
        }
    };

    NotificationPromise.prototype.getId = function () {
        return this.__id;
    };

    NotificationPromise.prototype.callSuccess = function (id) {
        this.__id = id;
        if (this.__successCallback) {
            this.__successCallback(id);
        }
        if (this.__toCancel) {
            this.__nm.cancelNotificationByID(id);
        }
    };

    NotificationPromise.prototype.callError = function (error) {
        this.__error = error;

        if (this.__errorCallback) {
            this.__errorCallback(error);
        }
    };
    return NotificationPromise;
})();

//
var NotificationsManager = (function () {
    function NotificationsManager() {
        this.keys = [];
    }
    NotificationsManager.prototype._validateKey = function (params) {
        var key = params.key;
        if (!key || !this.keys[key]) {
            throw new Error('Unknown key "' + key + '" given.');
        }
        return key;
    };

    NotificationsManager.prototype._validateMsg = function (params) {
        var msg = params.msg;

        if (!msg) {
            throw new Error('No "msg" given.');
        } else if (!msg.text) {
            throw new Error('msg has no "text" attribute.');
        }

        return msg;
    };

    /*
    * Sends an instant notification to one or more recipients. params should be an object containing
    *
    * key: string, the key of notification to be sent. Must be specified in notifications.yaml
    * msg: string, (For now. This should really be decided soon
    *
    * optional:
    * recipient: string, the username of the player to receive this notification. Defaults to the current user
    *
    * returns a NotificationPromise-object. The promise exposes 'success' and 'error' functions which can be passed
    * corresponding callback-functions.
    */
    NotificationsManager.prototype.sendInstantNotification = function (params) {
        var key = this._validateKey(params);
        var msg = this._validateMsg(params);

        var token = this.tokenFactory.next();
        var promise = new NotificationPromise(this);

        this.notificationPromises[token] = promise;

        if (!params.recipient) {
            throw new Error('Notification recipient is null');
        }

        var params = {
            token: token,
            session: this.gameSession,
            key: key,
            msg: msg,
            recipient: params.recipient,
            noNotification: params.noNotification
        };

        TurbulenzBridge.triggerSendInstantNotification(JSON.stringify(params));

        return promise;
    };

    /*
    * Sends a notification to the current user. params should be an object containing
    *
    * key: string, the key of notification to be sent. Must be specified in notifications.yaml
    * msg: string, (For now. This should really be decided soon
    *
    * optional:
    * delay: number, delay in seconds until the notification is sent. Defaults to 0
    *
    * returns a NotificationPromise-object. The promise exposes 'success' and 'error' functions (which can be passed
    * corresponding callback-functions) as well as a 'cancel' function which can be used to cancel the notification
    * as long as it hasn't been delivered yet
    */
    NotificationsManager.prototype.sendDelayedNotification = function (params) {
        var key = this._validateKey(params);
        var msg = this._validateMsg(params);

        var delay = params.delay || 0;
        if (isNaN(delay)) {
            throw new Error('delay is not a number: "' + delay + '"');
        }

        var token = this.tokenFactory.next();
        var promise = new NotificationPromise(this);

        this.notificationPromises[token] = promise;

        var params = {
            token: token,
            session: this.gameSession,
            key: key,
            msg: msg,
            delay: delay,
            noNotification: params.noNotification
        };

        TurbulenzBridge.triggerSendDelayedNotification(JSON.stringify(params));

        return promise;
    };

    NotificationsManager.prototype.cancelNotificationByID = function (ident) {
        TurbulenzBridge.triggerCancelNotificationByID(JSON.stringify({
            id: ident,
            session: this.gameSession
        }));
    };

    NotificationsManager.prototype.cancelNotificationsByKey = function (key) {
        if (!this.keys[key]) {
            throw new Error('Unknown key "' + key + '" given.');
        }
        TurbulenzBridge.triggerCancelNotificationsByKey(JSON.stringify({
            key: key,
            session: this.gameSession
        }));
    };

    NotificationsManager.prototype.cancelAllNotifications = function () {
        TurbulenzBridge.triggerCancelAllNotifications(JSON.stringify({
            session: this.gameSession
        }));
    };

    NotificationsManager.prototype.addNotificationListener = function (key, listener) {
        var keyHandlers;

        if (this.handlers.hasOwnProperty(key)) {
            // Check handler is not already stored
            keyHandlers = this.handlers[key];
            var length = keyHandlers.length;
            for (var i = 0; i < length; i += 1) {
                if (keyHandlers[i] === listener) {
                    // Event handler has already been added
                    return;
                }
            }
        } else {
            keyHandlers = this.handlers[key] = [];
        }

        keyHandlers.push(listener);
    };

    NotificationsManager.prototype.removeNotificationListener = function (key, listener) {
        if (this.handlers.hasOwnProperty(key)) {
            var keyHandlers = this.handlers[key];
            var length = keyHandlers.length;
            for (var i = 0; i < length; i += 1) {
                if (keyHandlers[i] === listener) {
                    keyHandlers.splice(i, 1);
                    break;
                }
            }
        }
    };

    NotificationsManager.prototype.onNotificationReceived = function (data) {
        if (this.handlers.hasOwnProperty(data.key)) {
            var length = this.handlers[data.key].length;
            for (var i = 0; i < length; i += 1) {
                this.handlers[data.key][i](data);
            }
        }
    };

    NotificationsManager.prototype.onNotificationSent = function (data) {
        var token = data.token;
        var promise = this.notificationPromises[token];

        if (promise) {
            if (data.id) {
                promise.callSuccess(data.id);
            }
            if (data.error) {
                delete data.token;
                promise.callError(data);
            }
            delete this.notificationPromises[token];
        }
    };

    NotificationsManager.prototype.requestUserNotificationSettings = function (successCallback, errorCallback) {
        this.service.request({
            url: '/api/v1/game-notifications/usersettings/read/' + this.gameSession.gameSlug,
            method: 'GET',
            callback: function (jsonResponse, status) {
                if (status !== 200 || !jsonResponse.ok) {
                    errorCallback({
                        error: jsonResponse.msg,
                        status: status
                    });
                } else {
                    successCallback(jsonResponse.data);
                }
            },
            requestHandler: this.requestHandler
        });
    };

    NotificationsManager.prototype.requestGameNotificationKeys = function (successCallback, errorCallback) {
        var that = this;
        this.service.request({
            url: '/api/v1/game-notifications/keys/read/' + this.gameSession.gameSlug,
            method: 'GET',
            callback: function (jsonResponse, status) {
                var data = jsonResponse.data;

                if (status !== 200 || !data.keys) {
                    errorCallback(data);
                } else {
                    that.keys = data.keys;
                    successCallback(data);
                }
            },
            requestHandler: this.requestHandler
        });
    };

    NotificationsManager.prototype.onInit = function () {
        this.ready = true;
        TurbulenzBridge.triggerInitNotificationManager(JSON.stringify({
            session: this.gameSession
        }));
    };

    NotificationsManager.create = function (requestHandler, gameSession, successCallbackFn, errorCallbackFn) {
        if (!errorCallbackFn) {
            errorCallbackFn = function () {
            };
        }

        if (!TurbulenzServices.available()) {
            debug.log("notificationsManagerCreateFn: !! TurbulenzServices not available");

            // Call error callback on a timeout to get the same behaviour as the ajax call
            TurbulenzEngine.setTimeout(function () {
                errorCallbackFn({
                    status: null,
                    error: 'TurbulenzServices.createNotificationsManager requires Turbulenz services'
                });
            }, 0);
            return null;
        }

        var notificationsManager = new NotificationsManager();

        notificationsManager.gameSession = gameSession;
        notificationsManager.handlers = {};

        notificationsManager.tokenFactory = SessionToken.create();
        notificationsManager.notificationPromises = {};
        TurbulenzBridge.setOnNotificationSent(function (data) {
            notificationsManager.onNotificationSent.call(notificationsManager, data);
        });

        TurbulenzBridge.setOnReceiveNotification(function (data) {
            notificationsManager.onNotificationReceived.call(notificationsManager, data);
        });

        notificationsManager.service = TurbulenzServices.getService('notifications');
        notificationsManager.requestHandler = requestHandler;

        notificationsManager.ready = false;

        notificationsManager.requestGameNotificationKeys(function () {
            notificationsManager.requestUserNotificationSettings(function () {
                notificationsManager.onInit();

                if (successCallbackFn) {
                    successCallbackFn(notificationsManager);
                }
            }, errorCallbackFn);
        }, errorCallbackFn);

        return notificationsManager;
    };
    NotificationsManager.version = 1;
    return NotificationsManager;
})();
// Copyright (c) 2011 Turbulenz Limited
;

var OSD = (function () {
    function OSD() {
    }
    OSD.prototype.startLoading = function () {
        try  {
            var doc = this.topLevelDocument;
            if (doc && doc.osdStartLoading) {
                doc.osdStartLoading();
            }
        } catch (exception) {
        }
    };

    OSD.prototype.startSaving = function () {
        try  {
            var doc = this.topLevelDocument;
            if (doc && doc.osdStartSaving) {
                doc.osdStartSaving();
            }
        } catch (exception) {
        }
    };

    OSD.prototype.stopLoading = function () {
        try  {
            var doc = this.topLevelDocument;
            if (doc && doc.osdStopLoading) {
                doc.osdStopLoading();
            }
        } catch (exception) {
        }
    };

    OSD.prototype.stopSaving = function () {
        try  {
            var doc = this.topLevelDocument;
            if (doc && doc.osdStopSaving) {
                doc.osdStopSaving();
            }
        } catch (exception) {
        }
    };

    OSD.create = // Constructor function
    function (/* args */ ) {
        var osdObject = new OSD();

        var topLevelWindow = window;
        var counter = 15;
        while (topLevelWindow.parent !== topLevelWindow && counter > 0) {
            topLevelWindow = topLevelWindow.parent;
            counter -= 1;
        }
        osdObject.topLevelDocument = (topLevelWindow.document);
        return osdObject;
    };
    OSD.version = 1;
    return OSD;
})();
// Copyright (c) 2012 Turbulenz Limited
/*global TurbulenzEngine: false*/
//
// SessionToken
//
var SessionToken = (function () {
    function SessionToken() {
        this.randomMax = Math.pow(2, 32);
    }
    SessionToken.prototype.next = function () {
        this.counter += 1;
        var count = this.counter;
        var random = Math.random() * this.randomMax;
        var bytes = this.bytes;

        /*jshint bitwise: false*/
        bytes[0] = random & 0x000000FF;
        bytes[1] = (random & 0x0000FF00) >>> 8;
        bytes[2] = (random & 0x00FF0000) >>> 16;
        bytes[3] = (random & 0xFF000000) >>> 24;

        // only bother using the bottom 16 bytes of count (wraps at 65536)
        // this means that we fit into 8 base64 characters exactly (no extra padding)
        bytes[4] = count & 0x000000FF;
        bytes[5] = (count & 0x0000FF00) >>> 8;

        /*jshint bitwise: true*/
        return TurbulenzEngine.base64Encode(bytes);
    };

    SessionToken.create = function () {
        var sessionToken = new SessionToken();

        sessionToken.counter = 0;

        // TODO use the new random number generator
        sessionToken.randomGenerator = null;
        sessionToken.bytes = [];

        return sessionToken;
    };
    SessionToken.version = 1;
    return SessionToken;
})();
// Copyright (c) 2011-2013 Turbulenz Limited
;

;

;

;

;

;

;

//
// StoreManager
//
var StoreManager = (function () {
    function StoreManager() {
    }
    StoreManager.prototype.requestUserItems = function (callbackFn, errorCallbackFn) {
        var that = this;

        var requestUserItemsCallback = function requestUserItemsCallbackFn(jsonResponse, status) {
            if (status === 200) {
                that.userItems = jsonResponse.data.userItems;
                if (callbackFn) {
                    callbackFn(jsonResponse.userItems);
                }
            } else {
                var errorCallback = errorCallbackFn || that.errorCallbackFn;
                if (errorCallback) {
                    errorCallback("StoreManager.requestUserItems failed with " + "status " + status + ": " + jsonResponse.msg, status, that.requestUserItems, [callbackFn, errorCallbackFn]);
                }
            }
        };

        var dataSpec = {
            // replay attack token
            token: this.userItemsRequestToken.next(),
            gameSessionId: this.gameSessionId
        };

        this.service.request({
            url: '/api/v1/store/user/items/read/' + this.gameSession.gameSlug,
            method: 'GET',
            data: dataSpec,
            callback: requestUserItemsCallback,
            requestHandler: this.requestHandler,
            encrypt: true
        });
    };

    StoreManager.prototype.getUserItems = function () {
        return this.userItems;
    };

    StoreManager.prototype.getItemsSortedDict = function (items) {
        // sort items by index and add keys to item objects
        var itemsArray = [];
        var sortedItemsDict = {};

        var itemKey;
        var item;
        for (itemKey in items) {
            if (items.hasOwnProperty(itemKey)) {
                item = items[itemKey];
                item.key = itemKey;
                itemsArray[item.index] = item;
            }
        }

        var i;
        var itemsLength = itemsArray.length;
        for (i = 0; i < itemsLength; i += 1) {
            item = itemsArray[i];
            sortedItemsDict[item.key] = item;
        }

        return sortedItemsDict;
    };

    StoreManager.prototype.getOfferings = function () {
        return this.getItemsSortedDict(this.offerings);
    };

    StoreManager.prototype.getResources = function () {
        return this.getItemsSortedDict(this.resources);
    };

    // backwards compatibility
    StoreManager.prototype.getItems = function () {
        return this.getOfferings();
    };

    StoreManager.prototype.updateBasket = function (callback) {
        var token = null;
        if (callback) {
            token = this.basketUpdateRequestToken.next();
            this.updateBasketCallbacks[token] = callback;
        }
        var that = this;
        TurbulenzEngine.setTimeout(function yieldOnUpdate() {
            TurbulenzBridge.triggerBasketUpdate(JSON.stringify({
                basketItems: that.basket.items,
                token: token
            }));
        }, 0);
    };

    StoreManager.prototype.addToBasket = function (key, amount) {
        var offering = this.offerings[key];
        if (!offering || !offering.available || Math.floor(amount) !== amount || amount <= 0) {
            return false;
        }

        var resources = this.resources;
        function isOwnOffering(offering) {
            var outputKey;
            var output = offering.output;
            for (outputKey in output) {
                if (output.hasOwnProperty(outputKey)) {
                    if (resources[outputKey].type !== 'own') {
                        return false;
                    }
                }
            }
            return true;
        }

        var userItems = this.userItems;
        function allOutputOwned(offering) {
            var outputKey;
            var output = offering.output;
            for (outputKey in output) {
                if (output.hasOwnProperty(outputKey)) {
                    if (!userItems.hasOwnProperty(outputKey) || userItems[outputKey].amount === 0) {
                        return false;
                    }
                }
            }
            return true;
        }

        var basketItems = this.basket.items;
        var oldBasketAmount = 0;
        if (basketItems[key]) {
            oldBasketAmount = basketItems[key].amount;
        } else {
            oldBasketAmount = 0;
        }
        var newBasketAmount = oldBasketAmount + amount;
        var ownOffering = isOwnOffering(offering);
        if (ownOffering && newBasketAmount > 1) {
            newBasketAmount = 1;
            if (oldBasketAmount === 1) {
                // no change made so return false
                return false;
            }
        }
        if (newBasketAmount <= 0 || (ownOffering && allOutputOwned(offering))) {
            return false;
        }

        basketItems[key] = { amount: newBasketAmount };
        return true;
    };

    StoreManager.prototype.removeFromBasket = function (key, amount) {
        if (!this.offerings[key] || Math.floor(amount) !== amount || amount <= 0) {
            return false;
        }
        var basketItem = this.basket.items[key];
        if (!basketItem || basketItem.amount <= 0) {
            return false;
        }

        var newAmount = basketItem.amount - amount;
        if (newAmount <= 0) {
            delete this.basket.items[key];
        } else {
            this.basket.items[key] = { amount: newAmount };
        }
        return true;
    };

    StoreManager.prototype.emptyBasket = function () {
        this.basket.items = {};
    };

    StoreManager.prototype.isBasketEmpty = function () {
        var key;
        var basketItems = this.basket.items;
        for (key in basketItems) {
            if (basketItems.hasOwnProperty(key) && basketItems[key].amount > 0) {
                return false;
            }
        }
        return true;
    };

    StoreManager.prototype.showConfirmPurchase = function () {
        if (this.isBasketEmpty()) {
            return false;
        }
        this.updateBasket(function showConfirmPurchaseBasketUpdate() {
            TurbulenzBridge.triggerShowConfirmPurchase();
        });
        return true;
    };

    StoreManager.prototype.consume = function (key, consumeAmount, callbackFn, errorCallbackFn) {
        var that = this;
        var consumeItemsCallback = function consumeItemsCallbackFn(jsonResponse, status) {
            if (status === 200) {
                that.userItems = jsonResponse.data.userItems;
                if (callbackFn) {
                    callbackFn(jsonResponse.data.consumed);
                }

                TurbulenzBridge.triggerUserStoreUpdate(JSON.stringify(that.userItems));
            } else {
                var errorCallback = errorCallbackFn || that.errorCallbackFn;
                if (errorCallback) {
                    errorCallback("StoreManager.consume failed with status " + status + ": " + jsonResponse.msg, status, that.consume, [callbackFn, errorCallbackFn]);
                }
            }
        };

        var dataSpec = {
            // replay attack token
            token: this.consumeRequestToken.next(),
            gameSessionId: this.gameSessionId,
            key: key,
            consume: consumeAmount
        };

        this.service.request({
            url: '/api/v1/store/user/items/consume',
            method: 'POST',
            data: dataSpec,
            callback: consumeItemsCallback,
            requestHandler: this.requestHandler,
            encrypt: true
        });
    };

    StoreManager.create = function (requestHandler, gameSession, storeMetaReceived, errorCallbackFn) {
        if (!TurbulenzServices.available()) {
            debug.log("storeManagerCreateFn: !! TurbulenzServices not available");

            // Call error callback on a timeout to get the same behaviour as the ajax call
            TurbulenzEngine.setTimeout(function () {
                if (errorCallbackFn) {
                    errorCallbackFn('TurbulenzServices.createStoreManager ' + 'requires Turbulenz services');
                }
            }, 0);
            return null;
        }

        var storeManager = new StoreManager();

        storeManager.gameSession = gameSession;
        storeManager.gameSessionId = gameSession.gameSessionId;
        storeManager.errorCallbackFn = errorCallbackFn || TurbulenzServices.defaultErrorCallback;
        storeManager.service = TurbulenzServices.getService('store');
        storeManager.requestHandler = requestHandler;

        storeManager.userItemsRequestToken = SessionToken.create();
        storeManager.basketUpdateRequestToken = SessionToken.create();
        storeManager.consumeRequestToken = SessionToken.create();

        storeManager.ready = false;

        storeManager.offerings = null;
        storeManager.resources = null;
        storeManager.basket = null;
        storeManager.userItems = null;

        var calledMetaReceived = false;
        function checkMetaReceived() {
            if (!calledMetaReceived && storeManager.offerings !== null && storeManager.resources !== null && storeManager.basket !== null && storeManager.userItems !== null) {
                if (storeMetaReceived) {
                    storeMetaReceived(storeManager);
                }
                storeManager.ready = true;
                calledMetaReceived = true;
            }
        }

        storeManager.requestUserItems(checkMetaReceived);

        storeManager.onBasketUpdate = null;
        storeManager.updateBasketCallbacks = {};
        var onBasketUpdate = function onBasketUpdateFn(jsonParams) {
            var basket = (JSON.parse(jsonParams));
            var token;
            if (basket.token) {
                token = basket.token;
                delete basket.token;
            }

            storeManager.basket = basket;
            if (token && storeManager.updateBasketCallbacks.hasOwnProperty(token)) {
                storeManager.updateBasketCallbacks[token]();
                delete storeManager.updateBasketCallbacks[token];
            }
            if (storeManager.onBasketUpdate) {
                storeManager.onBasketUpdate(basket);
            }

            checkMetaReceived();
        };
        TurbulenzBridge.setOnBasketUpdate(onBasketUpdate);
        TurbulenzBridge.triggerBasketUpdate();

        var onStoreMeta = function onStoreMetaFn(jsonMeta) {
            var meta = (JSON.parse(jsonMeta));
            storeManager.currency = meta.currency;
            storeManager.offerings = meta.items || meta.offerings;
            storeManager.resources = meta.resources;
            checkMetaReceived();
        };
        TurbulenzBridge.setOnStoreMeta(onStoreMeta);
        TurbulenzBridge.triggerFetchStoreMeta();

        storeManager.onSitePurchaseConfirmed = null;
        function onSitePurchaseConfirmed() {
            function gotNewItems() {
                if (storeManager.onSitePurchaseConfirmed) {
                    storeManager.onSitePurchaseConfirmed();
                }
            }
            storeManager.requestUserItems(gotNewItems);
        }
        ;
        TurbulenzBridge.setOnPurchaseConfirmed(onSitePurchaseConfirmed);

        storeManager.onSitePurchaseRejected = null;
        var onSitePurchaseRejected = function onSitePurchaseRejectedFn() {
            if (storeManager.onSitePurchaseRejected) {
                storeManager.onSitePurchaseRejected();
            }
        };
        TurbulenzBridge.setOnPurchaseRejected(onSitePurchaseRejected);

        return storeManager;
    };
    StoreManager.version = 1;
    return StoreManager;
})();
// Copyright (c) 2011-2013 Turbulenz Limited
/*global window: false*/
/*global TurbulenzServices: false*/
/*global debug: false*/
/*jshint nomen: false*/
/*
* An object that takes care of communication with the gamesite and, among
* other things, replaces the deprecated 'osdlib' module.
*
* It wraps an EventEmitter instance that is stored on the page and provides
* methods that manually display the 'loading'-flag, post certain events to
* the page or request information about a player's settings.
*/
var TurbulenzBridge = (function () {
    function TurbulenzBridge() {
    }
    TurbulenzBridge._initInstance = /**
    * Try to find an 'EventEmitter' object on the page and cache it.
    */
    function () {
        var Turbulenz = window.top.Turbulenz;

        if (Turbulenz && Turbulenz.Services) {
            var bridge = Turbulenz.Services.bridge;
            if (!bridge) {
                return;
            }

            this._bridge = bridge;

            this.emit = bridge.emit;

            // TODO can remove all of these or's after gamesite and hub updates
            this.on = bridge.gameListenerOn || bridge.addListener || bridge.setListener;

            // we cant use off yet because the function received on the other VM is re-wrapped each time
            // this.off = bridge.gameListenerOff;
            // Legacy functions addListener/setListener
            this.addListener = bridge.gameListenerOn || bridge.addListener || bridge.setListener;
            this.setListener = bridge.gameListenerOn || bridge.setListener;
        } else {
            debug.log("No turbulenz services");
        }

        if (typeof TurbulenzServices !== 'undefined') {
            TurbulenzServices.addBridgeEvents();
        }
    };

    TurbulenzBridge.isInitialised = function () {
        return (this._bridge !== undefined);
    };

    TurbulenzBridge.emit = function (serviceName, request, arg) {
    };

    TurbulenzBridge.on = function (serviceName, cb) {
    };

    TurbulenzBridge.addListener = //off: function offFn() {},
    function () {
    };

    TurbulenzBridge.setListener = function (eventName, listener) {
    };

    TurbulenzBridge.setOnReceiveConfig = /**
    * Message that passes game configuration information from the hosting site
    */
    function (callback) {
        this.on('config.set', callback);
    };

    TurbulenzBridge.triggerRequestConfig = function () {
        this.emit('config.request');
    };

    TurbulenzBridge.startLoading = /**
    * Methods to signal the beginning and end of load/save processes.
    * This will display hints to the player and helps the page
    * to prioritize resources.
    */
    function () {
        this.emit('status.loading.start');
    };

    TurbulenzBridge.startSaving = function () {
        this.emit('status.saving.start');
    };

    TurbulenzBridge.stopLoading = function () {
        this.emit('status.loading.stop');
    };

    TurbulenzBridge.stopSaving = function () {
        this.emit('status.saving.stop');
    };

    TurbulenzBridge.createdGameSession = /**
    * These methods tell the gamesite the gameSession so it can
    * emit a heartbeat for the message server to detect.
    * gameSessionId - A string for identifying the current game session
    */
    function (gameSessionId) {
        this.emit('game.session.created', gameSessionId);
    };

    TurbulenzBridge.destroyedGameSession = function (gameSessionId) {
        this.emit('game.session.destroyed', gameSessionId);
    };

    TurbulenzBridge.setGameSessionStatus = function (gameSessionId, status) {
        this.emit('game.session.status', gameSessionId, status);
    };

    TurbulenzBridge.setGameSessionInfo = function (info) {
        this.emit('game.session.info', info);
    };

    TurbulenzBridge.updateUserBadge = /**
    * Update a userbadge. Used by the BadgeManager
    */
    function (badge) {
        this.emit('userbadge.update', badge);
    };

    TurbulenzBridge.updateLeaderBoard = /**
    * Update a leaderboard. Used by the LeaderboardManager
    */
    function (scoreData) {
        this.emit('leaderboards.update', scoreData);
    };

    TurbulenzBridge.setOnMultiplayerSessionToJoin = /**
    * Handle multiplayer join events
    */
    function (callback) {
        this.on('multiplayer.session.join', callback);
    };

    TurbulenzBridge.triggerJoinedMultiplayerSession = function (session) {
        this.emit('multiplayer.session.joined', session);
    };

    TurbulenzBridge.triggerLeaveMultiplayerSession = function (sessionId) {
        this.emit('multiplayer.session.leave', sessionId);
    };

    TurbulenzBridge.triggerMultiplayerSessionMakePublic = function (sessionId) {
        this.emit('multiplayer.session.makepublic', sessionId);
    };

    TurbulenzBridge.setOnBasketUpdate = /**
    * Handle store basket events
    */
    function (callback) {
        this.on('basket.site.update', callback);
    };

    TurbulenzBridge.triggerBasketUpdate = function (basket) {
        this.emit('basket.game.update.v2', basket);
    };

    TurbulenzBridge.triggerUserStoreUpdate = function (items) {
        this.emit('store.user.update', items);
    };

    TurbulenzBridge.setOnPurchaseConfirmed = function (callback) {
        this.on('purchase.confirmed', callback);
    };

    TurbulenzBridge.setOnPurchaseRejected = function (callback) {
        this.on('purchase.rejected', callback);
    };

    TurbulenzBridge.triggerShowConfirmPurchase = function () {
        this.emit('purchase.show.confirm');
    };

    TurbulenzBridge.triggerFetchStoreMeta = function () {
        this.emit('fetch.store.meta');
    };

    TurbulenzBridge.setOnStoreMeta = function (callback) {
        this.on('store.meta.v2', callback);
    };

    TurbulenzBridge.triggerSendInstantNotification = /**
    * Handle in-game notification events
    */
    function (notification) {
        this.emit('notifications.ingame.sendInstant', notification);
    };

    TurbulenzBridge.triggerSendDelayedNotification = function (notification) {
        this.emit('notifications.ingame.sendDelayed', notification);
    };

    TurbulenzBridge.setOnNotificationSent = function (callback) {
        this.on('notifications.ingame.sent', callback);
    };

    TurbulenzBridge.triggerCancelNotificationByID = function (params) {
        this.emit('notifications.ingame.cancelByID', params);
    };

    TurbulenzBridge.triggerCancelNotificationsByKey = function (params) {
        this.emit('notifications.ingame.cancelByKey', params);
    };

    TurbulenzBridge.triggerCancelAllNotifications = function (params) {
        this.emit('notifications.ingame.cancelAll', params);
    };

    TurbulenzBridge.triggerInitNotificationManager = function (params) {
        this.emit('notifications.ingame.initNotificationManager', params);
    };

    TurbulenzBridge.setOnReceiveNotification = function (callback) {
        this.on('notifications.ingame.receive', callback);
    };

    TurbulenzBridge.changeAspectRatio = /**
    * Methods to signal changes of the viewport's aspect ratio to the page.
    */
    function (ratio) {
        this.emit('change.viewport.ratio', ratio);
    };

    TurbulenzBridge.setOnViewportHide = /**
    * Methods to set callbacks to react to events happening on the page.
    */
    function (callback) {
        this.on('change.viewport.hide', callback);
    };

    TurbulenzBridge.setOnViewportShow = function (callback) {
        this.on('change.viewport.show', callback);
    };

    TurbulenzBridge.setOnFullscreenOn = function (callback) {
        this.on('change.viewport.fullscreen.on', callback);
    };

    TurbulenzBridge.setOnFullscreenOff = function (callback) {
        this.on('change.viewport.fullscreen.off', callback);
    };

    TurbulenzBridge.setOnMenuStateChange = function (callback) {
        this.on('change.menu.state', callback);
    };

    TurbulenzBridge.setOnUserStateChange = function (callback) {
        this.on('change.user.state', callback);
    };

    TurbulenzBridge.triggerOnFullscreen = /**
    * Methods to send trigger event-emission on the page. These
    * prompt the page to trigger the aforementioned corresponding
    * onXXXX methods.
    */
    function () {
        this.emit('trigger.viewport.fullscreen');
    };

    TurbulenzBridge.triggerOnViewportVisibility = function () {
        this.emit('trigger.viewport.visibility');
    };

    TurbulenzBridge.triggerOnMenuStateChange = function () {
        this.emit('trigger.menu.state');
    };

    TurbulenzBridge.triggerOnUserStateChange = function () {
        this.emit('trigger.user.state');
    };

    TurbulenzBridge.queryFullscreen = /**
    * Methods to send requests for information to the page. These
    * methods can be used to send state-queries. They take a callback
    * function and prompt the page to call it.
    */
    /**
    * callback - a function that takes a single boolean value that
    * will be set to 'true' if the viewport is in fullscreen.
    */
    function (callback) {
        this.emit('query.viewport.fullscreen', callback);
    };

    TurbulenzBridge.queryViewportVisibility = /**
    * callback - a function that takes a single boolean value that
    * will be set to 'true' if the viewport is visible.
    */
    function (callback) {
        this.emit('query.viewport.visibility', callback);
    };

    TurbulenzBridge.queryMenuState = /**
    * callback - a function that takes an object-representation of
    * the current menu-state.
    */
    function (callback) {
        this.emit('query.menu.state', callback);
    };

    TurbulenzBridge.queryUserState = /**
    * callback - a function that takes an object-representation of
    * the current state of the user's settings.
    */
    function (callback) {
        this.emit('query.user.state', callback);
    };
    TurbulenzBridge._bridge = undefined;
    return TurbulenzBridge;
})();

if (!TurbulenzBridge.isInitialised()) {
    TurbulenzBridge._initInstance();
}
// Copyright (c) 2011-2013 Turbulenz Limited
;

;

var CustomMetricEvent = (function () {
    function CustomMetricEvent() {
    }
    CustomMetricEvent.create = function () {
        return new CustomMetricEvent();
    };
    return CustomMetricEvent;
})();
;

var CustomMetricEventBatch = (function () {
    function CustomMetricEventBatch() {
    }
    CustomMetricEventBatch.prototype.push = function (key, value) {
        var event = CustomMetricEvent.create();
        event.key = key;
        event.value = value;
        event.timeOffset = TurbulenzEngine.time;
        this.events.push(event);
    };

    CustomMetricEventBatch.prototype.length = function () {
        return this.events.length;
    };

    CustomMetricEventBatch.prototype.clear = function () {
        this.events.length = 0;
    };

    CustomMetricEventBatch.create = function () {
        var batch = new CustomMetricEventBatch();
        batch.events = [];
        return batch;
    };
    return CustomMetricEventBatch;
})();
;

;

;

// -----------------------------------------------------------------------------
// ServiceRequester
// -----------------------------------------------------------------------------
var ServiceRequester = (function () {
    function ServiceRequester() {
    }
    // make a request if the service is available. Same parameters as an
    // Utilities.ajax call with extra argument:
    //     neverDiscard - Never discard the request. Always queues the request
    //                    for when the service is again available. (Ignores
    //                    server preference)
    ServiceRequester.prototype.request = function (params) {
        var discardRequestFn = function discardRequestFn() {
            if (params.callback) {
                params.callback({ 'ok': false, 'msg': 'Service Unavailable. Discarding request' }, 503);
            }
        };

        var that = this;
        var serviceStatusObserver = this.serviceStatusObserver;

        var onServiceStatusChange;
        onServiceStatusChange = function onServiceStatusChangeFn(running, discardRequest) {
            if (discardRequest) {
                if (!params.neverDiscard) {
                    serviceStatusObserver.unsubscribe(onServiceStatusChange);
                    discardRequestFn();
                }
            } else if (running) {
                serviceStatusObserver.unsubscribe(onServiceStatusChange);
                that.request(params);
            }
        };

        if (!this.running) {
            if (this.discardRequests && !params.neverDiscard) {
                TurbulenzEngine.setTimeout(discardRequestFn, 0);
                return false;
            }

            if (!params.waiting) {
                params.waiting = true;
                serviceStatusObserver.subscribe(onServiceStatusChange);
            }
            return true;
        }

        var oldResponseFilter = params.responseFilter;
        params.responseFilter = function checkServiceUnavailableFn(callContext, makeRequest, responseJSON, status) {
            if (status === 503) {
                var responseObj = JSON.parse(responseJSON);
                var statusObj = responseObj.data;
                var discardRequests = (statusObj ? statusObj.discardRequests : true);
                that.discardRequests = discardRequests;

                if (discardRequests && !params.neverDiscard) {
                    discardRequestFn();
                } else {
                    serviceStatusObserver.subscribe(onServiceStatusChange);
                }
                TurbulenzServices.serviceUnavailable(that, callContext);

                // An error occurred so return false to avoid calling the success callback
                return false;
            } else {
                if (oldResponseFilter) {
                    return oldResponseFilter.call(params.requestHandler, callContext, makeRequest, responseJSON, status);
                }
                return true;
            }
        };

        Utilities.ajax(params);
        return true;
    };

    ServiceRequester.create = function (serviceName, params) {
        var serviceRequester = new ServiceRequester();

        if (!params) {
            params = {};
        }

        // we assume everything is working at first
        serviceRequester.running = true;
        serviceRequester.discardRequests = false;
        serviceRequester.serviceStatusObserver = Observer.create();

        serviceRequester.serviceName = serviceName;

        serviceRequester.onServiceUnavailable = params.onServiceUnavailable;
        serviceRequester.onServiceAvailable = params.onServiceAvailable;

        return serviceRequester;
    };
    return ServiceRequester;
})();
;

//
// TurbulenzServices
//
var TurbulenzServices = (function () {
    function TurbulenzServices() {
    }
    TurbulenzServices.available = function () {
        return window.gameSlug !== undefined;
    };

    TurbulenzServices.addBridgeEvents = function () {
        var turbulenz = window.top.Turbulenz;
        var turbulenzData = (turbulenz && turbulenz.Data) || {};
        var sessionToJoin = turbulenzData.joinMultiplayerSessionId;
        var that = this;

        var onJoinMultiplayerSession = function onJoinMultiplayerSessionFn(joinMultiplayerSessionId) {
            that.multiplayerJoinRequestQueue.push(joinMultiplayerSessionId);
        };

        var onReceiveConfig = function onReceiveConfigFn(configString) {
            var config = JSON.parse(configString);

            if (config.mode) {
                that.mode = config.mode;
            }

            if (config.joinMultiplayerSessionId) {
                that.multiplayerJoinRequestQueue.push(config.joinMultiplayerSessionId);
            }

            that.bridgeServices = !!config.bridgeServices;
        };

        if (sessionToJoin) {
            this.multiplayerJoinRequestQueue.push(sessionToJoin);
        }

        TurbulenzBridge.setOnMultiplayerSessionToJoin(onJoinMultiplayerSession);
        TurbulenzBridge.setOnReceiveConfig(onReceiveConfig);
        TurbulenzBridge.triggerRequestConfig();

        // Setup framework for asynchronous function calls
        this.responseHandlers = [null];

        // 0 is reserved value for no registered callback
        this.responseIndex = 0;
        TurbulenzBridge.on("bridgeservices.response", function (jsondata) {
            that.routeResponse(jsondata);
        });
    };

    TurbulenzServices.callOnBridge = function (event, data, callback) {
        var request = {
            data: data,
            key: undefined
        };
        if (callback) {
            this.responseIndex += 1;
            this.responseHandlers[this.responseIndex] = callback;
            request.key = this.responseIndex;
        }
        TurbulenzBridge.emit('bridgeservices.' + event, JSON.stringify(request));
    };

    TurbulenzServices.addSignature = function (data, url) {
        var str;
        data.requestUrl = url;
        str = TurbulenzEngine.encrypt(JSON.stringify(data));
        data.str = str;
        data.signature = TurbulenzEngine.generateSignature(str);
        return data;
    };

    TurbulenzServices.routeResponse = function (jsondata) {
        var response = JSON.parse(jsondata);
        var index = response.key || 0;
        var callback = this.responseHandlers[index];
        if (callback) {
            this.responseHandlers[index] = null;
            callback(response.data);
        }
    };

    TurbulenzServices.onServiceUnavailable = function (serviceName, callContext) {
    };

    TurbulenzServices.onServiceAvailable = function (serviceName, callContext) {
    };

    TurbulenzServices.createGameSession = function (requestHandler, sessionCreatedFn, errorCallbackFn) {
        return GameSession.create(requestHandler, sessionCreatedFn, errorCallbackFn);
    };

    TurbulenzServices.createMappingTable = function (requestHandler, gameSession, tableReceivedFn, defaultMappingSettings, errorCallbackFn) {
        var mappingTable;
        var mappingTableSettings = gameSession && gameSession.mappingTable;

        var mappingTableURL;
        var mappingTablePrefix;
        var assetPrefix;

        if (mappingTableSettings) {
            mappingTableURL = mappingTableSettings.mappingTableURL;
            mappingTablePrefix = mappingTableSettings.mappingTablePrefix;
            assetPrefix = mappingTableSettings.assetPrefix;
        } else if (defaultMappingSettings) {
            mappingTableURL = defaultMappingSettings.mappingTableURL || (defaultMappingSettings.mappingTableURL === "" ? "" : "mapping_table.json");
            mappingTablePrefix = defaultMappingSettings.mappingTablePrefix || (defaultMappingSettings.mappingTablePrefix === "" ? "" : "staticmax/");
            assetPrefix = defaultMappingSettings.assetPrefix || (defaultMappingSettings.assetPrefix === "" ? "" : "missing/");
        } else {
            mappingTableURL = "mapping_table.json";
            mappingTablePrefix = "staticmax/";
            assetPrefix = "missing/";
        }

        // If there is an error, inject any default mapping data and
        // inform the caller.
        var mappingTableErr = function mappingTableErrFn(msg) {
            var mapping = defaultMappingSettings && (defaultMappingSettings.urnMapping || {});
            var errorCallback = errorCallbackFn || TurbulenzServices.defaultErrorCallback;

            mappingTable.setMapping(mapping);
            errorCallback(msg);
        };

        var mappingTableParams = {
            mappingTableURL: mappingTableURL,
            mappingTablePrefix: mappingTablePrefix,
            assetPrefix: assetPrefix,
            requestHandler: requestHandler,
            onload: tableReceivedFn,
            errorCallback: mappingTableErr
        };

        mappingTable = MappingTable.create(mappingTableParams);
        return mappingTable;
    };

    TurbulenzServices.createLeaderboardManager = function (requestHandler, gameSession, leaderboardMetaReceived, errorCallbackFn) {
        return LeaderboardManager.create(requestHandler, gameSession, leaderboardMetaReceived, errorCallbackFn);
    };

    TurbulenzServices.createBadgeManager = function (requestHandler, gameSession) {
        return BadgeManager.create(requestHandler, gameSession);
    };

    TurbulenzServices.createStoreManager = function (requestHandler, gameSession, storeMetaReceived, errorCallbackFn) {
        return StoreManager.create(requestHandler, gameSession, storeMetaReceived, errorCallbackFn);
    };

    TurbulenzServices.createNotificationsManager = function (requestHandler, gameSession, successCallbackFn, errorCallbackFn) {
        return NotificationsManager.create(requestHandler, gameSession, successCallbackFn, errorCallbackFn);
    };

    TurbulenzServices.createMultiplayerSessionManager = function (requestHandler, gameSession) {
        return MultiPlayerSessionManager.create(requestHandler, gameSession);
    };

    TurbulenzServices.createUserProfile = function (requestHandler, profileReceivedFn, errorCallbackFn) {
        var userProfile = {};

        if (!errorCallbackFn) {
            errorCallbackFn = TurbulenzServices.defaultErrorCallback;
        }

        var loadUserProfileCallback = function loadUserProfileCallbackFn(userProfileData) {
            if (userProfileData && userProfileData.ok) {
                userProfileData = userProfileData.data;
                var p;
                for (p in userProfileData) {
                    if (userProfileData.hasOwnProperty(p)) {
                        userProfile[p] = userProfileData[p];
                    }
                }
            }
        };

        var url = '/api/v1/profiles/user';

        if (TurbulenzServices.available()) {
            this.getService('profiles').request({
                url: url,
                method: 'GET',
                callback: function createUserProfileAjaxErrorCheck(jsonResponse, status) {
                    if (status === 200) {
                        loadUserProfileCallback(jsonResponse);
                    } else if (errorCallbackFn) {
                        errorCallbackFn("TurbulenzServices.createUserProfile error with HTTP status " + status + ": " + jsonResponse.msg, status);
                    }
                    if (profileReceivedFn) {
                        profileReceivedFn(userProfile);
                    }
                },
                requestHandler: requestHandler
            });
        }

        return userProfile;
    };

    TurbulenzServices.upgradeAnonymousUser = // This should only be called if UserProfile.anonymous is true.
    function (upgradeCB) {
        if (upgradeCB) {
            var onUpgrade = function onUpgradeFn(_signal) {
                upgradeCB();
            };
            TurbulenzBridge.on('user.upgrade.occurred', onUpgrade);
        }

        TurbulenzBridge.emit('user.upgrade.show');
    };

    TurbulenzServices.sendCustomMetricEvent = function (eventKey, eventValue, requestHandler, gameSession, errorCallbackFn) {
        if (!errorCallbackFn) {
            errorCallbackFn = TurbulenzServices.defaultErrorCallback;
        }

        // defaultErrorCallback should never be null, so this should
        // hold.
        debug.assert(errorCallbackFn, "no error callback");

        if (!TurbulenzServices.available()) {
            errorCallbackFn("TurbulenzServices.sendCustomMetricEvent " + "failed: Service not available", 0);
            return;
        }

        if (('string' !== typeof eventKey) || (0 === eventKey.length)) {
            errorCallbackFn("TurbulenzServices.sendCustomMetricEvent " + "failed: Event key must be a non-empty string", 0);
            return;
        }

        if ('number' !== typeof eventValue || isNaN(eventValue) || !isFinite(eventValue)) {
            if ('[object Array]' !== Object.prototype.toString.call(eventValue)) {
                errorCallbackFn("TurbulenzServices.sendCustomMetricEvent " + "failed: Event value must be a number or " + "an array of numbers", 0);
                return;
            }

            var i, valuesLength = eventValue.length;
            for (i = 0; i < valuesLength; i += 1) {
                if ('number' !== typeof eventValue[i] || isNaN(eventValue[i]) || !isFinite(eventValue[i])) {
                    errorCallbackFn("TurbulenzServices.sendCustomMetricEvent " + "failed: Event value array elements must " + "be numbers", 0);
                    return;
                }
            }
        }

        this.getService('customMetrics').request({
            url: '/api/v1/custommetrics/add-event/' + gameSession.gameSlug,
            method: 'POST',
            data: {
                'key': eventKey,
                'value': eventValue,
                'gameSessionId': gameSession.gameSessionId
            },
            callback: function sendCustomMetricEventAjaxErrorCheck(jsonResponse, status) {
                if (status !== 200) {
                    errorCallbackFn("TurbulenzServices.sendCustomMetricEvent " + "error with HTTP status " + status + ": " + jsonResponse.msg, status);
                }
            },
            requestHandler: requestHandler,
            encrypt: true
        });
    };

    TurbulenzServices.sendCustomMetricEventBatch = function (eventBatch, requestHandler, gameSession, errorCallbackFn) {
        if (!errorCallbackFn) {
            errorCallbackFn = TurbulenzServices.defaultErrorCallback;
        }

        if (!TurbulenzServices.available()) {
            if (errorCallbackFn) {
                errorCallbackFn("TurbulenzServices.sendCustomMetricEventBatch failed: Service not available", 0);
            }
            return;
        }

        // Validation
        // Test eventBatch is correct type
        var currentTime = TurbulenzEngine.time;
        var events = eventBatch.events;
        var eventIndex;
        var numEvents = events.length;
        for (eventIndex = 0; eventIndex < numEvents; eventIndex += 1) {
            var eventKey = events[eventIndex].key;
            var eventValue = events[eventIndex].value;
            var eventTime = events[eventIndex].timeOffset;

            if (('string' !== typeof eventKey) || (0 === eventKey.length)) {
                if (errorCallbackFn) {
                    errorCallbackFn("TurbulenzServices.sendCustomMetricEventBatch failed: Event key must be a" + " non-empty string", 0);
                }
                return;
            }

            if ('number' !== typeof eventValue || isNaN(eventValue) || !isFinite(eventValue)) {
                if ('[object Array]' !== Object.prototype.toString.call(eventValue)) {
                    if (errorCallbackFn) {
                        errorCallbackFn("TurbulenzServices.sendCustomMetricEventBatch failed: Event value must be a" + " number or an array of numbers", 0);
                    }
                    return;
                }

                var i, valuesLength = eventValue.length;
                for (i = 0; i < valuesLength; i += 1) {
                    if ('number' !== typeof eventValue[i] || isNaN(eventValue[i]) || !isFinite(eventValue[i])) {
                        if (errorCallbackFn) {
                            errorCallbackFn("TurbulenzServices.sendCustomMetricEventBatch failed: Event value array" + " elements must be numbers", 0);
                        }
                        return;
                    }
                }
            }

            if ('number' !== typeof eventTime || isNaN(eventTime) || !isFinite(eventTime)) {
                if (errorCallbackFn) {
                    errorCallbackFn("TurbulenzServices.sendCustomMetricEventBatch failed: Event time offset is" + " corrupted", 0);
                }
                return;
            }

            // Update the time offset to be relative to the time we're sending the batch,
            // the server will use this to calculate event times
            events[eventIndex].timeOffset = eventTime - currentTime;
        }

        this.getService('customMetrics').request({
            url: '/api/v1/custommetrics/add-event-batch/' + gameSession.gameSlug,
            method: 'POST',
            data: { 'batch': events, 'gameSessionId': gameSession.gameSessionId },
            callback: function sendCustomMetricEventBatchAjaxErrorCheck(jsonResponse, status) {
                if (status !== 200 && errorCallbackFn) {
                    errorCallbackFn("TurbulenzServices.sendCustomMetricEventBatch error with HTTP status " + status + ": " + jsonResponse.msg, status);
                }
            },
            requestHandler: requestHandler,
            encrypt: true
        });
    };

    TurbulenzServices.getService = function (serviceName) {
        var services = this.services;
        if (services.hasOwnProperty(serviceName)) {
            return services[serviceName];
        } else {
            var service = ServiceRequester.create(serviceName);
            services[serviceName] = service;
            return service;
        }
    };

    TurbulenzServices.serviceUnavailable = function (service, callContext) {
        var waitingServices = this.waitingServices;
        var serviceName = service.serviceName;
        if (waitingServices.hasOwnProperty(serviceName)) {
            return;
        }

        waitingServices[serviceName] = service;

        service.running = false;

        var onServiceUnavailableCallbacks = function onServiceUnavailableCallbacksFn(service) {
            var onServiceUnavailable = callContext.onServiceUnavailable;
            if (onServiceUnavailable) {
                onServiceUnavailable.call(service, callContext);
            }
            if (service.onServiceUnavailable) {
                service.onServiceUnavailable();
            }
            if (TurbulenzServices.onServiceUnavailable) {
                TurbulenzServices.onServiceUnavailable(service);
            }
        };

        if (service.discardRequests) {
            onServiceUnavailableCallbacks(service);
        }

        if (this.pollingServiceStatus) {
            return;
        }

        var that = this;
        var pollServiceStatus;

        var serviceUrl = '/api/v1/service-status/game/read/' + window.gameSlug;
        var servicesStatusCB = function servicesStatusCBFn(responseObj, status) {
            if (status === 200) {
                var statusObj = responseObj.data;
                var servicesObj = statusObj.services;

                var retry = false;
                var serviceName;
                for (serviceName in waitingServices) {
                    if (waitingServices.hasOwnProperty(serviceName)) {
                        var service = waitingServices[serviceName];
                        var serviceData = servicesObj[serviceName];
                        var serviceRunning = serviceData.running;

                        service.running = serviceRunning;
                        service.description = serviceData.description;

                        if (serviceRunning) {
                            if (service.discardRequests) {
                                var onServiceAvailable = callContext.onServiceAvailable;
                                if (onServiceAvailable) {
                                    onServiceAvailable.call(service, callContext);
                                }
                                if (service.onServiceAvailable) {
                                    service.onServiceAvailable();
                                }
                                if (TurbulenzServices.onServiceAvailable) {
                                    TurbulenzServices.onServiceAvailable(service);
                                }
                            }

                            delete waitingServices[serviceName];
                            service.discardRequests = false;
                            service.serviceStatusObserver.notify(serviceRunning, service.discardRequests);
                        } else {
                            if (serviceData.discardRequests && !service.discardRequests) {
                                service.discardRequests = true;
                                onServiceUnavailableCallbacks(service);

                                // discard all waiting requests
                                service.serviceStatusObserver.notify(serviceRunning, service.discardRequests);
                            }
                            retry = true;
                        }
                    }
                }
                if (!retry) {
                    this.pollingServiceStatus = false;
                    return;
                }
                TurbulenzEngine.setTimeout(pollServiceStatus, statusObj.pollInterval * 1000);
            } else {
                TurbulenzEngine.setTimeout(pollServiceStatus, that.defaultPollInterval);
            }
        };

        pollServiceStatus = function pollServiceStatusFn() {
            Utilities.ajax({
                url: serviceUrl,
                method: 'GET',
                callback: servicesStatusCB
            });
        };

        pollServiceStatus();
    };
    TurbulenzServices.multiplayerJoinRequestQueue = {
        // A FIFO queue that passes events through to the handler when
        // un-paused and buffers up events while paused
        argsQueue: [],
        handler: function nopFn() {
        },
        context: undefined,
        paused: true,
        onEvent: function onEventFn(handler, context) {
            this.handler = handler;
            this.context = context;
        },
        push: function pushFn(sessionId) {
            var args = [sessionId];
            if (this.paused) {
                this.argsQueue.push(args);
            } else {
                this.handler.apply(this.context, args);
            }
        },
        shift: function shiftFn() {
            var args = this.argsQueue.shift();
            return args ? args[0] : undefined;
        },
        clear: function clearFn() {
            this.argsQueue = [];
        },
        pause: function pauseFn() {
            this.paused = true;
        },
        resume: function resumeFn() {
            this.paused = false;
            while (this.argsQueue.length) {
                this.handler.apply(this.context, this.argsQueue.shift());
                if (this.paused) {
                    break;
                }
            }
        }
    };

    TurbulenzServices.defaultErrorCallback = function (errorMsg, httpStatus) {
    };

    TurbulenzServices.services = {};
    TurbulenzServices.waitingServices = {};
    TurbulenzServices.pollingServiceStatus = false;

    TurbulenzServices.defaultPollInterval = 4000;
    return TurbulenzServices;
})();

if (typeof TurbulenzBridge !== 'undefined') {
    TurbulenzServices.addBridgeEvents();
} else {
    debug.log("No TurbulenzBridge object");
}
// Copyright (c) 2011 Turbulenz Limited
;

var UserDataManager = (function () {
    function UserDataManager() {
        this.keyValidate = new RegExp("^[A-Za-z0-9]+([\\-\\.][A-Za-z0-9]+)*$");
    }
    UserDataManager.prototype.validateKey = function (key) {
        if (!key || typeof (key) !== "string") {
            this.errorCallbackFn("Invalid key string (Key string is empty or not a string)");
            return false;
        }

        if (!this.keyValidate.test(key)) {
            this.errorCallbackFn("Invalid key string (Only alphanumeric characters and .- are permitted)");
            return false;
        }

        return key;
    };

    UserDataManager.prototype.getKeys = function (callbackFn, errorCallbackFn) {
        var that = this;
        var getKeysCallback = function getKeysCallbackFn(jsonResponse, status) {
            if (status === 200) {
                callbackFn(jsonResponse.keys || jsonResponse.array);
            } else {
                var errorCallback = errorCallbackFn || that.errorCallbackFn;
                errorCallback("UserDataManager.getKeys failed with status " + status + ": " + jsonResponse.msg, status, that.getKeys, [callbackFn]);
            }
        };

        var dataSpec = {
            gameSessionId: that.gameSessionId
        };

        if (TurbulenzServices.bridgeServices) {
            TurbulenzServices.callOnBridge('userdata.getkeys', null, callbackFn);
        } else {
            this.service.request({
                url: '/api/v1/user-data/get-keys',
                method: 'GET',
                data: dataSpec,
                callback: getKeysCallback,
                requestHandler: this.requestHandler,
                encrypt: true
            });
        }
    };

    UserDataManager.prototype.exists = function (key, callbackFn, errorCallbackFn) {
        if (!this.validateKey(key)) {
            return;
        }

        var that = this;
        var existsCallback = function existsCallbackFn(jsonResponse, status) {
            if (status === 200) {
                callbackFn(key, jsonResponse.exists);
            } else {
                var errorCallback = errorCallbackFn || that.errorCallbackFn;
                errorCallback("UserDataManager.exists failed with status " + status + ": " + jsonResponse.msg, status, that.exists, [key, callbackFn]);
            }
        };

        var dataSpec = {
            gameSessionId: that.gameSessionId
        };

        if (TurbulenzServices.bridgeServices) {
            TurbulenzServices.callOnBridge('userdata.exists', key, function unpackResponse(exists) {
                callbackFn(key, exists);
            });
        } else {
            this.service.request({
                url: '/api/v1/user-data/exists/' + key,
                method: 'GET',
                data: dataSpec,
                callback: existsCallback,
                requestHandler: this.requestHandler,
                encrypt: true
            });
        }
    };

    UserDataManager.prototype.get = function (key, callbackFn, errorCallbackFn) {
        if (!this.validateKey(key)) {
            return;
        }

        var that = this;
        var getCallback = function getCallbackFn(jsonResponse, status) {
            if (status === 200) {
                callbackFn(key, jsonResponse.value);
            } else if (status === 404) {
                callbackFn(key, null);
            } else {
                var errorCallback = errorCallbackFn || that.errorCallbackFn;
                errorCallback("UserDataManager.get failed with status " + status + ": " + jsonResponse.msg, status, that.get, [key, callbackFn]);
            }
        };

        var dataSpec = {
            gameSessionId: that.gameSessionId
        };

        if (TurbulenzServices.bridgeServices) {
            TurbulenzServices.callOnBridge('userdata.get', key, function unpackResponse(value) {
                callbackFn(key, value);
            });
        } else {
            this.service.request({
                url: '/api/v1/user-data/get/' + key,
                method: 'GET',
                data: dataSpec,
                callback: getCallback,
                requestHandler: this.requestHandler,
                encrypt: true
            });
        }
    };

    UserDataManager.prototype.set = function (key, value, callbackFn, errorCallbackFn) {
        if (!this.validateKey(key)) {
            return;
        }

        if (!value) {
            this.remove(key, callbackFn);
            return;
        }

        var that = this;
        var setCallback = function setCallbackFn(jsonResponse, status) {
            if (status === 200) {
                callbackFn(key);
            } else {
                var errorCallback = errorCallbackFn || that.errorCallbackFn;
                errorCallback("UserDataManager.set failed with status " + status + ": " + jsonResponse.msg, status, that.set, [key, value, callbackFn]);
            }
        };

        var dataSpec = {
            gameSessionId: that.gameSessionId,
            value: value
        };

        var url = '/api/v1/user-data/set/' + key;

        if (TurbulenzServices.bridgeServices) {
            TurbulenzServices.addSignature(dataSpec, url);
            dataSpec.key = key;
            TurbulenzServices.callOnBridge('userdata.set', dataSpec, function sendResponse() {
                callbackFn(key);
            });
        } else {
            this.service.request({
                url: url,
                method: 'POST',
                data: dataSpec,
                callback: setCallback,
                requestHandler: this.requestHandler,
                encrypt: true
            });
        }
    };

    UserDataManager.prototype.remove = function (key, callbackFn, errorCallbackFn) {
        if (!this.validateKey(key)) {
            return;
        }

        var that = this;
        var removeCallback = function removeCallbackFn(jsonResponse, status) {
            if (status === 200) {
                callbackFn(key);
            } else if (status === 404) {
                callbackFn(key);
            } else {
                var errorCallback = errorCallbackFn || that.errorCallbackFn;
                errorCallback("UserDataManager.remove failed with status " + status + ": " + jsonResponse.msg, status, that.remove, [key, callbackFn]);
            }
        };

        var dataSpec = {
            gameSessionId: that.gameSessionId
        };

        if (TurbulenzServices.bridgeServices) {
            TurbulenzServices.callOnBridge('userdata.remove', key, function sendResponse() {
                callbackFn(key);
            });
        } else {
            this.service.request({
                url: '/api/v1/user-data/remove/' + key,
                method: 'POST',
                data: dataSpec,
                callback: removeCallback,
                requestHandler: this.requestHandler,
                encrypt: true
            });
        }
    };

    UserDataManager.prototype.removeAll = function (callbackFn, errorCallbackFn) {
        var that = this;
        var removeAllCallback = function removeAllCallbackFn(jsonResponse, status) {
            if (status === 200) {
                callbackFn();
            } else {
                var errorCallback = errorCallbackFn || that.errorCallbackFn;
                errorCallback("UserDataManager.removeAll failed with status " + status + ": " + jsonResponse.msg, status, that.removeAll, [callbackFn]);
            }
        };

        var dataSpec = {
            gameSessionId: that.gameSessionId
        };

        if (TurbulenzServices.bridgeServices) {
            TurbulenzServices.callOnBridge('userdata.removeall', null, callbackFn);
        } else {
            this.service.request({
                url: '/api/v1/user-data/remove-all',
                method: 'POST',
                data: dataSpec,
                callback: removeAllCallback,
                requestHandler: this.requestHandler,
                encrypt: true
            });
        }
    };

    UserDataManager.create = // Constructor function
    function (requestHandler, gameSession, errorCallbackFn) {
        var userdataManager;
        if (!TurbulenzServices.available()) {
            return null;
        }

        userdataManager = new UserDataManager();
        userdataManager.requestHandler = requestHandler;
        userdataManager.errorCallbackFn = errorCallbackFn || TurbulenzServices.defaultErrorCallback;
        userdataManager.gameSessionId = gameSession.gameSessionId;

        userdataManager.service = TurbulenzServices.getService('userdata');

        return userdataManager;
    };
    UserDataManager.version = 1;
    return UserDataManager;
})();
