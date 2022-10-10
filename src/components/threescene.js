import { useState, useEffect, useRef } from "react";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import * as THREE from "three";


const testData = {
    height: 20,
    width: 40,
    url: "img/test.png"
}
export default function ThreeScene(props) {

    let scene, camera, renderer, raycaster;

    let INTERSECTED;

    let theta = 0;
    const pointer = new THREE.Vector2();
    var lastPos = new THREE.Vector3();
    // const lastAng 
    const radius = 100;

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
    camera.position.x = radius * Math.sin( THREE.MathUtils.degToRad( theta ) );
    camera.position.y = radius * Math.sin( THREE.MathUtils.degToRad( theta ) );
    camera.position.z = radius * Math.cos( THREE.MathUtils.degToRad( theta ) );
    camera.lookAt( scene.position );
    
    renderer = new THREE.WebGLRenderer();

    renderer.setSize(window.innerWidth, window.innerHeight)
    document.body.appendChild(renderer.domElement)


    const light = new THREE.HemisphereLight( 0xffffbb, 0x080820,1);
    scene.add(light)

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.update()

    const object = new THREE.Mesh(
        new THREE.SphereGeometry(10,10,10 ),
        new THREE.MeshLambertMaterial( { color: Math.random() * 0xffffff } )
    )
    scene.add (object)
    for (let i = 0; i<200; i++) {
        const object = new THREE.Mesh(
            new THREE.BoxGeometry(testData.height,testData.width,1), 
            new THREE.MeshLambertMaterial({map: new THREE.TextureLoader().load(testData.url),color: Math.random() * 0xffffff })
            )       

        object.position.x = Math.random() * 800 - 400; 
        object.position.y = Math.random() * 800 - 400; 
        object.position.z = Math.random() * 800 - 400; 

        object.lookAt(scene.position)   

        object.scale.x = Math.random() + 0.5;
        object.scale.y = Math.random() + 0.5;
        object.scale.z = Math.random() + 0.5;

        scene.add(object)
    }
    raycaster = new THREE.Raycaster();

    document.addEventListener( 'mousemove', onPointerMove );
    document.addEventListener( 'click', onMouseClick );

    window.addEventListener( 'resize', onWindowResize );

    function onPointerMove( event ) {

        pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
        pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

    }
  
    function onWindowResize() {

        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize( window.innerWidth, window.innerHeight );

    }

    function onMouseClick(event) {
        raycaster.setFromCamera( pointer, camera );

        const intersects = raycaster.intersectObjects( scene.children, false );

        if ( intersects.length > 0 ) {
            if ( INTERSECTED != intersects[ 0 ].object ) {
                if ( INTERSECTED ) INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );
                INTERSECTED = intersects[ 0 ].object;
                INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
                INTERSECTED.material.emissive.setHex( 0xff0000 );

                lastPos = camera.position
                console.log(lastPos)
            }
        } else {
            if ( INTERSECTED ) INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );
            INTERSECTED = null;
        }        
    }

    const animate = function () {
        requestAnimationFrame(animate);
        
        // if (INTERSECTED == null) {
        //     theta += 0.1;

        //     camera.position.x = radius * Math.sin( THREE.MathUtils.degToRad( theta ) );
        //     camera.position.y = radius * Math.sin( THREE.MathUtils.degToRad( theta ) );
        //     camera.position.z = radius * Math.cos( THREE.MathUtils.degToRad( theta ) );
            camera.lookAt( scene.position );

            camera.updateMatrixWorld();
            controls.update()
        // }
        renderer.render(scene, camera)
    }

    animate()
    return (
        <></>
      );
}

