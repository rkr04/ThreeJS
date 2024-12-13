// Declare variables
var scene, camera, renderer, clock, mixer, actions = [], mode, isWireframe = false, params, lights;
let loadedModel; // Variable to store the current model
let secondModelMixer, secondModelActions = []; // Separate mixer and actions for the second model
let sound, secondSound; // Variables to store the sound objects

init();

function init() {
  const assetPath = './'; // Path to assets

  clock = new THREE.Clock();

  // Create the scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x8c1801);

  // Set up the camera
  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(-5, 25, 20);

  const listener = new THREE.AudioListener();
  camera.add(listener);

    // Create a sound and attach it to the listener
    sound = new THREE.Audio(listener);
    secondSound = new THREE.Audio(listener);

    // Load a sound and set it as the buffer for the Audio object
    const audioLoader = new THREE.AudioLoader();
    audioLoader.load('can_opening_01.mp3', function (buffer) {
      sound.setBuffer(buffer);
      sound.setLoop(false);
      sound.setVolume(1.0);
    });

      // Load the second sound
  audioLoader.load('can crush.mp3', function (buffer) {
    secondSound.setBuffer(buffer);
    secondSound.setLoop(false);
    secondSound.setVolume(1.0);
  });

  // Add lighting
  const ambient = new THREE.HemisphereLight(0xffffbb, 0x080820, 4);
  scene.add(ambient);

  lights = {};
  
  lights.spot = new THREE.SpotLight();
  lights.spot.visible = true;
  lights.spot.position.set(0,20,0);
  //lights.spot.target = ball;
  lights.spotHelper = new THREE.SpotLightHelper(lights.spot);
  lights.spotHelper.visible = false;
  scene.add(lights.spotHelper);
  scene.add(lights.spot);

  params = {
    spot: { 
      enable: false,
      color: 0xffffff,
      distance: 20,
      angle: Math.PI/2,
      penumbra: 0,
      helper: false,
      moving: false
    }
  }
  
  const gui = new dat.GUI();
  const spot = gui.addFolder('Spot');
  spot.open();
  spot.add(params.spot, 'enable').onChange(value => { lights.spot.visible = value });
  spot.addColor(params.spot, 'color').onChange( value => lights.spot.color = new THREE.Color(value));
  spot.add(params.spot, 'distance').min(0).max(20).onChange( value => lights.spot.distance = value);
  spot.add(params.spot, 'angle').min(0.1).max(6.28).onChange( value => lights.spot.angle = value );
  spot.add(params.spot, 'penumbra').min(0).max(1).onChange( value => lights.spot.penumbra = value );
  spot.add(params.spot, 'helper').onChange(value => lights.spotHelper.visible = value);
  spot.add(params.spot, 'moving');

  const canvas = document.getElementById('threeContainer'); // Get the canvas in the card
  renderer = new THREE.WebGLRenderer({ canvas: canvas });
  renderer.setPixelRatio(window.devicePixelRatio);
  resize(); // Match the renderer size to the canvas

  // Add OrbitControls
  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.target.set(1, 2, 0);
  controls.update();

  // Button to control animations
  mode = 'open';
  const btn = document.getElementById("btn");
  btn.addEventListener('click', function () {
    if (actions.length > 0) {
      actions.forEach(action => {
        action.timeScale = 1;
        action.setLoop(THREE.LoopOnce); // Play the animation only once
        action.clampWhenFinished = true; // Stop at the last frame
        action.reset();
        action.play();

        // Play sound when the animation starts
        if (sound.isPlaying) sound.stop(); // Stop currently playing sound if any
        sound.play();
      });
    } else {
      console.warn('No animations are loaded to play.');
    }
  });
  
  // Add wireframe toggle button
  const wireframeBtn = document.getElementById("toggleWireframe");
  wireframeBtn.addEventListener('click', function () {
    isWireframe = !isWireframe;
    toggleWireframe(isWireframe);
  });

  // Add rotation button logic
  const rotateBtn = document.getElementById("Rotate");
  rotateBtn.addEventListener('click', function () {
    if (loadedModel) {
      const axis = new THREE.Vector3(0, 1, 0); // Y-axis
      const angle = Math.PI / 8; // Rotate 22.5 degrees
      loadedModel.rotateOnAxis(axis, angle);
    } else {
      console.warn('Model not loaded yet.');
    }
  });

  // Add event listener for the play second model animation button
  const playSecondModelAnimationBtn = document.getElementById("playSecondModelAnimation");
  playSecondModelAnimationBtn.addEventListener('click', function () {
    if (secondModelActions.length > 0) {
      secondModelActions.forEach(action => {
        action.reset();
        action.setLoop(THREE.LoopOnce); // Play the animation only once
        action.clampWhenFinished = true; // Stop at the last frame
        action.play();
        // Play the sound for the second animation
        if (secondSound.isPlaying) secondSound.stop();
        secondSound.play();
      });
    } else {
      console.warn('No animation available for the second model.');
    }
  });

  // Function to load a model
  const loader = new THREE.GLTFLoader();
  function loadModel(modelPath) {
    // Remove the current model if it exists
    if (loadedModel) {
      scene.remove(loadedModel);
    }

    // Load the new model
    loader.load(modelPath, function (gltf) {
      const model = gltf.scene;

      // Set the position and add it to the scene
      model.position.set(0, 0, 0); // Same position as the previous model
      scene.add(model);

      // Update the reference to the loaded model
      loadedModel = model;

      // Reset animations if applicable
      mixer = new THREE.AnimationMixer(model);
      const animations = gltf.animations; // Array of animation clips
      actions = []; // Clear previous actions

      animations.forEach(clip => {
        const action = mixer.clipAction(clip);
        actions.push(action);
      });

      // If this is the second model, set up its separate mixer and actions
      if (modelPath === 'can_template_animation_crushed.glb') {
        secondModelMixer = mixer;
        secondModelActions = actions; // Store the second model's animations separately
      }
    });
  }

  // Initial model load
  loadModel('./can_template_animation_tab.glb');

  // Add event listener for the switch model button
  const switchBtn = document.getElementById("switchModel");
  switchBtn.addEventListener('click', function () {
    loadModel('can_template_animation_crushed.glb'); // Path to the new model
  });

  // Handle resizing
  window.addEventListener('resize', resize, false);

  // Start the animation loop
  animate();
}

function toggleWireframe(enable) {
  scene.traverse(function (object) {
    if (object.isMesh) {
      object.material.wireframe = enable;
    }
  });
}

function animate() {
  requestAnimationFrame(animate);

  // Update animations for both models
  if (mixer) mixer.update(clock.getDelta());
  if (secondModelMixer) secondModelMixer.update(clock.getDelta());

  renderer.render(scene, camera);

  const time = clock.getElapsedTime();
  const delta = Math.sin(time)*5;
  if (params.spot.moving){ 
    lights.spot.position.x = delta;
    lights.spotHelper.update();
  }
}

function resize() {
  const canvas = document.getElementById('threeContainer'); // Get the canvas inside the card
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;

  // Update camera aspect and renderer size
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
}
