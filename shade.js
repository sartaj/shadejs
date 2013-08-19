// Design Goal: Find easier way to handle relative shadows throughout a Document Object Model.
	// <- Focus on static shadow handling.
		// -> Too much movement is inefficient for the javascript engine.
				// -> This is bad for experiences on lower power devices.
	// Time: April 25, 2013
	// Revision: Sartaj Chowdhury
	// 

	var shade = function(elementClass, opt) {
		

		var // Options
			maxZ = opt.maxZ || 10,
			maxX = opt.maxX || 10,
			maxY = opt.maxY || 10,
			thresh = opt.thresh || 0.05,
			lightsource = opt.lightClass,
			lightPos = opt.lightPos || [0,0,0]; 

		// Find position of relative elements
		// Source: http://stackoverflow.com/a/14387497

			function findPos(obj) {
			    var curleft = 0;
			    var curtop = 0;
			    if(obj.offsetLeft) curleft += parseInt(obj.offsetLeft);
			    if(obj.offsetTop) curtop += parseInt(obj.offsetTop);
			    if(obj.scrollTop && obj.scrollTop > 0) curtop -= parseInt(obj.scrollTop);
			    if(obj.offsetParent) {
			        var pos = findPos(obj.offsetParent);
			        curleft += pos[0];
			        curtop += pos[1];
			    } else if(obj.ownerDocument) {
			        var thewindow = obj.ownerDocument.defaultView;
			        if(!thewindow && obj.ownerDocument.parentWindow)
			            thewindow = obj.ownerDocument.parentWindow;
			        if(thewindow) {
			            if(thewindow.frameElement) {
			                var pos = findPos(thewindow.frameElement);
			                curleft += pos[0];
			                curtop += pos[1];
			            }
			        }
			    }

			    return [curleft,curtop];
			}
					
		// Calculate Light Source

			var light; 

			lightsource = document.getElementsByClassName(lightsource)[0];
			if(lightsource){
				lightPos = [];
				lightPos = findPos(lightsource);
				lightPos[2] = window.getComputedStyle(lightsource).zIndex;
			} 

			light = {
				xx: parseInt(lightPos[0]),
				yy: parseInt(lightPos[1]),
				zz: parseInt(lightPos[2])
			}

		// Calculate Shadows
		
			var shadowNode, shadowCalc, sp, shadow;

			shadowNode = document.getElementsByClassName(elementClass);
			
			// Iterate through shadow class
			for(i=0; i<shadowNode.length;i++){

				sp = findPos(shadowNode[i]);

				element = {
					xx: sp[0],
					yy: sp[1],
					zz: parseInt(window.getComputedStyle(shadowNode[i]).zIndex)
				}
				
				// Calculate X
				shadowCalc = {
					xx: (element.xx*thresh) - (light.xx*thresh),
					yy: (element.yy*thresh) - (light.yy*thresh),
					zz: Math.abs((element.zz) - (light.zz))
				}
				// Limiters
					if(Math.abs(shadowCalc.xx) > maxX) {
						if(shadowCalc.xx > 0) {
							shadowCalc.xx = maxX;
						} else {
							shadowCalc.xx = 0 - maxX
						}
					}

					if(Math.abs(shadowCalc.yy) > maxY) {
						if(shadowCalc.yy > 0) {
							shadowCalc.yy = maxY
						} else {
							shadowCalc.yy = 0 - maxY
						}
					}

					if(shadowCalc.zz <= 0 || shadowCalc.zz > maxZ ) {
						shadowCalc.zz = maxZ;
					}

				shadow = shadowCalc.xx + "px " +  shadowCalc.yy  +  "px  " + shadowCalc.zz + 'px rgba(0,0,0,0.4)';
				shadowNode[i].style.boxShadow = shadow;
			
			};

	}