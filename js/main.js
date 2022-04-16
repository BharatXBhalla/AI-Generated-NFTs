
if(!(Detector.webgl)) //if no support for WebGL
{
	alert("Your browser does not support WebGL!");
}
else {
//////////////////////////////////////MAIN SCENE////////////////////////////////////////
	var gal = {
		/*
		gal.scene;
		gal.camera;
		gal.renderer;
		gal.raycaster;
		gal.mouse;
		gal.raycastSetUp;
		gal.boot;
			gal.scene.fog;
			gal.controls;
			gal.canvas;
		gal.pointerControls;
			gal.changeCallback;
			gal.errorCallback;
			gal.moveCallback;
			gal.toggleFullScreen;
		gal.movement;
		gal.create;
		gal.render;
		*/
		scene: new THREE.Scene(),
		camera: new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.2, 1000),
		renderer: new THREE.WebGLRenderer({antialias: false}),
		raycaster: new THREE.Raycaster(),
		mouse: new THREE.Vector3(),
		painting_manager: new PaintingManager(),
		painting_overlay:null,
		painting_details_overlay:null,
		raycastSetUp: function() {
			gal.mouse.x = 0; //(0.5) * 2 - 1;
			gal.mouse.y = 0; //(0.5) * 2 + 1;
			gal.mouse.z = 0.0001;
		},
		boot: function() {
			//renderer time delta
			gal.prevTime = performance.now();

            gal.initialRender = true;

			gal.scene.fog = new THREE.FogExp2(0x666666, 0.025);

			gal.renderer.setSize(window.innerWidth, window.innerHeight);
			gal.renderer.setClearColor(0xffffff, 1);
			document.body.appendChild(gal.renderer.domElement);

            gal.userBoxGeo = new THREE.BoxGeometry(2,1,2);
            gal.userBoxMat = new THREE.MeshBasicMaterial({color: 0xeeee99, wireframe: true});
            gal.user = new THREE.Mesh(gal.userBoxGeo, gal.userBoxMat);

            //invisible since this will solely be used to determine the size
            //of the bounding box of our boxcollider for the user
            gal.user.visible = false;
            
            //making Bounding Box and HelperBox
            //boundingbox is used for collisions, Helper box just makes it easier to debug 
            gal.user.BBox = new THREE.Box3();

            //make our collision object a child of the camera
            gal.camera.add(gal.user);

			gal.controls = new THREE.PointerLockControls(gal.camera);
			gal.scene.add( gal.controls.getObject());

            gal.pastX = gal.controls.getObject().position.x;
            gal.pastZ = gal.controls.getObject().position.z;

			//https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelector
			gal.canvas = document.querySelector('canvas');
			gal.canvas.className = "gallery";

            //Clicking on either of these will start the game
            gal.bgMenu = document.querySelector('#background_menu');
            gal.play = document.querySelector('#play_button');

			//enabling/disabling menu based on pointer controls
			gal.menu = document.getElementById("menu");

			//only when pointer is locked will translation controls be allowed: gal.controls.enabled
			gal.moveVelocity = new THREE.Vector3();
			gal.jump = true;
			gal.moveForward = false;
			gal.moveBackward = false;
			gal.moveLeft = false;
			gal.moveRight = false;
			gal.showdetails = false;

			//Resize if window size change!
			window.addEventListener('resize', function() {
				gal.renderer.setSize(window.innerWidth, window.innerHeight);
				gal.camera.aspect = window.innerWidth / window.innerHeight;
				gal.camera.updateProjectionMatrix();
			});


			      gal.composer = new THREE.EffectComposer( gal.renderer );
  
                   gal.renderPass = new THREE.RenderPass( gal.scene, gal.camera );
                   gal.composer.addPass( gal.renderPass );
   
                   gal.outlinePass = new THREE.OutlinePass( new THREE.Vector2( window.innerWidth, window.innerHeight ), gal.scene, gal.camera );
                   gal.composer.addPass( gal.outlinePass );

				   var params = {
					edgeStrength: 3,
					edgeGlow: 1,
					edgeThickness: 2.0,
					pulsePeriod: 0,
					usePatternTexture: false
				};
				gal.outlinePass.edgeStrength = params.edgeStrength;
				gal.outlinePass.edgeGlow = params.edgeGlow;
				// gal.outlinePass.visibleEdgeColor.set(0xffffff);
				// gal.outlinePass.hiddenEdgeColor.set(0xffffff);
   
                   gal.effectFXAA = new THREE.ShaderPass( THREE.FXAAShader );
                   gal.effectFXAA.uniforms[ 'resolution' ].value.set( 1 / window.innerWidth, 1 / window.innerHeight );
                   gal.composer.addPass( gal.effectFXAA );

				   window.addEventListener('mousemove', onRayCastTouchMove);
				   window.addEventListener('touchmove', onRayCastTouchMove);

				  //gal.painting_overlay=new CustomUiPaintOverlay(document,"myNav",gal.painting_manager,fillPaintingOverlayDetails,"100%");
				   gal.painting_details_overlay=new PaintOverlay(document,"E_Details",undefined,"10%");
		},

		pointerControls: function() {
			//////POINTER LOCK AND FULL SCREEN////////////
			//https://developer.mozilla.org/en-US/docs/Web/API/Pointer_Lock_API
			//gal.controls; 
			//if pointer lock supported in browser:
			if('pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document) {
				//assign the API functions for pointer lock based on browser
				gal.canvas.requestPointerLock = gal.canvas.requestPointerLock || gal.canvas.mozRequestPointerLock || gal.canvas.webkitRequestPointerLock;
				//run this function to escape pointer Lock
				gal.canvas.exitPointerLock =  gal.canvas.exitPointerLock || gal.canvas.mozExitPointerLock || gal.canvas.webkitExitPointerLock;
			
			
				//https://developer.mozilla.org/en-US/docs/Web/API/Fullscreen_API
				//https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener
				document.addEventListener("keydown", function(e) {
					if(e.keyCode === 102 || e.keyCode === 70) {//F/f for fullscreen hahaha 
						gal.toggleFullscreen(); 
						//refer to below event listener:
						gal.canvas.requestPointerLock();
					}
				});
	

				/*Order of executions:
				gal.canvas "click" -> "pointerlockchange" -> gl.changeCallback
				-> listen to mouse movement and locked

				ESC key -> "pointerlockchange" -> gl.changeCallback -> unlocked
				now listen to when the canvas is clicked on
				*/
                /* Following is unclickable since it's covered by bgMenu div
				gal.canvas.addEventListener("click", function() {
					gal.canvas.requestPointerLock();
				});
                */
                gal.bgMenu.addEventListener("click", function() {
					gal.canvas.requestPointerLock();
                });
                gal.play.addEventListener("click", function() {
					gal.canvas.requestPointerLock();
                });
				
				//pointer lock state change listener
				document.addEventListener('pointerlockchange', gal.changeCallback, false);
				document.addEventListener('mozpointerlockchange', gal.changeCallback, false);
				document.addEventListener('webkitpointerlockchange', gal.changeCallback, false);

				document.addEventListener('pointerlockerror', gal.errorCallback, false);
				document.addEventListener('mozpointerlockerror', gal.errorCallback, false);
				document.addEventListener('webkitpointerlockerror', gal.errorCallback, false);


			} else {
				alert("Your browser does not support the Pointer Lock API");
			}
		},

		changeCallback: function(event) {
			if(document.pointerLockElement === gal.canvas || document.mozPointerLockElement === gal.canvas || document.webkitPointerLockElement === gal.canvas) {
				//pointer is disabled by element
				gal.controls.enabled = true;
				//remove menu element from screen
				gal.menu.className += " hide";
                gal.bgMenu.className += " hide";
				//start mouse move listener
				document.addEventListener("mousemove", gal.moveCallback, false);
				
			} else {
				//pointer is no longer disabled
				gal.controls.enabled = false;
				//remove hidden property from menu
				gal.menu.className = gal.menu.className.replace(/(?:^|\s)hide(?!\S)/g, '');
				gal.bgMenu.className = gal.bgMenu.className.replace(/(?:^|\s)hide(?!\S)/g, '');
				document.removeEventListener("mousemove", gal.moveCallback, false);
			}
		},

		errorCallback: function(event) {
			alert("Pointer Lock Failed");
		},
		
		moveCallback: function(event) {
			//now that pointer disabled, we get the movement in x and y pos of the mouse
			var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
			var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;
		},
	
		toggleFullscreen: function() {
			if (!document.fullscreenElement && !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement ) {  // current working methods
				if (document.documentElement.requestFullscreen) {
					document.documentElement.requestFullscreen();
				} else if (document.documentElement.msRequestFullscreen) {
					document.documentElement.msRequestFullscreen();
				} else if (document.documentElement.mozRequestFullScreen) {
					document.documentElement.mozRequestFullScreen();
				} else if (document.documentElement.webkitRequestFullscreen) {
					document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
				}
			} else {
				if (document.exitFullscreen) {
					document.exitFullscreen();
				} else if (document.msExitFullscreen) {
					document.msExitFullscreen();
				} else if (document.mozCancelFullScreen) {
					document.mozCancelFullScreen();
				} else if (document.webkitExitFullscreen) {
					document.webkitExitFullscreen();
				}
			}
		},
		
		movement: function() {
				document.addEventListener("keydown", function(e) {
					if(e.keyCode === 87 || e.keyCode === 38) { //w or UP
						gal.moveForward = true;	
					}
					else if(e.keyCode === 65 || e.keyCode === 37) { //A or LEFT
						gal.moveLeft = true;
					}
					else if(e.keyCode === 83 || e.keyCode === 40) { //S or DOWN 
						gal.moveBackward = true;
					}
					else if(e.keyCode === 68 || e.keyCode === 39) { //D or RIGHT
						gal.moveRight = true;	
					}
					else if(e.keyCode ===  32) { //Spacebar
						if(gal.jump) {
							gal.moveVelocity.y += 17;
							gal.jump = false;
						}
					}else if(e.keyCode === 69){
						// console.log(gal.selected_painting_id);
						let index;
						let i=0;
						for(let p of gal.paintings){
							if(p.id == gal.selected_painting_id){
								index=i;
								break;
							}else{
								i++;
							}
						}
						//let changethis = gal.paintings.index((ele)=>ele.id == gal.selected_painting_id);
						// gal.paintings[index].material.map.image.set("/img/logo.jpg")
						console.log(gal.paintings[index].material.map.dispose);
						axios({
							method: 'post',
							url: 'http://127.0.0.1:5000/generate',
						  }).then((data)=>{
							  var texture =new THREE.TextureLoader().load(data.data);
						  texture.minFilter = THREE.LinearFilter;
						  var img = new THREE.MeshBasicMaterial({ map: texture });
						  
						  gal.paintings[index].material.map.dispose();
						  delete gal.paintings[index].material.map;
						  gal.paintings[index].material = img;
						  });
						
						  

						gal.render();
					}
					onRayCastTouchMove();
				});
		
				document.addEventListener("keyup", function(e) {
					if(e.keyCode === 87 || e.keyCode === 38) { //w or UP
						gal.moveForward = false;
					}
					else if(e.keyCode === 65 || e.keyCode === 37) { //A or LEFT
						gal.moveLeft = false;
					}
					else if(e.keyCode === 83 || e.keyCode === 40) { //S or DOWN 
						gal.moveBackward = false;
					}
					else if(e.keyCode === 68 || e.keyCode === 39) { //D or RIGHT
						gal.moveRight = false;	
					}
					onRayCastTouchMove();
				});
		},

		create: function() {

			//let there be light!
			gal.worldLight = new THREE.AmbientLight(0xffffff);
			gal.scene.add(gal.worldLight);

            //set the floor up
            gal.floorText = THREE.ImageUtils.loadTexture("img/Textures/Floor.jpg");
            gal.floorText.wrapS = THREE.RepeatWrapping;
            gal.floorText.wrapT = THREE.RepeatWrapping;
            gal.floorText.repeat.set(24,24);

            //Phong is for shiny surfaces
			gal.floorMaterial = new THREE.MeshPhongMaterial( {map: gal.floorText } );
			gal.floor = new THREE.Mesh(new THREE.PlaneGeometry(15,15), gal.floorMaterial);

			gal.floor.rotation.x = Math.PI/2;
            gal.floor.rotation.y = Math.PI;
			gal.scene.add(gal.floor);

			//Create the walls////
			gal.wallGroup = new THREE.Group();
			gal.scene.add(gal.wallGroup);
             

			gal.wall1 = new THREE.Mesh(new THREE.BoxGeometry(15,6, 0.001), new THREE.MeshLambertMaterial({color: 0xC8C8C8}));
			gal.wall2 = new THREE.Mesh(new THREE.BoxGeometry(6,6, 0.001), new THREE.MeshLambertMaterial({color: 0xC8C8C8}));
			gal.wall3 = new THREE.Mesh(new THREE.BoxGeometry(6,6, 0.001), new THREE.MeshLambertMaterial({color: 0xC8C8C8}));
			gal.wall4 = new THREE.Mesh(new THREE.BoxGeometry(15,6, 0.001), new THREE.MeshLambertMaterial({color: 0xC8C8C8}));

			gal.wallGroup.add(gal.wall1, gal.wall2, gal.wall3, gal.wall4);
			gal.wallGroup.position.y = 3;

			gal.wall1.position.z = -3;
			gal.wall2.position.x = -7;
			gal.wall2.rotation.y = Math.PI/2;
			gal.wall3.position.x = 1;
			gal.wall3.rotation.y = -Math.PI/2;
			gal.wall4.position.z = 3;
			gal.wall4.rotation.y = Math.PI;

            for(var i = 0; i < gal.wallGroup.children.length; i++) {
                gal.wallGroup.children[i].BBox = new THREE.Box3();
                gal.wallGroup.children[i].BBox.setFromObject(gal.wallGroup.children[i]);
            }

			//Ceiling//
			//gal.ceilMaterial = new THREE.MeshLambertMaterial({color: 0x8DB8A7});
			gal.ceilMaterial = new THREE.MeshLambertMaterial({color: 0xa1a1a1});
			gal.ceil = new THREE.Mesh(new THREE.PlaneGeometry(15,6), gal.ceilMaterial);
			gal.ceil.position.y = 6;
			gal.ceil.rotation.x = Math.PI/2;

			gal.scene.add(gal.ceil);

			
			var plBuilder= new PaintingListBuilder();
			//////Parsing all JSON Paintings

			console.log(PaintingInfo);
			
			for(let p of PaintingInfo){
				plBuilder.addPainting().setDescription(p.description).setBuylink(p.buylink).setImgname(p.imagename).setName(p.name);
			}

		

			///////Add Artworks~///////
			gal.artGroup = new THREE.Group();
           
			gal.num_of_paintings = plBuilder.lengthOfList();
			gal.paintings = []



			for(var i = 0; i < gal.num_of_paintings; i++){
				(function(index) {
                    //https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/Image
					var artwork = new Image();
					var ratiow = 0;
					var ratioh = 0;
					var source = './img/' + plBuilder.getPainting(index).getImgname();
					artwork.src = source;
                    
                    var texture = new THREE.TextureLoader().load(artwork.src);
                    texture.minFilter = THREE.LinearFilter;
					var img = new THREE.MeshBasicMaterial({ map: texture });

					artwork.onload = (function(){
						ratiow = artwork.width/100;
						ratioh = artwork.height/100;
						// plane for artwork
						var plane = new THREE.Mesh(new THREE.PlaneGeometry(ratiow, ratioh),img,); //width, height
						plane.overdraw = true;
                        //-1 because index is 0 - n-1 but num of paintings is n 
						if(index < 15) //bottom half
						{
							//plane.rotation.z = Math.PI/2;
                            plane.position.set(2.5 * index - 2.5,3,-2.96); //y and z kept constant
						}
						else
						{
							//plane.rotation.z = Math.PI/2;
                            plane.position.set(2.5 * index - 55 ,2 ,2.96);
                            //plane.position.set(65*i - 75*Math.floor(gal.num_of_paintings/2) - 15*Math.floor(gal.num_of_paintings/2), 48, 90);
							plane.rotation.y = Math.PI;
						}
						gal.scene.add(plane);
                        gal.paintings.push(plane);
					});

					img.map.needsUpdate = true; //ADDED
				}(i))
			}
		},
		render: function() {
			requestAnimationFrame(gal.render);

            ////Movement Controls /////
			if(gal.controls.enabled === true) {
                gal.initialRender = false;
				var currentTime = performance.now(); //returns time in milliseconds
				//accurate to the thousandth of a millisecond
				//want to get the most accurate and smallest change in time
				var delta = (currentTime-gal.prevTime)/1000;

				//there's a constant deceleration that needs to be applied
				//only when the object is currently in motion
				gal.moveVelocity.x -= gal.moveVelocity.x * 10.0 * delta;
				//for now
				gal.moveVelocity.y -= 9.8 * 7.0 * delta; // m/s^2 * kg * delta Time
				gal.moveVelocity.z -= gal.moveVelocity.z * 10.0 * delta;

				//need to apply velocity when keys are being pressed
				if(gal.moveForward) {
					gal.moveVelocity.z -= 38.0 * delta;
				}
				if(gal.moveBackward) {
					gal.moveVelocity.z += 38.0 * delta;
				}
				if(gal.moveLeft) {
					gal.moveVelocity.x -= 38.0 * delta;
				}
				if(gal.moveRight) {
					gal.moveVelocity.x += 38.0 * delta;
				}
				
				gal.controls.getObject().translateX(gal.moveVelocity.x * delta);
				gal.controls.getObject().translateY(gal.moveVelocity.y * delta);
				gal.controls.getObject().translateZ(gal.moveVelocity.z * delta);
				
				if(gal.controls.getObject().position.y < 1.75) {
						gal.jump = true;
						gal.moveVelocity.y = 0;
						gal.controls.getObject().position.y = 1.75;
				}
                if(gal.controls.getObject().position.z < -2) {
                        gal.controls.getObject().position.z = -2;
                }
                if(gal.controls.getObject().position.z > 2) {
                        gal.controls.getObject().position.z = 2;
                }
                if(gal.controls.getObject().position.x < -18) {
                        gal.controls.getObject().position.x = -18;
                }
                if(gal.controls.getObject().position.x > 18) {
                        gal.controls.getObject().position.x = 18;
                }



                gal.pastX = gal.controls.getObject().position.x;
                gal.pastZ = gal.controls.getObject().position.z;

                gal.user.BBox.setFromObject(gal.user);

				gal.prevTime = currentTime;

                gal.renderer.render(gal.scene, gal.camera);
				
			}
			else {
                    //reset delta time, so when unpausing, time elapsed during pause
                    //doesn't affect any variables dependent on time.
                    gal.prevTime = performance.now();
			}

            if(gal.initialRender === true) {
                for(var i = 0; i < gal.wallGroup.children.length; i++) {
                    gal.wallGroup.children[i].BBox.setFromObject(gal.wallGroup.children[i]);
                }
                gal.renderer.render(gal.scene, gal.camera);
				
            }
			gal.composer.render();
			
        }
	};



	gal.raycastSetUp();
	gal.boot();
	gal.pointerControls();
	gal.movement();
	gal.create();
	gal.render();


	  function onRayCastTouchMove(event) {
		                //rayCaster/////
						gal.raycaster.setFromCamera(gal.mouse.clone(), gal.camera);
						//calculate objects interesting ray
						gal.intersects = gal.raycaster.intersectObjects(gal.paintings);
						if(gal.intersects.length !== 0) {
							
							selected_painting=gal.intersects[0].object;
							gal.outlinePass.selectedObjects=[selected_painting];
							gal.selected_painting_id = selected_painting.id;

							
							gal.painting_details_overlay.openOverlay();
						}else{
							gal.painting_details_overlay.closeOverlay();
						}

	}
	function fillPaintingOverlayDetails(){
		var p=this.painting_manager.getSelectedPainting();
		document.getElementById("painting_description").innerHTML=p.description;
		document.getElementById("painting_name").innerHTML=p.name;
		document.getElementById("painting_img").src='/img/Artworks/'+p.imgname;
		document.getElementById("painting_buylink").href=p.buylink;

	}
} 


