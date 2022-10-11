import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import * as THREE from "three";
import { Vector3 } from "three";
import TextBox from './textbox';
import { useState, useEffect } from "react";
import { Drawer } from "@mui/material";
const testDatas = require("../data.json")

const VIEW_DIST = 40
// console.log(testDatas)
export default function ThreeScene(props) {


    const [prompt, setPrompt] = useState(null)
    useEffect(() => {

    let scene, camera, renderer, raycaster;
    let INTERSECTED;
    let INMOTION;
    let onclicktmp;
    const pointer = new THREE.Vector2();

    var uuid_to_prompt = {}

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, VIEW_DIST-1, 1000 );
    camera.position.z = -200

    renderer = new THREE.WebGLRenderer();

    renderer.setSize(window.innerWidth, window.innerHeight)
    document.body.appendChild(renderer.domElement)


    const light = new THREE.HemisphereLight( 0xffffbb, 0x080820,1);
    scene.add(light)

    const light2 = new THREE.HemisphereLight( 0xffffbb, 0x080820,1);
    light2.position.set(0,-1,0)
    scene.add(light2)

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enablePan = false;
    controls.update()
    const object = new THREE.Mesh(
        new THREE.SphereGeometry(5,5,5), 
        new THREE.MeshLambertMaterial({color: Math.random() * 0xffffff })
        )       
    scene.add(object)
        for (let i = 0; i<testDatas.length; i++) {
            const object = new THREE.Mesh(
                new THREE.BoxGeometry(testDatas[i].width/10,testDatas[i].height/10,1), 
                new THREE.MeshLambertMaterial({map: new THREE.TextureLoader().load(testDatas[i].url),
                })
                )       
    
            object.position.x = Math.random() * 400 - 200; 
            object.position.y = Math.random() * 400 - 200; 
            object.position.z = Math.random() * 400 - 200; 
            uuid_to_prompt[object.uuid] = testDatas[i].prompt
            
            object.lookAt(0,0,0)    
            scene.add(object)
        }
   

    raycaster = new THREE.Raycaster();

    document.addEventListener( 'mousemove', onPointerMove );
    document.addEventListener( 'click', onMouseClick );
    document.addEventListener( 'mousedown', onMouseDown );

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
    function onMouseDown(event) {
        if (onclicktmp) {
            onclicktmp = null;
        }
        else{
            raycaster.setFromCamera( pointer, camera );
            const intersects = raycaster.intersectObjects( scene.children, false );
    
            if ( intersects.length > 0 ) {
                if ( onclicktmp !== intersects[ 0 ].object ) {
                    onclicktmp = intersects[ 0 ].object;
                }
            }
        }
        

    }

    function onMouseClick(event) {
        raycaster.setFromCamera( pointer, camera );
        const intersects = raycaster.intersectObjects( scene.children, false );

        if ( intersects.length > 0 ) {
            if (INTERSECTED === intersects[ 0 ].object) {
                INTERSECTED = null;
                INMOTION = null;
                onclicktmp = null;
                setPrompt(null)
            }
            else if ( onclicktmp === intersects[ 0 ].object ) {
                // if ( INTERSECTED ) INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );
                INTERSECTED = intersects[ 0 ].object;

                var offset = new THREE.Vector3().copy(INTERSECTED.position)
                offset.normalize()
                offset.multiplyScalar(VIEW_DIST)
                offset.add(INTERSECTED.position)
            

                let steps = 15
                INMOTION = {
                    steps : steps,
                    xsteps : Array(100).fill(undefined).map((_,i)=> camera.position.x + i*(offset.x-camera.position.x)/steps  ),
                    ysteps:Array(100).fill(undefined).map((_,i)=> camera.position.y + i*(offset.y-camera.position.y)/steps  ),
                    zsteps :Array(100).fill(undefined).map((_,i)=> camera.position.z + i*(offset.z-camera.position.z)/steps  ),
                    currStep: 0
                }
                console.log(uuid_to_prompt[INTERSECTED.uuid])
                setPrompt(uuid_to_prompt[INTERSECTED.uuid])

            }
        } else {
            if ( INTERSECTED ) INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );
            INTERSECTED = null;
            INMOTION = null;
            onclicktmp = null;
            setPrompt(null)
        }        
    }

    const animate = function () {
        requestAnimationFrame(animate);
        
        scene.traverse(function(obj) {
            let rotAxes = new Vector3(0,0,1)
            let offset = obj.position.clone()
            offset.cross(rotAxes)
            offset.normalize()
            
            obj.position.x += offset.x
            obj.position.y += offset.y
            obj.position.z += offset.z
            obj.lookAt(0,0,0)
            }
        )
        if (INTERSECTED && !INMOTION) {
            var offset = new THREE.Vector3().copy(INTERSECTED.position)
            offset.normalize()
            offset.multiplyScalar(VIEW_DIST)

            camera.position.set(INTERSECTED.position.x+offset.x,
                INTERSECTED.position.y+offset.y,
                INTERSECTED.position.z+offset.z) 

            camera.rotation.set(0,0,0)
        }
        if (INMOTION){
            camera.position.set(INMOTION.xsteps[INMOTION.currStep], INMOTION.ysteps[INMOTION.currStep], INMOTION.zsteps[INMOTION.currStep])
            INMOTION.currStep += 1
            if (INMOTION.currStep > INMOTION.steps) {
                INMOTION = null
            }
            controls.update()
        }
            camera.updateMatrixWorld();
            controls.update()
        // }
        renderer.render(scene, camera)
    }

    
    animate()
     }, [])
    return (
        <><TextBox label={prompt}></TextBox>
        <Drawer BackdropProps={{style:{backgroundColor:"red", opacity:0}}} 
                PaperProps={{style:{backgroundColor:"black", opacity:0.4, fontSize:40, color:"white"}}}
                anchor='bottom' open={prompt!=null}>{prompt}
        </Drawer></>
      );
}

