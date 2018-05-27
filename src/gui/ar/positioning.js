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


createNameSpace("realityEditor.gui.ar.positioning");

/**
 * @typedef initialScaleData
 * @property radius {number} how far apart in pixels the two touches are to begin with
 * @property scale {number} the frame or node's initial scale value before the gesture, to use as a base multiplier
 */
realityEditor.gui.ar.positioning.initialScaleData = null;

/**
 * Scales the specified frame or node using the first two touches.
 * The new scale starts at the initial scale and varies linearly with the changing touch radius.
 * @param {Frame|Node} activeVehicle the frame or node you are scaling
 * @param {Object.<x,y>} centerTouch the first touch event, where the scale is centered from
 * @param {Object.<x,y>} outerTouch the other touch, where the scale extends to
 */
realityEditor.gui.ar.positioning.scaleVehicle = function(activeVehicle, centerTouch, outerTouch) {
    
    if (!centerTouch || !outerTouch || !centerTouch.x || !centerTouch.y || !outerTouch.x || !outerTouch.y) {
        console.warn('trying to scale vehicle using improperly formatted touches');
        return;
    }

    var dx = centerTouch.x - outerTouch.x;
    var dy = centerTouch.y - outerTouch.y;
    var radius = Math.sqrt(dx * dx + dy * dy);

    var positionData = realityEditor.gui.ar.positioning.getPositionData(activeVehicle);

    if (!this.initialScaleData) {
        this.initialScaleData = {
            radius: radius,
            scale: positionData.scale
        };
        return;
    }

    // calculate the new scale based on the radius between the two touches
    var newScale = this.initialScaleData.scale + (radius - this.initialScaleData.radius) / 300;
    if (typeof newScale !== 'number') return;

    // TODO: this only works for frames right now, not nodes (at least not after scaling nodes twice in one gesture)
    // manually calculate positionData.x and y to keep centerTouch in the same place relative to the vehicle
    var overlayDiv = document.getElementById(activeVehicle.uuid);
    var touchOffset = realityEditor.device.editingState.touchOffset;
    if (overlayDiv && touchOffset) {
        var touchOffsetFromCenter = {
            x: overlayDiv.clientWidth/2 - touchOffset.x,
            y: overlayDiv.clientHeight/2 - touchOffset.y
        };
        var scaleDifference = Math.max(0.2, newScale) - positionData.scale;
        positionData.x += touchOffsetFromCenter.x * scaleDifference;
        positionData.y += touchOffsetFromCenter.y * scaleDifference;
    }
    
    positionData.scale = Math.max(0.2, newScale); // 0.2 is the minimum scale allowed

    // redraw circles to visualize the new scaling
    globalCanvas.context.clearRect(0, 0, globalCanvas.canvas.width, globalCanvas.canvas.height);

    // draw a blue circle visualizing the initial radius
    var circleCenterCoordinates = [centerTouch.x, centerTouch.y];
    var circleEdgeCoordinates = [outerTouch.x, outerTouch.y];
    realityEditor.gui.ar.lines.drawBlue(globalCanvas.context, circleCenterCoordinates, circleEdgeCoordinates, this.initialScaleData.radius);

    // draw a red or green circle visualizing the new radius
    if (radius < this.initialScaleData.radius) {
        realityEditor.gui.ar.lines.drawRed(globalCanvas.context, circleCenterCoordinates, circleEdgeCoordinates, radius);
    } else {
        realityEditor.gui.ar.lines.drawGreen(globalCanvas.context, circleCenterCoordinates, circleEdgeCoordinates, radius);
    }
};

/**
 * Primary method to move a transformed frame or node to the (x,y) point on its plane where the (screenX,screenY) ray cast intersects
 * @param activeVehicle {Frame|Node}
 * @param screenX {number}
 * @param screenY {number} 
 * @param useTouchOffset {boolean}  if false, puts (0,0) coordinate of frame/node at the resulting point.
 *                                  if true, the first time you call it, it determines the x,y offset to drag the frame/node
 *                                  from the ray cast without it jumping, and subsequently drags it from that point
 */
realityEditor.gui.ar.positioning.moveVehicleToScreenCoordinate = function(activeVehicle, screenX, screenY, useTouchOffset) {
    
    var results = realityEditor.gui.ar.utilities.screenCoordinatesToMatrixXY(activeVehicle, screenX, screenY, true);
    this.applyParentScaleToDragPosition(activeVehicle, results.point);

    var positionData = this.getPositionData(activeVehicle);

    var newPosition = {
        x: results.point.x - results.offsetLeft,
        y: results.point.y - results.offsetTop
    };

    if (useTouchOffset) {

        var changeInPosition = {
            x: newPosition.x - positionData.x,
            y: newPosition.y - positionData.y
        };

        if (!realityEditor.device.editingState.touchOffset) {
            realityEditor.device.editingState.touchOffset = changeInPosition;
        } else {
            positionData.x = newPosition.x - realityEditor.device.editingState.touchOffset.x;
            positionData.y = newPosition.y - realityEditor.device.editingState.touchOffset.y;
        }

    } else {

        realityEditor.device.editingState.touchOffset = null;
        positionData.x = newPosition.x;
        positionData.y = newPosition.y;

    }
};

/**
 * Because node positions are affected by scale of parent while rendering, divide by scale of parent while dragging
 * @param activeVehicle
 * @param pointReference {{x: number, y: number}} object containing the x and y values you want to adjust
 */
realityEditor.gui.ar.positioning.applyParentScaleToDragPosition = function(activeVehicle, pointReference) {

    if (typeof activeVehicle.type !== 'undefined' && activeVehicle.type !== 'logic' && activeVehicle.type !== 'ui') {
        // position is affected by parent frame scale
        var parentFrame = realityEditor.getFrame(activeVehicle.objectId, activeVehicle.frameId);
        if (parentFrame) {
            var parentFramePositionData = realityEditor.gui.ar.positioning.getPositionData(parentFrame);
            pointReference.x /= (parentFramePositionData.scale/globalStates.defaultScale);
            pointReference.y /= (parentFramePositionData.scale/globalStates.defaultScale);
        }
    }
    
};

/**
 * Similar to moveVehicleToScreenCoordinate, but instead of using the frame/node's matrix, uses visibleObject matrix of
 *      the marker plane as the basis for the computation. Simpler computation but doesn't work for unconstrained repositioning (I think?)
 * @param activeVehicle
 * @param screenX
 * @param screenY
 * @param useTouchOffset
 */
realityEditor.gui.ar.positioning.moveVehicleToScreenCoordinateBasedOnMarker = function(activeVehicle, screenX, screenY, useTouchOffset) {

    var positionData = this.getPositionData(activeVehicle);
    var hasBeenUnconstrainedEdited = positionData.matrix.length > 0;

    var unconstrainedMatrix = undefined;
    if (hasBeenUnconstrainedEdited) {
        unconstrainedMatrix = [];
        realityEditor.gui.ar.utilities.multiplyMatrix(positionData.matrix, activeVehicle.temp, unconstrainedMatrix);
    }

    var objectKey = activeVehicle.objectId;
    var point = realityEditor.gui.ar.utilities.screenCoordinatesToMarkerXY(objectKey, screenX, screenY, unconstrainedMatrix);
    this.applyParentScaleToDragPosition(activeVehicle, point);

    if (useTouchOffset) {

        var changeInPosition = {
            x: point.x - positionData.x,
            y: point.y - positionData.y
        };

        if (!realityEditor.device.editingState.touchOffset) {
            realityEditor.device.editingState.touchOffset = changeInPosition;
        } else {
            positionData.x = point.x - realityEditor.device.editingState.touchOffset.x;
            positionData.y = point.y - realityEditor.device.editingState.touchOffset.y;
        }

    } else {

        realityEditor.device.editingState.touchOffset = null;
        positionData.x = point.x;
        positionData.y = point.y;

    }
};

// TODO: outdated documentation
// for frames, return position data within 'ar' property (no need to return 'screen' anymore since that never happens within the editor)
// for nodes, return position data directly from the object.
// for nodes, also compute 'combinedPosition' which is the final transformation including the frame it belongs to.
// combinedPosition should be a read-only property, while position (x,y,scale,matrix) can be read-write
realityEditor.gui.ar.positioning.getPositionData = function(activeVehicle) {

    if (activeVehicle.hasOwnProperty('visualization')) {
        return activeVehicle.ar;
    }

    // add node's position to its frame's position to gets its actual offset
    
    if (typeof activeVehicle.type !== 'undefined' && activeVehicle.type !== 'ui' && activeVehicle.type !== 'logic') {
        var frame = realityEditor.getFrame(activeVehicle.objectId, activeVehicle.frameId);
        if (frame) {
            var parentFramePositionData = realityEditor.gui.ar.positioning.getPositionData(frame);

            if (typeof activeVehicle.relativeMatrix === 'undefined') { // TODO: temporary fix - make sure it gets initialized with one loaded in from server
                activeVehicle.relativeMatrix = [];
            }

            // TODO: offload this computation into the setPositionDataMatrix function so it only runs on write, not on read (more common)
            if (parentFramePositionData.matrix.length === 16) {
                if (activeVehicle.relativeMatrix.length === 16) {
                    // both have matrix -> multiply
                    realityEditor.gui.ar.draw.utilities.multiplyMatrix(activeVehicle.relativeMatrix, parentFramePositionData.matrix, activeVehicle.matrix);

                } else {
                    // only parent frame has matrix -> just use that
                    activeVehicle.matrix = realityEditor.gui.ar.utilities.copyMatrix(parentFramePositionData.matrix);
                }
            } else {
                // only this node has matrix -> just use that
                activeVehicle.matrix = realityEditor.gui.ar.utilities.copyMatrix(activeVehicle.relativeMatrix);
            }
        }
    }
    
    // logic nodes and frames just use their own x, y, and matrix

    return activeVehicle;
};

realityEditor.gui.ar.positioning.setPositionDataMatrix = function(activeVehicle, newMatrixValue) {
    
    // logic nodes and frames don't need to update relativeMatrix
    if (typeof activeVehicle.type !== 'undefined' && activeVehicle.type !== 'ui' && activeVehicle.type !== 'logic') {
        
        if (!newMatrixValue || newMatrixValue.constructor !== Array) {
            console.warn('trying to set relativeMatrix to a non-array value');
            return;
        }
        
        activeVehicle.relativeMatrix = realityEditor.gui.ar.utilities.copyMatrix(newMatrixValue);

        // update the .matrix in response to the new .relativeMatrix value
        var frame = realityEditor.getFrame(activeVehicle.objectId, activeVehicle.frameId);
        if (frame) {
            var parentFramePositionData = realityEditor.gui.ar.positioning.getPositionData(frame);
            if (typeof activeVehicle.relativeMatrix === 'undefined') { // TODO: temporary fix - make sure it gets initialized with one loaded in from server
                activeVehicle.relativeMatrix = [];
            }

            if (parentFramePositionData.matrix.length === 16) {
                if (activeVehicle.relativeMatrix.length === 16) {
                    // both have matrix -> multiply
                    realityEditor.gui.ar.draw.utilities.multiplyMatrix(realityEditor.gui.ar.utilities.invertMatrix(parentFramePositionData.matrix), activeVehicle.relativeMatrix, activeVehicle.matrix);
                } else {
                    // only parent frame has matrix -> just use that
                    activeVehicle.matrix = realityEditor.gui.ar.utilities.copyMatrix(parentFramePositionData.matrix);
                }
            } else {
                // only this node has matrix -> just use that
                activeVehicle.matrix = realityEditor.gui.ar.utilities.copyMatrix(activeVehicle.relativeMatrix);
            }
        }
        
    }
    
    if ( activeVehicle.type === 'logic') {
        activeVehicle.matrix = realityEditor.gui.ar.utilities.copyMatrix(newMatrixValue);
        
    } else if (activeVehicle.type === 'ui' || typeof activeVehicle.type === 'undefined') {
        activeVehicle.ar.matrix = realityEditor.gui.ar.utilities.copyMatrix(newMatrixValue);
    }
};

realityEditor.gui.ar.positioning.getMostRecentTouchPosition = function() {
    var translate3d = overlayDiv.style.transform.split('(')[1].split(')')[0].split(',').map(function(elt){return parseInt(elt);});
    return {
        x: translate3d[0],
        y: translate3d[1]
    }
};
