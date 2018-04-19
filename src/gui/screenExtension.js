createNameSpace("realityEditor.gui.screenExtension");

realityEditor.gui.screenExtension.screenObject = {
    touchState : null,
    closestObject : null,
    x : 0,
    y : 0,
    scale : 1,
    object : null,
    frame : null,
    node : null,
    isScreenVisible: false,
    touchOffsetX: 0,
    touchOffsetY: 0
};
realityEditor.gui.screenExtension.activeScreenObject = {
    object : null,
    frame : null,
    node : null
};

realityEditor.gui.screenExtension.touchStart = function (eventObject){

    if (globalStates.guiState !== 'ui') return;

    // this.updateScreenObject(eventObject);
    this.onScreenTouchDown(eventObject);
    
    var didTouchARFrame = (!!this.screenObject.object && !!this.screenObject.frame);
    
    if(realityEditor.gui.screenExtension.activeScreenObject.frame && !didTouchARFrame) {
        realityEditor.gui.screenExtension.sendScreenObject();
    }
};

realityEditor.gui.screenExtension.touchMove = function (eventObject){

    if (globalStates.guiState !== 'ui') return;

    // this.updateScreenObject(eventObject);
    this.onScreenTouchMove(eventObject);

    var thisVisualization = "";
    if (this.screenObject.object && this.screenObject.frame) {
        var activeFrame = realityEditor.getFrame(this.screenObject.object, this.screenObject.frame);
        if (activeFrame) {
            thisVisualization = activeFrame.visualization;
        }
    }
    
    if(realityEditor.gui.screenExtension.activeScreenObject.frame && thisVisualization !== "ar") {
        realityEditor.gui.screenExtension.sendScreenObject();
    }
};

realityEditor.gui.screenExtension.touchEnd = function (eventObject){

    // if (globalStates.guiState !== 'ui') return;

    // this.updateScreenObject(eventObject);
    this.onScreenTouchUp(eventObject);
    if(realityEditor.gui.screenExtension.activeScreenObject.frame) {
        realityEditor.gui.screenExtension.sendScreenObject();
        
    }
    
    this.screenObject.x = 0;
    this.screenObject.y = 0;
    this.screenObject.scale = 1;
    // this.screenObject.object = null;
    // this.screenObject.frame = null;
    // this.screenObject.node = null;
    this.screenObject.closestObject = null;
    this.screenObject.touchState = null;
    
    globalStates.initialDistance = null;
    
    globalStates.didStartPullingFromScreen = false;
    
    //console.log("end", this.screenObject);
};

realityEditor.gui.screenExtension.onScreenTouchDown = function(eventObject) {
    // figure out if I'm touching on AR frame, screen frame, or nothing
    // console.log('onScreenTouchDown', eventObject, this.screenObject);

    this.screenObject.closestObject = realityEditor.gui.ar.getClosestObject()[0];
    this.screenObject.touchState = eventObject.type;

    this.screenObject.object = eventObject.object;
    this.screenObject.frame = eventObject.frame;
    this.screenObject.node = eventObject.node;

    var didTouchARFrame = (!!eventObject.object && !!eventObject.frame);

    this.screenObject.isScreenVisible = !didTouchARFrame;
    globalStates.didStartPullingFromScreen = !didTouchARFrame;

    if (this.screenObject.closestObject && !didTouchARFrame) {

        // calculate the exact x,y coordinate within the screen plane that this touch corresponds to
        var point = realityEditor.gui.ar.utilities.screenCoordinatesToMarkerXY(this.screenObject.closestObject, eventObject.x, eventObject.y);
        this.screenObject.x = point.x;
        this.screenObject.y = point.y;
    }


    // console.log(this.screenObject);
};

realityEditor.gui.screenExtension.onScreenTouchMove = function(eventObject) {
    // do nothing other than send xy to screen // maybe iff I'm touching on screen frame, move AR frame to mirror its position
    // console.log('onScreenTouchMove', eventObject, this.screenObject);

    this.screenObject.closestObject = realityEditor.gui.ar.getClosestObject()[0];
    this.screenObject.touchState = eventObject.type;
    
    // if (this.screenObject.object && this.screenObject.frame) {
    //     var activeFrame = realityEditor.getFrame(this.screenObject.object, this.screenObject.frame);
        // console.log(activeFrame.visualization);
    // }
    
    if (!this.screenObject.closestObject) {
        return;
    }
    
    // calculate the exact x,y coordinate within the screen plane that this touch corresponds to
    var point = realityEditor.gui.ar.utilities.screenCoordinatesToMarkerXY(this.screenObject.closestObject, eventObject.x, eventObject.y);
    this.screenObject.x = point.x;
    this.screenObject.y = point.y;

    // also needs to update AR frame positions so that nodes float above them
    if (this.screenObject.object && this.screenObject.frame && this.screenObject.object === this.screenObject.closestObject) {
        var matchingARFrame = realityEditor.getFrame(this.screenObject.object, this.screenObject.frame);
        if (matchingARFrame && matchingARFrame.visualization === 'screen') {
            // keep the invisible AR frames synchronized with the position of their screen frames (so that nodes are in same place and pulls out in the right place)
            matchingARFrame.ar.x = point.x;
            matchingARFrame.ar.y = point.y;

            // console.log('mirroring position for frame ' + matchingARFrame.name);
            // if (this.screenObject.scale) {
            //     matchingARFrame.ar.scale = this.screenObject.scale;
            // }
        }
    }
    
    // console.log(this.screenObject);
};

realityEditor.gui.screenExtension.onScreenTouchUp = function(eventObject) {
    // reset screen object to null and update screen state to match
    // console.log('onScreenTouchUp', eventObject, this.screenObject);

    this.screenObject.closestObject = realityEditor.gui.ar.getClosestObject()[0];
    this.screenObject.touchState = eventObject.type;

    this.screenObject.object = null;
    this.screenObject.frame = null;
    this.screenObject.node = null;
    
    // console.log(this.screenObject);
};

realityEditor.gui.screenExtension.update = function (){

    if (globalStates.guiState !== 'ui') return;
    if (!realityEditor.gui.ar.draw.areAnyScreensVisible()) return;

    // console.log("end", this.screenObject);
    if(this.screenObject.touchState) {
        if(realityEditor.gui.screenExtension.activeScreenObject.frame) {
            realityEditor.gui.screenExtension.calculatePushPop();
            return;
        }
    }
    
    if (globalStates.framePullThreshold > globalStates.minFramePullThreshold) {
        globalStates.framePullThreshold -= 5;
    }
};

realityEditor.gui.screenExtension.receiveObject = function (object){

    // console.log('receiveObject', object);
    this.screenObject.object = object.object;
    this.screenObject.frame = object.frame;
    this.screenObject.node = object.node;
    this.screenObject.touchOffsetX = object.touchOffsetX;
    this.screenObject.touchOffsetY = object.touchOffsetY;
    
};

/*
realityEditor.gui.screenExtension.updateScreenObject = function (eventObject){

    if (globalStates.guiState !== 'ui') return;
    if (!realityEditor.gui.ar.draw.areAnyScreensVisible()) return;

    this.screenObject.closestObject = realityEditor.gui.ar.getClosestObject()[0];
    this.screenObject.touchState = eventObject.type;
    
    if(eventObject.type === "touchstart") {
        onScreenTouchDown(eventObject);
    } else if (eventObject.type === "touchmove") {
        onScreenTouchMove(eventObject);
    } else if (eventObject.type === "touchend") {
        onScreenTouchUp(eventObject);
    }
    
    if (this.screenObject.closestObject && this.screenObject.isScreenVisible  && eventObject.type !== "touchend") {
        
        // calculate the exact x,y coordinate within the screen plane that this touch corresponds to
        var point = realityEditor.gui.ar.utilities.screenCoordinatesToMarkerXY(this.screenObject.closestObject, eventObject.x, eventObject.y);
        this.screenObject.x = point.x; 
        this.screenObject.y = point.y;
        
        if (this.screenObject.object && this.screenObject.frame && this.screenObject.object === this.screenObject.closestObject) {
            var matchingARFrame = realityEditor.getFrame(this.screenObject.object, this.screenObject.frame);
            if (matchingARFrame && matchingARFrame.visualization === 'screen') {
                // keep the invisible AR frames synchronized with the position of their screen frames (so that nodes are in same place and pulls out in the right place)
                matchingARFrame.ar.x = point.x;
                matchingARFrame.ar.y = point.y;
            }
        }
    }
};
*/

realityEditor.gui.screenExtension.onScreenPushIn = function(screenFrame) {
    // set screen object visible, wait to hear that the screen received it, then hide AR frame
    
    var isScreenVisible = true;

    if (isScreenVisible !== this.screenObject.isScreenVisible) {

        console.log('onScreenPushIn');

        this.screenObject.isScreenVisible = true;
        this.screenObject.scale = realityEditor.gui.ar.positioning.getPositionData(screenFrame).scale;
        // realityEditor.gui.ar.draw.changeVisualization(screenFrame, newVisualization); // TODO: combine this with updateArFrameVisibility
        realityEditor.app.tap();
        realityEditor.gui.screenExtension.updateArFrameVisibility();
    }

};

realityEditor.gui.screenExtension.onScreenPullOut = function(screenFrame) {
    // set screen object hidden, wait to hear that the screen received it, then move AR frame to position and show AR frame

    var isScreenVisible = false;

    if (isScreenVisible !== this.screenObject.isScreenVisible) {

        console.log('onScreenPullOut');

        this.screenObject.isScreenVisible = false;
        // realityEditor.gui.ar.draw.changeVisualization(screenFrame, newVisualization); // TODO: combine this with updateArFrameVisibility
        realityEditor.app.tap();
        realityEditor.gui.screenExtension.updateArFrameVisibility();
    }

};

realityEditor.gui.screenExtension.calculatePushPop = function() {
    if (globalStates.freezeButtonState) return; // don't allow pushing and pulling if the background is frozen
    
    var screenFrame = realityEditor.getFrame(this.screenObject.object, this.screenObject.frame);

    var isScreenObjectVisible = !!realityEditor.gui.ar.draw.visibleObjects[this.screenObject.object];
    if (screenFrame && isScreenObjectVisible) {
        if (screenFrame.location === 'global') { // only able to push global frames into the screen

            // calculate distance to frame
            var screenFrameMatrix = realityEditor.gui.ar.utilities.repositionedMatrix(realityEditor.gui.ar.draw.visibleObjects[this.screenObject.object], screenFrame);
            var distanceToFrame = realityEditor.gui.ar.utilities.distance(screenFrameMatrix);
            if (!globalStates.initialDistance) {
                globalStates.initialDistance = distanceToFrame;
            }

            var distanceThreshold = globalStates.framePullThreshold;
            console.log(distanceThreshold);

            if (distanceToFrame > (globalStates.initialDistance + distanceThreshold)) {
                this.onScreenPullOut(screenFrame);
            } else if (distanceToFrame < (globalStates.initialDistance - distanceThreshold)) {
                this.onScreenPushIn(screenFrame);
            }
            
        }
    } else {
        if (globalStates.framePullThreshold > globalStates.minFramePullThreshold) {
            globalStates.framePullThreshold -= 5;
        }
    }
};

/*
realityEditor.gui.screenExtension.calculatePushPop = function (){
    
    var screenFrame = realityEditor.getFrame(this.screenObject.object, this.screenObject.frame);
    
    if (!screenFrame && globalStates.inTransitionObject && globalStates.inTransitionFrame) {
        this.screenObject.object = this.screenObject.closestObject;
        this.screenObject.frame = globalStates.inTransitionFrame;
        screenFrame = realityEditor.getFrame(globalStates.inTransitionObject, globalStates.inTransitionFrame);
    }

    var isScreenObjectVisible = !!realityEditor.gui.ar.draw.visibleObjects[this.screenObject.object];
    if (screenFrame && isScreenObjectVisible) {

        
        var screenFrameMatrix = realityEditor.gui.ar.utilities.repositionedMatrix(realityEditor.gui.ar.draw.visibleObjects[this.screenObject.object], screenFrame);

        if (globalStates.inTransitionObject && globalStates.inTransitionFrame) {
            if (!globalStates.initialDistance) {
                var realDistanceToUnconstrainedFrame = realityEditor.gui.ar.utilities.distance(screenFrameMatrix);
                globalStates.initialDistance = realDistanceToUnconstrainedFrame * 0.9; // make global frames a bit harder to push into the screen by *= 0.9
            }
            console.log('screen frame is a global frame switching between objects');
            var identityPosition = {
                x: 0,
                y: 0,
                scale: 1.0,
                matrix: realityEditor.gui.ar.draw.utilities.newIdentityMatrix()
            };
            screenFrameMatrix = realityEditor.gui.ar.utilities.repositionedMatrix(realityEditor.gui.ar.draw.visibleObjects[this.screenObject.object], identityPosition);
        }
        
        // Method 1. Use the full distance to the frame.
        var distanceToFrame = realityEditor.gui.ar.utilities.distance(screenFrameMatrix);
        
        if (!globalStates.initialDistance) {
            globalStates.initialDistance = distanceToFrame;
        }

        // console.log('I have a screen frame', this.screenObject.object, this.screenObject.frame, distanceToFrame, globalStates.initialDistance);

        var isScreenVisible = this.screenObject.isScreenVisible;
        
        var distanceThreshold = globalStates.framePullThreshold;

        if (distanceToFrame > (globalStates.initialDistance + distanceThreshold)) {
            isScreenVisible = false;
        } else if (distanceToFrame < (globalStates.initialDistance - distanceThreshold)) {
            isScreenVisible = true;
        }
        
        if (isScreenVisible !== this.screenObject.isScreenVisible) {
            
            var newVisualization = isScreenVisible ? 'screen' : 'ar';
            
            if (newVisualization === 'screen') {
                this.screenObject.scale = realityEditor.gui.ar.positioning.getPositionData(screenFrame).scale;
            }
            
            realityEditor.gui.ar.draw.changeVisualization(screenFrame, newVisualization); // TODO: combine this with updateArFrameVisibility
            
            realityEditor.app.tap();
            
            this.screenObject.isScreenVisible = isScreenVisible;
            realityEditor.gui.screenExtension.updateArFrameVisibility();
        }

    }
};
*/

realityEditor.gui.screenExtension.sendScreenObject = function (){
    var isActiveScreenObjectVisible = !!realityEditor.gui.ar.draw.visibleObjects[this.activeScreenObject.object];
    if(this.activeScreenObject.frame && isActiveScreenObjectVisible) {
        var iframe = globalDOMCache["iframe" + this.activeScreenObject.frame];
        if (iframe) {
            iframe.contentWindow.postMessage(JSON.stringify({
                screenObject: this.screenObject
            }), '*');
        }
    }
};

realityEditor.gui.screenExtension.updateArFrameVisibility = function (){
    var thisFrame = realityEditor.getFrame(this.screenObject.object, this.screenObject.frame);
    if(thisFrame) {

        globalStates.initialDistance = null;
        globalStates.framePullThreshold = globalStates.maxFramePullThreshold;

        if (this.screenObject.isScreenVisible) {
            thisFrame.visualization = "screen";

            console.log('hide frame -> screen');

            if (thisFrame.currentTouchOffset) {
                this.screenObject.touchOffsetX = (thisFrame.currentTouchOffset.x - parseInt(thisFrame.width) * thisFrame.ar.scale * 0.5) / thisFrame.ar.scale; //(thisFrame.currentTouchOffset.x) / thisFrame.ar.scale;
                this.screenObject.touchOffsetY = ((thisFrame.currentTouchOffset.y) - parseInt(thisFrame.height) * thisFrame.ar.scale * 0.5) / thisFrame.ar.scale; /// thisFrame.ar.scale;
                
                console.log(this.screenObject.touchOffsetX, this.screenObject.touchOffsetY);
            }

            realityEditor.gui.ar.draw.hideTransformed(thisFrame.uuid, thisFrame, globalDOMCache, cout);
            
        } else {
            thisFrame.visualization = "ar";
            
            thisFrame.ar.matrix = [];
            thisFrame.temp = realityEditor.gui.ar.utilities.newIdentityMatrix();
            thisFrame.begin = realityEditor.gui.ar.utilities.newIdentityMatrix();
            // thisFrame.currentTouchOffset = {
            //     x: globalStates.height/2,
            //     y: globalStates.width/2
            // };

            thisFrame.currentTouchOffset = {
                x: (thisFrame.width/2 * thisFrame.ar.scale) + (0.5 * parseInt(thisFrame.width) * thisFrame.ar.scale),
                y: (thisFrame.height/2 * thisFrame.ar.scale) + (0.5 * parseInt(thisFrame.height) * thisFrame.ar.scale)
            };

            // thisFrame.currentTouchOffset = {
            //     x: (this.screenObject.touchOffsetX * thisFrame.ar.scale) + (0.5 * parseInt(thisFrame.width) * thisFrame.ar.scale),
            //     y: (this.screenObject.touchOffsetY * thisFrame.ar.scale) + (0.5 * parseInt(thisFrame.height) * thisFrame.ar.scale)
            // };
            
            // thisFrame.currentTouchOffset = null;
            
            console.log('show frame -> AR');

            var activeKey = thisFrame.uuid;
            // resize iframe to override incorrect size it starts with so that it matches the screen frame
            var iframe = globalDOMCache['iframe' + activeKey];
            var overlay = globalDOMCache[activeKey];
            var svg = globalDOMCache['svg' + activeKey];

            iframe.style.width = thisFrame.frameSizeX + 'px';
            iframe.style.height = thisFrame.frameSizeY + 'px';
            iframe.style.left = ((globalStates.height - thisFrame.frameSizeX) / 2) + "px";
            iframe.style.top = ((globalStates.width - thisFrame.frameSizeY) / 2) + "px";

            overlay.style.width = iframe.style.width;
            overlay.style.height = iframe.style.height;
            overlay.style.left = iframe.style.left;
            overlay.style.top = iframe.style.top;

            svg.style.width = iframe.style.width;
            svg.style.height = iframe.style.height;
            realityEditor.gui.ar.moveabilityOverlay.createSvg(svg);

            var touchPosition = realityEditor.gui.ar.positioning.getMostRecentTouchPosition();
            realityEditor.gui.ar.positioning.moveVehicleToScreenCoordinateBasedOnMarker(thisFrame, touchPosition.x, touchPosition.y, true);

            // realityEditor.gui.menus.on("editing", ["unconstrained"]);
            // globalStates.previousUnconstrainedPositioning = globalStates.unconstrainedPositioning;
            // globalStates.unconstrainedPositioning = true;
            globalStates.editingPulledScreenFrame = true;
            globalStates.unconstrainedSnapInitialPosition = null;
            realityEditor.device.beginTouchEditing(overlay);
            
        }
        console.log('updateArFrameVisibility', thisFrame.visualization);
        // realityEditor.gui.ar.draw.changeVisualization(thisFrame, thisFrame.visualization);

        realityEditor.gui.screenExtension.sendScreenObject();
        realityEditor.network.updateFrameVisualization(objects[thisFrame.objectId].ip, thisFrame.objectId, thisFrame.uuid, thisFrame.visualization);

    }
};
