  
    // Scene 1: Cube and Other Objects in the First Scene
        const scene1 = new THREE.Scene();
        scene1.background = new THREE.Color(0xaaaaaa);
        
        const camera1 = new THREE.PerspectiveCamera( 75, 1, 0.1, 1000 );
        camera1.position.z = 3;
        
        const renderer1 = new THREE.WebGLRenderer();
        renderer1.setSize(200, 200);
        document.getElementById('renderer-container1').appendChild(renderer1.domElement);
        
        const light = new THREE.DirectionalLight();
        light.position.set(0, 1, 2);
        scene1.add(light);
        
        // Box material (sky blue)
        const material = new THREE.MeshStandardMaterial({color: new THREE.Color('skyblue')});
        
        // First box
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const box = new THREE.Mesh(geometry, material);
        box.position.x = 0;
        scene1.add(box);

        // Second box
        const box2 = new THREE.Mesh(geometry, material);
        box2.position.x = -1.5;
        scene1.add(box2);

        const greenMaterial = new THREE.MeshStandardMaterial({color: new THREE.Color(0x3aa505)});

        // Cone
        const coneGeometry = new THREE.ConeGeometry(0.5, 1, 32);
        const cone = new THREE.Mesh(coneGeometry, greenMaterial);
        cone.position.x = 2.5; // Moved to prevent overlap
        scene1.add(cone);

        // Red sphere material
        const redMaterial = new THREE.MeshStandardMaterial({color: new THREE.Color(0xff0000)});
        
        // Sphere
        const sphereGeometry = new THREE.SphereGeometry(0.5, 32, 32);
        const sphere = new THREE.Mesh(sphereGeometry, redMaterial); // Using red material for the sphere
        sphere.position.x = 1.5;
        scene1.add(sphere);
        
        // Animation variables for Scene 1 (Bouncing Sphere)
        let bounceTime = 0;
        const bounceHeight = 1;
        const bounceSpeed = 0.05;

        // Update function for Scene 1 (with bouncing sphere)
        function updateScene1() {
            requestAnimationFrame(updateScene1);
            renderer1.render(scene1, camera1);
            
            // Rotate boxes
            box.rotation.y += 0.01;
            box2.rotation.y += -0.01;
            
            // Make the sphere bounce
            bounceTime += bounceSpeed;
            sphere.position.y = Math.abs(Math.sin(bounceTime) * bounceHeight);
        }
        updateScene1();

        // Resize handler for Scene 1
        function onResize() {
            camera1.aspect = window.innerWidth / window.innerHeight;
            camera1.updateProjectionMatrix();
            renderer1.setSize(200, 200); // Keep it fixed at 200x200
        }

        window.addEventListener('resize', onResize, false);

        // Scene 2: Cube in the second scene
        const scene2 = new THREE.Scene();
        const camera2 = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
        const renderer2 = new THREE.WebGLRenderer();
        renderer2.setSize(200, 200);
        document.getElementById('renderer-container2').appendChild(renderer2.domElement);

        const geometry2 = new THREE.BoxGeometry();
        const material2 = new THREE.MeshBasicMaterial({ color: 0x0000ff });
        const cube2 = new THREE.Mesh(geometry2, material2);
        scene2.add(cube2);
        camera2.position.z = 5;

        let rotationSpeed2 = 1;
        
        // Animation loop for Scene 2
        function animate2() {
            requestAnimationFrame(animate2);
            cube2.rotation.x += 0.01 * rotationSpeed2;
            cube2.rotation.y += 0.01 * rotationSpeed2;
            renderer2.render(scene2, camera2);
        }
        animate2();

        // Event listener for rotation speed control in Scene 2
        document.getElementById('rotationSpeed2').addEventListener('input', function (event) {
            rotationSpeed2 = parseFloat(event.target.value);
        });

        // Event listener for rotation speed control in Scene 1
        document.getElementById('rotationSpeed1').addEventListener('input', function (event) {
            const rotationSpeed1 = parseFloat(event.target.value);
            box.rotation.y += rotationSpeed1 * 0.01;
            box2.rotation.y -= rotationSpeed1 * 0.01;
        });
