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
 * @desc
 * @param touch
 **/

realityEditor.gui.ar.positioning.onScaleEvent = function(touch) {

    var tempThisObject = realityEditor.device.getEditingModeObject();
    var positionData = realityEditor.gui.ar.positioning.getPositionData(tempThisObject);
    
	var thisRadius = Math.sqrt(Math.pow((globalStates.editingModeObjectX - touch.pageX), 2) + Math.pow((globalStates.editingModeObjectY - touch.pageY), 2));
	if (!globalStates.editingScaleDistance) {
	    globalStates.editingScaleDistance = thisRadius;
	    globalStates.editingStartScale = positionData.scale;
    }
	var thisScale = globalStates.editingStartScale + (thisRadius - globalStates.editingScaleDistance) / 300;// + globalStates.editingScaleDistance;

	// cout(thisScale);

	if (thisScale < 0.2) {
        thisScale = 0.2;
    }

	if (typeof thisScale === "number" && thisScale > 0) {
        positionData.scale = thisScale;
	}
	
	globalCanvas.context.clearRect(0, 0, globalCanvas.canvas.width, globalCanvas.canvas.height);
	//drawRed(globalCanvas.context, [globalStates.editingModeObjectX,globalStates.editingModeObjectY],[touch.pageX,touch.pageY],globalStates.editingScaleDistance);
	this.ar.lines.drawBlue(globalCanvas.context, [globalStates.editingModeObjectX, globalStates.editingModeObjectY], [touch.pageX, touch.pageY], globalStates.editingScaleDistance);

	if (thisRadius < globalStates.editingScaleDistance) {

		this.ar.lines.drawRed(globalCanvas.context, [globalStates.editingModeObjectX, globalStates.editingModeObjectY], [touch.pageX, touch.pageY], thisRadius);

	} else {
		this.ar.lines.drawGreen(globalCanvas.context, [globalStates.editingModeObjectX, globalStates.editingModeObjectY], [touch.pageX, touch.pageY], thisRadius);

	}
	this.cout("scaleEvent");
};

realityEditor.gui.ar.positioning.moveVehicleToScreenCoordinate = function(activeVehicle, screenX, screenY, useTouchOffset) {

    // var initialTouchOffset = realityEditor.gui.ar.utilities.getLocalOffset(activeVehicle, screenX, screenY);

    // var overlayDomElement = globalDOMCache[activeVehicle.uuid];
    // var vehicleCornerScreenPosition = realityEditor.gui.ar.utilities.getScreenCoordinateWithinDiv(overlayDomElement, 0, 0);

    var results = realityEditor.gui.ar.utilities.screenCoordinatesToMatrixXY(activeVehicle, screenX, screenY, true);

    var positionData = this.getPositionData(activeVehicle);

    var newPosition = {
        x: results.point.x - results.offsetLeft,
        y: results.point.y - results.offsetTop
    };

    // if (results) {
    //     positionData.x = results.point.x - results.offsetLeft; // - initialTouchOffset.x;// - vehicleCornerScreenPosition[0];// - results.offsetLeft;// - initialFramePosition.x;  // TODO: put an offset based on touch position relative to frame div
    //     positionData.y = results.point.y - results.offsetTop; // - initialTouchOffset.y;// - vehicleCornerScreenPosition[1];// - results.offsetTop;// - initialFramePosition.y;
    // }

    if (useTouchOffset) {

        var changeInPosition = {
            x: newPosition.x - positionData.x,
            y: newPosition.y - positionData.y
        };

        if (!activeVehicle.currentTouchOffset) {
            activeVehicle.currentTouchOffset = changeInPosition;
            console.log('set touch offset: ');
            console.log(changeInPosition);
        } else {
            positionData.x = newPosition.x - activeVehicle.currentTouchOffset.x;
            positionData.y = newPosition.y - activeVehicle.currentTouchOffset.y;
        }

    } else {

        activeVehicle.currentTouchOffset = null;
        positionData.x = newPosition.x;
        positionData.y = newPosition.y;

    }

};

realityEditor.gui.ar.positioning.getPositionData = function(activeVehicle) {
    var positionData = activeVehicle;
    if (activeVehicle.hasOwnProperty('visualization')) {
        positionData = (activeVehicle.visualization === "ar") ? (activeVehicle.ar) : (activeVehicle.screen);
    }
    return positionData;
};
