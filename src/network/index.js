/**
 * @preserve
 *
 *                                      .,,,;;,'''..
 *                                  .'','...     ..',,,.
 *                                .,,,,,,',,',;;:;,.  .,l,
 *                               .,',.     ...     ,;,   :l.
 *                              ':;.    .'.:do;;.    .c   ol;'.
 *       ';;'                   ;.;    ', .dkl';,    .c   :; .'.',::,,'''.
 *      ',,;;;,.                ; .,'     .'''.    .'.   .d;''.''''.
 *     .oxddl;::,,.             ',  .'''.   .... .'.   ,:;..
 *      .'cOX0OOkdoc.            .,'.   .. .....     'lc.
 *     .:;,,::co0XOko'              ....''..'.'''''''.
 *     .dxk0KKdc:cdOXKl............. .. ..,c....
 *      .',lxOOxl:'':xkl,',......'....    ,'.
 *           .';:oo:...                        .
 *                .cd,      ╔═╗┌┬┐┬┌┬┐┌─┐┬─┐    .
 *                  .l;     ║╣  │││ │ │ │├┬┘    '
 *                    'l.   ╚═╝─┴┘┴ ┴ └─┘┴└─   '.
 *                     .o.                   ...
 *                      .''''','.;:''.........
 *                           .'  .l
 *                          .:.   l'
 *                         .:.    .l.
 *                        .x:      :k;,.
 *                        cxlc;    cdc,,;;.
 *                       'l :..   .c  ,
 *                       o.
 *                      .,
 *
 *      ╦═╗┌─┐┌─┐┬  ┬┌┬┐┬ ┬  ╔═╗┌┬┐┬┌┬┐┌─┐┬─┐  ╔═╗┬─┐┌─┐ ┬┌─┐┌─┐┌┬┐
 *      ╠╦╝├┤ ├─┤│  │ │ └┬┘  ║╣  │││ │ │ │├┬┘  ╠═╝├┬┘│ │ │├┤ │   │
 *      ╩╚═└─┘┴ ┴┴─┘┴ ┴  ┴   ╚═╝─┴┘┴ ┴ └─┘┴└─  ╩  ┴└─└─┘└┘└─┘└─┘ ┴
 *
 *
 * Created by Valentin on 10/22/14.
 *
 * Copyright (c) 2015 Valentin Heun
 * Modified by Valentin Heun 2014, 2015, 2016, 2017
 * Modified by Benjamin Reynholds 2016, 2017
 * Modified by James Hobin 2016, 2017
 *
 * All ascii characters above must be included in any redistribution.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

createNameSpace("realityEditor.network");
 
realityEditor.network.addHeartbeatObject = function (beat) {
    /*
     if (globalStates.platform) {
     window.location.href = "of://gotbeat_" + beat.id;
     }
     */
    var _this = this;
    if (beat.id) {
        if (!objects[beat.id]) {
            this.getData('http://' + beat.ip + ':' + httpPort + '/object/' + beat.id, beat.id, function (req, thisKey) {
                if (req && thisKey) {
                    objects[thisKey] = req;
                    var thisObject = objects[thisKey];
                    // this is a work around to set the state of an objects to not being visible.
                    thisObject.objectVisible = false;
                    thisObject.screenZ = 1000;
                    thisObject.fullScreen = false;
                    thisObject.sendMatrix = false;
                    thisObject.sendAcceleration = false;
                    thisObject.integerVersion = parseInt(objects[thisKey].version.replace(/\./g, ""));

                    if (thisObject.matrix === null || typeof thisObject.matrix !== "object") {
                        thisObject.matrix = [];
                    }

                    for (var nodeKey in objects[thisKey].nodes) {
                        thisObject = objects[thisKey].nodes[nodeKey];
                        if (thisObject.matrix === null || typeof thisObject.matrix !== "object") {
                            thisObject.matrix = [];
                        }
                        thisObject.loaded = false;
                        thisObject.visible = false;

                        if(thisObject.type === "logic") {
                            thisObject.guiState = new LogicGUIState();
                            var container = document.getElementById('craftingBoard');
                            thisObject.grid = new _this.realityEditor.gui.crafting.grid.Grid(container.clientWidth - menuBarWidth, container.clientHeight);
                            _this.realityEditor.gui.crafting.utilities.convertLinksFromServer(thisObject);
                        }
                    }

                    if (!thisObject.protocol) {
                        thisObject.protocol = "R0";
                    }

                    if (thisObject.integerVersion < 170) {

                        _this.utilities.rename(thisObject, "folder", "name");
                        _this.utilities.rename(thisObject, "objectValues", "nodes");
                        _this.utilities.rename(thisObject, "objectLinks", "links");
                        delete thisObject["matrix3dMemory"];

                        for (var linkKey in objects[thisKey].links) {
                            thisObject = objects[thisKey].links[linkKey];

                            _this.utilities.rename(thisObject, "ObjectA", "objectA");
                            _this.utilities.rename(thisObject, "locationInA", "nodeA");
                            _this.utilities.rename(thisObject, "ObjectNameA", "nameA");

                            _this.utilities.rename(thisObject, "ObjectB", "objectB");
                            _this.utilities.rename(thisObject, "locationInB", "nodeB");
                            _this.utilities.rename(thisObject, "ObjectNameB", "nameB");
                            _this.utilities.rename(thisObject, "endlessLoop", "loop");
                            _this.utilities.rename(thisObject, "countLinkExistance", "health");
                        }

                        for (var nodeKey in objects[thisKey].nodes) {
                            thisObject = objects[thisKey].nodes[nodeKey];
                            _this.utilities.rename(thisObject, "plugin", "type");
                            _this.utilities.rename(thisObject, "appearance", "type");
                            thisObject.data = {
                                value: thisObject.value,
                                mode: thisObject.mode,
                                unit: "",
                                unitMin: 0,
                                unitMax: 1
                            };
                            delete thisObject.value;
                            delete thisObject.mode;

                        }

                    }

                    objects[thisKey].uuid = thisKey;

                    for (var nodeKey in objects[thisKey].nodes) {
                         objects[thisKey].nodes[nodeKey].uuid = nodeKey;
                    }

                    for (var linkKey in objects[thisKey].links) {
                        objects[thisKey].links[linkKey].uuid = linkKey;
                    }

                    _this.cout(JSON.stringify(objects[thisKey]));

                    _this.realityEditor.gui.memory.addObjectMemory(objects[thisKey]);

                    _this.realityEditor.gui.preferences.addElementInPreferences();
                }
            });
        }
    }
};

realityEditor.network.updateObject = function (origin, remote, thisKey) {

    origin.x = remote.x;
    origin.y = remote.y;
    origin.scale = remote.scale;
    origin.developer = remote.developer;

    if(remote.matrix) {
       origin.matrix = remote.matrix;
    }

    for (var nodeKey in remote.nodes) {
        if(!origin.nodes[nodeKey]) {
            origin.nodes[nodeKey] = remote.nodes[nodeKey];
        } else {

            origin.nodes[nodeKey].x =  remote.nodes[nodeKey].x;
            origin.nodes[nodeKey].y =  remote.nodes[nodeKey].y;
            origin.nodes[nodeKey].scale =  remote.nodes[nodeKey].scale;

            origin.nodes[nodeKey].name =  remote.nodes[nodeKey].name;
            if(remote.nodes[nodeKey].text)
                origin.nodes[nodeKey].text =  remote.nodes[nodeKey].text;
            if(remote.nodes[nodeKey].matrix)
            origin.nodes[nodeKey].matrix =  remote.nodes[nodeKey].matrix;
        }

        if(globalDOMCach["iframe" + nodeKey]) {
            if(globalDOMCach["iframe" + nodeKey]._loaded)
                realityEditor.network.onElementLoad(thisKey, nodeKey);
        }
    }
};


realityEditor.network.updateNode= function (origin, remote, thisKey, nodeKey) {
        if(!origin) {
            origin = remote;
        } else {

            origin.x =  remote.x;
            origin.y =  remote.y;
            origin.scale =  remote.scale;

            origin.name =  remote.name;
            if(remote.text)
                origin.text =  remote.text;
            if(remote.matrix)
                origin.matrix =  remote.matrix;
        }

    if (remote.blocks) {
        if (!origin.blocks) origin.blocks = {};
        for(var x in origin.blocks){
            if (!origin.blocks[x]) origin.blocks[x] = {};
            for (var y in remote.blocks[x]){
                origin.blocks[x][y] = remote.blocks[x][y];
            }
        }
    }
    if (remote.links) {
        if (!origin.links) origin.links = {};
		for(var x in origin.links){
            if (!origin.links[x]) origin.links[x] = {};
            for (var y in remote.links[x]){
                origin.links[x][y] = remote.links[x][y];
            }
        }
    }

if(globalStates.currentLogic){
    if(globalStates.currentLogic.uuid === nodeKey) {
        console.log("YES");
        realityEditor.gui.crafting.craftingBoardHide();
        realityEditor.gui.crafting.craftingBoardVisible(thisKey, nodeKey);
        // console.log(globalStates.currentLogic.grid);
//   realityEditor.gui.crafting.craftingBoardVisible(thisKey, nodeKey);
        // realityEditor.gui.crafting.updateGrid(globalStates.currentLogic.grid);
    }
} else {
    console.log("NO");


    if(globalDOMCach["iframe" + nodeKey]) {
        if(globalDOMCach["iframe" + nodeKey]._loaded)
            realityEditor.network.onElementLoad(thisKey, nodeKey);
    }
}
};




/*
    for (var nodeKey in remote) {
        if(typeof remote[nodeKey] === "object"){
            if(typeof origin[nodeKey] === "undefined" && typeof remote[nodeKey] !== "undefined"){
                origin[nodeKey] ={};
            } else continue;
            origin[nodeKey].uuid = nodeKey;
            this.updateKey(origin[nodeKey], remote[nodeKey])
        } else {
            if(typeof remote[nodeKey] !== "undefined") {
                origin[nodeKey] = remote[nodeKey];
            }
        }
    }*/


realityEditor.network.onAction = function (action) {
    var _this = this;
    var thisAction;
    if(typeof action === "object")
    {
        thisAction = action;
    } else {
        thisAction = JSON.parse(action);
    }

    if(thisAction.lastEditor === globalStates.tempUuid) {
		console.log(thisAction.lastEditor);
		console.log(globalStates.tempUuid);
		console.log("------------------------------------- its my self");
		return;
	}

    // reload links for a specific object.

    if (typeof thisAction.reloadLink !== "undefined") {

        if(thisAction.reloadLink.object in objects) {
            this.getData('http://' + objects[thisAction.reloadLink.object].ip + ':' + httpPort + '/object/' + thisAction.reloadLink.object, thisAction.reloadLink.object, function (req, thisKey) {

                if (objects[thisKey].integerVersion < 170) {
                    objects[thisKey].links = req.links;
                    for (var linkKey in objects[thisKey].links) {
                        var thisObject = objects[thisKey].links[linkKey];

                        _this.utilities.rename(thisObject, "ObjectA", "objectA");
                        _this.utilities.rename(thisObject, "locationInA", "nodeA");
                        _this.utilities.rename(thisObject, "ObjectNameA", "nameA");

                        _this.utilities.rename(thisObject, "ObjectB", "objectB");
                        _this.utilities.rename(thisObject, "locationInB", "nodeB");
                        _this.utilities.rename(thisObject, "ObjectNameB", "nameB");
                        _this.utilities.rename(thisObject, "endlessLoop", "loop");
                        _this.utilities.rename(thisObject, "countLinkExistance", "health");
                    }
                }
                else {
                    objects[thisKey].links = req.links;
                }

				objects[thisKey].uuid = thisKey;

				for (var nodeKey in objects[thisKey].nodes) {
					objects[thisKey].nodes[nodeKey].uuid = nodeKey;
				}

				for (var linkKey in objects[thisKey].links) {
					objects[thisKey].links[linkKey].uuid = linkKey;
				}

                // cout(objects[thisKey]);

                _this.cout("got links");
            });
        }
    }

    if (typeof thisAction.reloadObject !== "undefined") {
console.log("gotdata");
        if(thisAction.reloadObject.object in objects) {
            this.getData('http://' + objects[thisAction.reloadObject.object].ip + ':' + httpPort + '/object/' + thisAction.reloadObject.object, thisAction.reloadObject.object, function (req, thisKey) {

                if (objects[thisKey].integerVersion < 170) {
                    if(typeof req.objectValues !== "undefined")
                        req.nodes = req.objectValues;
                }

                realityEditor.network.updateObject(objects[thisKey], req, thisKey);

                _this.cout("got object");


            });
        }
    }

    if (typeof thisAction.reloadNode !== "undefined") {
        console.log("gotdata: "+thisAction.reloadNode.object +" "+thisAction.reloadNode.node);
        console.log('http://' + objects[thisAction.reloadNode.object].ip + ':' + httpPort + '/object/' + thisAction.reloadNode.object + "/node/" + thisAction.reloadNode.node+"/");
        if(thisAction.reloadNode.object in objects) {
                this.getData(
                    'http://' + objects[thisAction.reloadNode.object].ip + ':' + httpPort + '/object/' + thisAction.reloadNode.object + "/node/" + thisAction.reloadNode.node+"/", thisAction.reloadNode.object, function (req, thisKey, thisNode) {

                    console.log("------------------------------");
                    console.log(thisKey+"  "+thisNode);
                        console.log(req);

                        if(!objects[thisKey].nodes[thisNode]){
                            objects[thisKey].nodes[thisNode] = req;
                        } else {
                            realityEditor.network.updateNode(objects[thisKey].nodes[thisNode], req, thisKey, thisNode);
                        }


                    _this.cout("got object");

                }, thisAction.reloadNode.node);
            }
        }


    if (typeof thisAction.advertiseConnection !== "undefined") {
        this.realityEditor.advertisement.logic(thisAction.advertiseConnection);
    }


    if (thisAction.loadMemory) {
        var id = thisAction.loadMemory.object;
        var url = 'http://' + thisAction.loadMemory.ip + ':' + httpPort + '/object/' + id;

        this.getData(url, id, function (req, thisKey) {
            _this.cout('received memory', req.memory);
            objects[thisKey].memory = req.memory;
            _this.realityEditor.gui.memory.addObjectMemory(objects[thisKey]);
        });
    }

    for(var key in thisAction) {
        this.cout("found action: " + JSON.stringify(key));
    }
};

realityEditor.network.onInternalPostMessage = function(e) {
    var msgContent = {};
    if (e.data) {
        msgContent = JSON.parse(e.data);

    } else {
        msgContent = JSON.parse(e);
    }

    if (msgContent.resendOnElementLoad) {
        var elt = document.getElementById('iframe' + msgContent.nodeKey);
        if (elt) {
            var data = elt.dataset;
            realityEditor.network.onElementLoad(data.objectKey, data.nodeKey);
        }
    }

    var tempThisObject = {};
    var thisVersionNumber;

    if (!msgContent.version) {
        thisVersionNumber = 0;
    }
    else {
        thisVersionNumber = msgContent.version;
    }

    if (thisVersionNumber >= 170) {
        if ((!msgContent.object) || (!msgContent.object)) return;
    } else {
        if ((!msgContent.obj) || (!msgContent.pos)) return;
        msgContent.object = msgContent.obj;
        msgContent.node = msgContent.pos;
    }

    if (msgContent.object in objects) {
        if (msgContent.node === msgContent.object) {
            tempThisObject = objects[msgContent.object];
        } else if (msgContent.node in objects[msgContent.object].nodes) {
            tempThisObject = objects[msgContent.object].nodes[msgContent.node];
        } else if (msgContent.node in objects[msgContent.object].frames) {
            tempThisObject = objects[msgContent.object].frames[msgContent.node];
        } else return;

    } else if (msgContent.object in pocketItem) {
        if (msgContent.node === msgContent.object) {
            tempThisObject = pocketItem[msgContent.object];
        } else {
            if (msgContent.node in pocketItem[msgContent.object].nodes) {
                tempThisObject = pocketItem[msgContent.object].nodes[msgContent.node];
            } else return;
        }

    } else return;

    if (msgContent.width && msgContent.height) {
        var thisMsgNode = document.getElementById(msgContent.node);
        thisMsgNode.style.width = msgContent.width;
        thisMsgNode.style.height = msgContent.height;
        thisMsgNode.style.top = ((globalStates.width - msgContent.height) / 2);
        thisMsgNode.style.left = ((globalStates.height - msgContent.width) / 2);

        thisMsgNode = document.getElementById("iframe" + msgContent.node);
        thisMsgNode.style.width = msgContent.width;
        thisMsgNode.style.height = msgContent.height;
        thisMsgNode.style.top = ((globalStates.width - msgContent.height) / 2);
        thisMsgNode.style.left = ((globalStates.height - msgContent.width) / 2);

    }

    if (typeof msgContent.sendMatrix !== "undefined") {

        if (msgContent.sendMatrix === true) {

            if (tempThisObject.integerVersion >= 32) {

                tempThisObject.sendMatrix = true;
                document.getElementById("iframe" + msgContent.node).contentWindow.postMessage(
                    '{"projectionMatrix":' + JSON.stringify(globalStates.realProjectionMatrix) + "}", '*');
            }
        }
    }


    if (typeof msgContent.sendAcceleration !== "undefined") {
        console.log(msgContent.sendAcceleration);
        if (msgContent.sendAcceleration === true) {

            if (tempThisObject.integerVersion >= 32) {

                tempThisObject.sendAcceleration = true;

                if (globalStates.sendAcceleration === false) {
                    globalStates.sendAcceleration = true;
                    if (window.DeviceMotionEvent) {
                        console.log("motion activated");

                        window.addEventListener("deviceorientation", function () {

                        });

                        window.addEventListener("devicemotion", function () {

                            var thisState = globalStates.acceleration;

                            thisState.x = event.acceleration.x;
                            thisState.y = event.acceleration.y;
                            thisState.z = event.acceleration.z;

                            thisState.alpha = event.rotationRate.alpha;
                            thisState.beta = event.rotationRate.beta;
                            thisState.gamma = event.rotationRate.gamma;

                            // Manhattan Distance :-D
                            thisState.motion =
                                Math.abs(thisState.x) +
                                Math.abs(thisState.y) +
                                Math.abs(thisState.z) +
                                Math.abs(thisState.alpha) +
                                Math.abs(thisState.beta) +
                                Math.abs(thisState.gamma);

                        }, false);
                    } else {
                        console.log("DeviceMotionEvent is not supported");
                    }
                }
            }
        }
    }

    if (msgContent.globalMessage) {
        var iframes = document.getElementsByTagName('iframe');
        for (var i = 0; i < iframes.length; i++) {

            if (iframes[i].id !== "iframe" + msgContent.node && iframes[i].style.visibility !== "hidden") {
                var receivingObject = objects[iframes[i].id.substr(6)];
                if (receivingObject.integerVersion >= 32) {
                    var msg = {};
                    if (receivingObject.integerVersion >= 170) {
                        msg = {globalMessage: msgContent.globalMessage};
                    } else {
                        msg = {ohGlobalMessage: msgContent.ohGlobalMessage};
                    }
                    iframes[i].contentWindow.postMessage(JSON.stringify(msg), "*");
                }
            }
        }
    }

    if (typeof msgContent.fullScreen === "boolean") {
        // console.log("gotfullscreenmessage");
        if (msgContent.fullScreen === true) {
            tempThisObject.fullScreen = true;
            console.log("fullscreen: " + tempThisObject.fullScreen);
            document.getElementById("thisObject" + msgContent.node).style.webkitTransform =
                'matrix3d(1, 0, 0, 0,' +
                '0, 1, 0, 0,' +
                '0, 0, 1, 0,' +
                '0, 0, 0, 1)';

        }
        if (msgContent.fullScreen === false) {

            tempThisObject.fullScreen = false;
        }

    }

    if (typeof msgContent.createNode !== "undefined") {
        var node = new Node();
        node.name = msgContent.createNode.name;
        node.frame = msgContent.node;
        node.x = (tempThisObject.x || 0) + (Math.random() - 0.5) * 160;
        node.y = (tempThisObject.y || 0) + (Math.random() - 0.5) * 160;
        var nodeKey = node.frame + msgContent.createNode.name;
        objects[msgContent.object].nodes[nodeKey] = node;
        realityEditor.network.postNewNode(objects[msgContent.object].ip, msgContent.object, nodeKey, node);
    }
};

realityEditor.network.deleteData = function(url) {
    var request = new XMLHttpRequest();
    request.open('DELETE', url, true);
    var _this = this;
    request.onreadystatechange = function () {
        if (request.readyState == 4) _this.cout("It deleted!");
    };
    request.setRequestHeader("Content-type", "application/json");
    //request.setRequestHeader("Content-length", params.length);
    // request.setRequestHeader("Connection", "close");
    request.send();
    this.cout("deleteData");
};

realityEditor.network.deleteLinkFromObject = function(ip, thisObjectKey, thisKey) {
    // generate action for all links to be reloaded after upload
    this.cout("I am deleting a link: " + ip);
    this.deleteData('http://' + ip + ':' + httpPort + '/object/' + thisObjectKey + "/link/" + thisKey+"/lastEditor/"+globalStates.tempUuid);
};

realityEditor.network.deleteBlockFromObject = function(ip, thisObjectKey, thisLogicKey, thisBlockKey) {
    // generate action for all links to be reloaded after upload
    this.cout("I am deleting a block: " + ip);
    // /logic/*/*/block/*/
    this.deleteData('http://' + ip + ':' + httpPort + '/logic/' + thisObjectKey + "/" + thisLogicKey + "/block/" + thisBlockKey+"/lastEditor/"+globalStates.tempUuid);
};

realityEditor.network.deleteBlockLinkFromObject = function(ip, thisObjectKey, thisLogicKey, thisBlockLinkKey) {
    // generate action for all links to be reloaded after upload
    this.cout("I am deleting a block link: " + ip);
    // /logic/*/*/link/*/
    this.deleteData('http://' + ip + ':' + httpPort + '/logic/' + thisObjectKey + "/" + thisLogicKey + "/link/" + thisBlockLinkKey+"/lastEditor/"+globalStates.tempUuid);
};

realityEditor.network.getData = function(url, thisKey, callback, thisNode) {
    if(!thisNode) thisNode = null;
    var _this = this;
    var req = new XMLHttpRequest();
    try {
        req.open('GET', url, true);
        // Just like regular ol' XHR
        req.onreadystatechange = function () {
            if (req.readyState === 4) {
                if (req.status === 200) {
                    // JSON.parse(req.responseText) etc.
                    if(req.responseText)
                        callback(JSON.parse(req.responseText), thisKey, thisNode);
                } else {
                    // Handle error case
                    console.log("could not load content")
                    _this.cout("could not load content");
                }
            }
        };
        req.send();

    }
    catch (e) {
        this.cout("could not connect to" + url);
    }
};

/**
 * POST data as json to url, calling callback with the
 * JSON-encoded response data when finished
 * @param {String} url
 * @param {Object} body
 * @param {Function<Error, Object>} callback
 */
realityEditor.network.postData = function(url, body, callback) {
    var request = new XMLHttpRequest();
    var params = JSON.stringify(body);
    request.open('POST', url, true);
    request.onreadystatechange = function () {
        if (request.readyState !== 4) {
            return;
        }
        if (!callback) {
            return;
        }

        if (request.status === 200) {
            try {
                callback(null, JSON.parse(request.responseText));
            } catch(e) {
                callback({status: request.status, error: e, failure: true}, null);
            }
            return;
        }

        callback({status: request.status, failure: true}, null);
    };

    request.setRequestHeader("Content-type", "application/json");
    //request.setRequestHeader("Content-length", params.length);
    // request.setRequestHeader("Connection", "close");
    request.send(params);
};

realityEditor.network.postLinkToServer = function(linkObject, objects){
    var thisTempObject = objects[linkObject.objectA];
    var thisTempObjectLinks = thisTempObject.links;
    var thisOtherTempObject = objects[linkObject.objectB];

    var okForNewLink = this.checkForNetworkLoop(linkObject.objectA, linkObject.nodeA, linkObject.logicA, linkObject.objectB, linkObject.nodeB, linkObject.logicB);

    //  window.location.href = "of://event_" + objects[globalProgram.objectA].visible;

    if (okForNewLink) {
        var thisKeyId = this.realityEditor.device.utilities.uuidTimeShort();

        var namesA, namesB;

        if(linkObject.logicA !== false){

            var color;

            if(linkObject.logicA === 0) color = "BLUE";
            if(linkObject.logicA === 1) color = "GREEN";
            if(linkObject.logicA === 2) color = "YELLOW";
            if(linkObject.logicA === 3) color = "RED";

            namesA = [thisTempObject.name, thisTempObject.nodes[linkObject.nodeA].name +":"+color];
        } else {
            namesA =  [thisTempObject.name, thisTempObject.nodes[linkObject.nodeA].name];
        }

        if(linkObject.logicB !== false){

            var color;

            if(linkObject.logicB === 0) color = "BLUE";
            if(linkObject.logicB === 1) color = "GREEN";
            if(linkObject.logicB === 2) color = "YELLOW";
            if(linkObject.logicB === 3) color = "RED";

            namesB = [thisOtherTempObject.name, thisOtherTempObject.nodes[linkObject.nodeB].name +":"+color];
        } else {
            namesB =  [thisOtherTempObject.name, thisOtherTempObject.nodes[linkObject.nodeB].name];
        }
        
        thisTempObjectLinks[thisKeyId] = {
            objectA: linkObject.objectA,
            objectB: linkObject.objectB,
            nodeA: linkObject.nodeA,
            nodeB: linkObject.nodeB,
            logicA: linkObject.logicA,
            logicB: linkObject.logicB,
            namesA: namesA,
            namesB: namesB
        };

        // push new connection to objectA
        //todo this is a work around to not crash the server. only temporarly for testing
        //  if(globalProgram.logicA === false && globalProgram.logicB === false) {
        this.postNewLink(thisTempObject.ip, linkObject.objectA, thisKeyId, thisTempObjectLinks[thisKeyId]);
        //  }
    }
};

realityEditor.network.postNewLink = function(ip, thisObjectKey, thisKey, content) {
    // generate action for all links to be reloaded after upload
    content.lastEditor = globalStates.tempUuid;
        this.cout("sending Link");
    this.postData('http://' + ip + ':' + httpPort + '/object/' + thisObjectKey + "/link/" + thisKey, content);
};

realityEditor.network.postNewNode = function(ip, objectKey, nodeKey, node) {
    node.lastEditor = globalStates.tempUuid;
    this.postData('http://' + ip + ':' + httpPort + '/object/' + objectKey + '/node/' + nodeKey, node, function(err) {
        if (err) {
            console.log('postNewNode error:', err);
        }
    });

};

realityEditor.network.postNewBlockLink = function(ip, thisObjectKey, thisLogicKey, thisBlockLinkKey, blockLink) {
    this.cout("sending Block Link");
    var simpleBlockLink = this.realityEditor.gui.crafting.utilities.convertBlockLinkToServerFormat(blockLink);
    simpleBlockLink.lastEditor = globalStates.tempUuid;
    // /logic/*/*/link/*/
    this.postData('http://' + ip + ':' + httpPort + '/logic/' + thisObjectKey + "/" + thisLogicKey + "/link/" + thisBlockLinkKey, simpleBlockLink);
};

realityEditor.network.postNewLogicNode = function(ip, thisObjectKey, thisLogicKey, logic) {
    this.cout("sending Logic Node");
    // /logic/*/*/node/

    var simpleLogic = this.realityEditor.gui.crafting.utilities.convertLogicToServerFormat(logic);
    simpleLogic.lastEditor = globalStates.tempUuid;
    this.postData('http://' + ip + ':' + httpPort + '/logic/' + thisObjectKey + "/" + thisLogicKey + "/node/", simpleLogic);
};

realityEditor.network.postNewBlockPosition = function(ip, thisObjectKey, thisLogicKey, thisBlockKey, content) {
    // generate action for all links to be reloaded after upload
    this.cout("I am moving a block: " + ip);
    // /logic/*/*/block/*/
    content.lastEditor = globalStates.tempUuid;
    if (typeof content.x === "number" && typeof content.y === "number") {
        this.postData('http://' + ip + ':' + httpPort + '/logic/' + thisObjectKey + "/" + thisLogicKey +"/blockPosition/" + thisBlockKey, content);
    }
};

realityEditor.network.postNewBlock = function(ip, thisObjectKey, thisLogicKey, thisBlockKey, block) {
    this.cout("sending Block");
    // /logic/*/*/block/*/
    block.lastEditor = globalStates.tempUuid;
    this.postData('http://' + ip + ':' + httpPort + '/logic/' + thisObjectKey + "/" + thisLogicKey + "/block/" + thisBlockKey, block);
};

realityEditor.network.checkForNetworkLoop = function(globalObjectA, globalLocationInA, globalLogicA, globalObjectB, globalLocationInB,globalLogicB) {
    var signalIsOk = true;
    var thisTempObject = objects[globalObjectA];
    var thisTempObjectLinks = thisTempObject.links;

    // check if connection is with it self
    if (globalObjectA === globalObjectB && globalLocationInA === globalLocationInB) {
        signalIsOk = false;
    }

    // todo check that objects are making these checks as well for not producing overlapeses.
    // check if this connection already exists?
    if (signalIsOk) {
        for (var thisSubKey in thisTempObjectLinks) {
            if (thisTempObjectLinks[thisSubKey].objectA === globalObjectA &&
                thisTempObjectLinks[thisSubKey].objectB === globalObjectB &&
                thisTempObjectLinks[thisSubKey].nodeA === globalLocationInA &&
                thisTempObjectLinks[thisSubKey].nodeB === globalLocationInB) {
                signalIsOk = false;
            }
        }
    }
    // check that there is no endless loops through it self or any other connections
    if (signalIsOk) {
        searchL(globalLocationInB, globalObjectB, globalLocationInA, globalObjectA);

        function searchL(nodeB, objectB, nodeA, objectA) {
            for (var key in objects[objectB].links) {
                this.cout(objectB);
                var Bn = objects[objectB].links[key];
                if (nodeB === Bn.nodeA) {
                    if (nodeA === Bn.nodeB && objectA === Bn.objectB) {
                        signalIsOk = false;
                        break;
                    } else {
                        searchL(Bn.nodeB, Bn.objectB, nodeA, objectA);
                    }
                }
            }
        }
    }

    return signalIsOk;
};


realityEditor.network.sendResetContent = function(object, node, type) {
// generate action for all links to be reloaded after upload

    var tempThisObject = {};
    if (type === "node") {
        tempThisObject = objects[object].nodes[node];
    } else if(type === "logic"){
        // todo might result in error??
        tempThisObject = objects[object].nodes[node];
    }
    else if (type === "ui"){
        tempThisObject = objects[object];
    }
    var content = {};
    content.x = tempThisObject.x;
    content.y = tempThisObject.y;
    content.scale = tempThisObject.scale;

    if (typeof tempThisObject.matrix === "object") {
        content.matrix = tempThisObject.matrix;
    }

    content.lastEditor = globalStates.tempUuid;
    if (typeof content.x === "number" && typeof content.y === "number" && typeof content.scale === "number") {
        this.postData('http://' + objects[object].ip + ':' + httpPort + '/object/' + object + "/size/" + node, content);
    }

};

/**
 * @desc
 * @param objectKey
 * @param nodeKey
 * @return
 **/


realityEditor.network.onElementLoad = function(objectKey, nodeKey) {

    globalStates.notLoading = false;
    // window.location.href = "of://event_test_"+nodeKey;

    // cout("posting Msg");
    var nodes;
    var version = 170;
    if (!objects[objectKey]) {
        nodes = {};
    } else {
        nodes = objects[objectKey].nodes;
        version = objects[objectKey].integerVersion;
    }

    var oldStyle = {
        obj: objectKey,
        pos: nodeKey,
        objectValues: nodes
    };

    var newStyle = {
        object: objectKey,
        objectData: objects[objectKey],
        node: nodeKey,
        nodes: nodes
    };

    if (version < 170) {
        newStyle = oldStyle;
    }
    globalDOMCach["iframe" + nodeKey]._loaded = true;
    globalDOMCach["iframe" + nodeKey].contentWindow.postMessage(
        JSON.stringify(newStyle), '*');
    this.cout("on_load");
};
