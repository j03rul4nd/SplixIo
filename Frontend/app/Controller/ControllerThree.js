// import { GLTFLoader } from 'https://unpkg.com/three@0.158.0/examples/jsm/loaders/GLTFLoader.js';
// import * as THREE from 'https://unpkg.com/three@0.158.0/build/three.module.js';//'three';

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

//import Ammo from '../../lib/ammo.js'; // Importa la biblioteca Ammo.js
import {UpdateDataUser, sendDataUserCube} from '../Mutation/ConectionWs.js'
//https://unpkg.com/three@0.126.0/examples/js/loaders/GLTFLoader.js
//mport { GLTFLoader } from 'https://unpkg.com/three@0.151.3/examples/jsm/loaders/GLTFLoader.js';

export async function ControllerThree() {
    await InitMap();
}
var model;
var scene;
var camera;
var renderer;
var container;
var physicsWorld; // para el mundo de físicas
var clock; //  para gestionar el tiempo
var groundHeight = 0; // Altura del suelo


async function InitMap() {
  // Seleccionar el contenedor HTML
  container = document.getElementById('map-cntr');

  // Crear el escenario, la cámara y el renderizador
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);

  // Manejar el cambio de tamaño del contenedor
  window.addEventListener('resize', () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  });

   // Configurar la luz
   const light = new THREE.AmbientLight(0xFFFFFF); // Luz ambiental
   scene.add(light);

//    // Crear un suelo
//    var floorGeometry = new THREE.PlaneGeometry(10, 10, 10, 10);
//    var floorMaterial = new THREE.MeshBasicMaterial({ color: 0x999999, side: THREE.DoubleSide, wireframe: true });
//    var floor = new THREE.Mesh(floorGeometry, floorMaterial);
//    floor.rotation.x = Math.PI / 2;
//    scene.add(floor);

  //initPhysics();
  await initPhysics();
  
  

  // Posicionamos la cámara
  camera.position.z = 5;


}

// Nueva función para inicializar el mundo de físicas
async function initPhysics() {
     // Configura Ammo.js
    return new Promise((resolve, reject) => {
        Ammo().then(function (AmmoLib) {
            Ammo = AmmoLib;
            if (Ammo) {

                // Crea el mundo de físicas
                physicsWorld = new Ammo.btDiscreteDynamicsWorld(
                    new Ammo.btCollisionDispatcher(new Ammo.btDefaultCollisionConfiguration()),
                    new Ammo.btDbvtBroadphase(),
                    new Ammo.btSequentialImpulseConstraintSolver(),
                    new Ammo.btDefaultCollisionConfiguration()
                );

                // Establece la gravedad
                physicsWorld.setGravity(new Ammo.btVector3(0, -10, 0));
                // Inicializa el reloj para gestionar el tiempo

                clock = new THREE.Clock();
                createFloorWithPhysics(scene);
                resolve();

            } else {
                reject('Error al cargar Ammo.js');
            }
        });
    });
}

const cameraDistance = 5;
const cameraHeight = 2;
const rotateSpeed = 0.002; // Velocidad de rotación
const moveSpeed = 0.1;    // Velocidad de movimiento

let targetRotationY = 0;

// Capturar eventos del mouse
document.addEventListener('mousemove', (event) => {
    const mouseX = (event.clientX / window.innerWidth) * 2 - 1;

    targetRotationY = mouseX * Math.PI;
});

// Capturar eventos del teclado
const keyState = {};
document.addEventListener('keydown', (event) => {
    keyState[event.key] = true;
});

document.addEventListener('keyup', (event) => {
    keyState[event.key] = false;
});


// Función para renderizar la escena
const animate = function () {
    requestAnimationFrame(animate);

    // Simula la física
    if (physicsWorld && clock) {
        const deltaTime = clock.getDelta();
        physicsWorld.stepSimulation(deltaTime);
    }

    if (model) {
      // Rotar el modelo (opcional)
      model.rotation.x += 0.01;
      model.rotation.y += 0.01;
    }

    if(cubeMain){
        // Rotar el cubo
        //cubeMain.rotation.x += 0.01;
        //cubeMain.rotation.y += 0.01;

        // Rotar el cubo hacia la posición objetivo (controlado por el mouse)
        cubeMain.rotation.y += (targetRotationY - cubeMain.rotation.y) * rotateSpeed;

        // Mover el cubo basado en las teclas presionadas
        if (keyState['ArrowUp']) {
            cubeMain.position.z -= moveSpeed * Math.cos(cubeMain.rotation.y);
            cubeMain.position.x -= moveSpeed * Math.sin(cubeMain.rotation.y);
        }
        if (keyState['ArrowDown']) {
            cubeMain.position.z += moveSpeed * Math.cos(cubeMain.rotation.y);
            cubeMain.position.x += moveSpeed * Math.sin(cubeMain.rotation.y);
        }
        if (keyState['ArrowLeft']) {
            cubeMain.position.x -= moveSpeed * Math.cos(cubeMain.rotation.y);
            cubeMain.position.z += moveSpeed * Math.sin(cubeMain.rotation.y);
        }
        if (keyState['ArrowRight']) {
            cubeMain.position.x += moveSpeed * Math.cos(cubeMain.rotation.y);
            cubeMain.position.z -= moveSpeed * Math.sin(cubeMain.rotation.y);
        }

        // Calcular la posición de la cámara relativa al cubo
        const relativeCameraOffset = new THREE.Vector3(0, cameraHeight, -cameraDistance);
        const cameraOffset = relativeCameraOffset.applyMatrix4(cubeMain.matrixWorld);


        // Establecer la posición de la cámara
        camera.position.copy(cameraOffset);
        camera.lookAt(cubeMain.position);

        // Verificar si el cubo está por encima del suelo
        if (cubeMain.position.y > groundHeight && physicsWorld) {
            // Desactivar las restricciones físicas
            cubeMain.userData.physicsBody.setActivationState(4); // 4 representa el estado de inactividad
        }
    }

    // Renderizar la escena
    renderer.render(scene, camera);

};
var cubeMain;
  // Crear un cubo en la posición actual
export async function CreateCubeUserMain(data){
    data.color = '#' + getRandomColor();
    //data.location = { x: 0, y: 0, z: 0 };
    data.CubeId = data.userId;
 
    //spawm arriba
    data.location = {
        x: 1,
        y: 2,
        z: 3
    }
      
    //  // Verificar si Ammo.js está inicializado
    //  if (!physicsWorld) {
    //      console.log("Esperando a que Ammo.js se inicialice...");
    //      // Espera a que Ammo.js esté listo
    //     await initPhysics();
    // }

    cubeMain = handleNewUserCube(data);

    // Verificar si el cubo tiene físicas, si no, agregarlas
    if (!cubeMain.userData.physicsBody) {
        setTimeout(() => {
            createCubeWithPhysics(cubeMain);
            // Iniciar la animación
            animate();
        }, 50); // Retraso de 0.5 segundos (500 milisegundos)
    }

    await sendDataUserCube( data.location, data.color);
    // Manejar las teclas de flecha para mover el cubo
     document.addEventListener("keydown", function (event) {
    //     switch (event.key) {
    //         case "ArrowUp":
    //             cubeMain.position.z -= 0.1;
    //             break;
    //         case "ArrowDown":
    //             cubeMain.position.z += 0.1;
    //             break;
    //         case "ArrowLeft":
    //             cubeMain.position.x -= 0.1;
    //             break;
    //         case "ArrowRight":
    //             cubeMain.position.x += 0.1;
    //             break;
    //     }
  
        // Enviar la ubicación y color actual al servidor
        UpdateDataUser(cubeMain.position, cubeMain.userData.cubeId);
        
        //sendDataUserCube(cube.position, cubeMaterial.color.getHexString());
     });
}
// Función para obtener un color aleatorio en formato hexadecimal
function getRandomColor() {
  return Math.floor(Math.random() * 16777215).toString(16);
}


// Objeto para almacenar los cubos de los usuarios
const userCubes = {};

// Función para manejar la información de un nuevo cubo de usuario
export function handleNewUserCube(data) {
  if (userCubes[data.CubeId]) {
    console.log(`Cubo con el ID ${data.CubeId} ya existe. No se creará un nuevo cubo.`);
    return;
  }
      // Verificar si el color incluye el carácter '#'
  const cubeColor = data.color.startsWith('#') ? data.color : '#' + data.color;

  // Crear un nuevo cubo en base a la información recibida "public/glb/Burguer.glb"
  const newUserCube = createCube(scene, data.CubeId, data.location, cubeColor);

  // Almacenar el nuevo cubo en el objeto userCubes
  userCubes[data.CubeId] = newUserCube;
  return newUserCube;
}
// Función para manejar la desconexión de un usuario y eliminar su cubo
export function handleUserDisconnect(data) {
    const disconnectedCubeId = data.CubeId;
  
    // Verificar si existe un cubo con el identificador desconectado
    const disconnectedCube = userCubes[disconnectedCubeId];
  
    if (disconnectedCube) {
      // Remover el cubo de la escena
      scene.remove(disconnectedCube);
  
      // Eliminar la referencia del cubo del objeto userCubes
      delete userCubes[disconnectedCubeId];
  
      console.log(`Cubo eliminado: ${disconnectedCubeId}`);
    } else {
      console.log(`No se encontró el cubo para el usuario desconectado: ${disconnectedCubeId}`);
    }
  }

// Función para mover un cubo existente a una nueva ubicación
export function updateCubeLocation(cubeId, newPosition) {
    const cubeToUpdate = userCubes[cubeId];
  
    if (cubeToUpdate) {
      cubeToUpdate.position.copy(newPosition);
    }
  }
  
// Función para crear un nuevo cubo con un identificador único
function createCube(scene, cubeId, position, color, glbPath) {
    // Verificar si se proporciona la ruta del archivo glb
  if (glbPath) {
    const loader = new GLTFLoader();
   
    loader.load(glbPath, (gltf) => {
      model = gltf.scene;
      model.userData.cubeId = cubeId;
      model.position.copy(position);
      
      scene.add(model);
    });
    
    return model;
  } else {
    // Crear un cubo si no se proporciona la ruta del archivo glb
    const cubeGeometry = new THREE.BoxGeometry();
    const cubeMaterial = new THREE.MeshBasicMaterial({ color });
    const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    
    cube.userData.cubeId = cubeId;
    cube.position.copy(position);
    
    scene.add(cube);

    let loadering = new GLTFLoader();
   
    loadering.load("public/glb/Burguer.glb", (gltf) => {
      model = gltf.scene;
      model.userData.cubeId = cubeId;
      model.position.copy(position);
      
      scene.add(model);
    });

    return cube;
  }
}

// función para crear un suelo con físicas
function createFloorWithPhysics(scene) {
   // Crear un suelo
   var floorGeometry = new THREE.PlaneGeometry(10, 10, 10, 10);
   var floorMaterial = new THREE.MeshBasicMaterial({ color: 0x999999, side: THREE.DoubleSide, wireframe: true });
   var floor = new THREE.Mesh(floorGeometry, floorMaterial);
   floor.rotation.x = Math.PI / 2;
   scene.add(floor);
   
    // Configura el suelo con físicas
    groundHeight = -0.1; // Actualiza la altura del suelo
    const groundShape = new Ammo.btBoxShape(new Ammo.btVector3(5, 0.1, 5));
    const groundTransform = new Ammo.btTransform();
    groundTransform.setIdentity();
    groundTransform.setOrigin(new Ammo.btVector3(0, -0.1, 0));
    const groundMass = 0; // Masa cero significa suelo estático
    const localInertia = new Ammo.btVector3(0, 0, 0);
    const motionState = new Ammo.btDefaultMotionState(groundTransform);
    const rbInfo = new Ammo.btRigidBodyConstructionInfo(groundMass, motionState, groundShape, localInertia);
    const groundRigidBody = new Ammo.btRigidBody(rbInfo);
    physicsWorld.addRigidBody(groundRigidBody);
  }


// Nueva función para crear un cubo con físicas
function createCubeWithPhysics(cube) {
    const cubeSize = 1;
    const cubeShape = new Ammo.btBoxShape(new Ammo.btVector3(cubeSize / 2, cubeSize / 2, cubeSize / 2));
    const cubeTransform = new Ammo.btTransform();
    cubeTransform.setIdentity();
    cubeTransform.setOrigin(new Ammo.btVector3(cube.position.x, cube.position.y, cube.position.z));
    const cubeMass = 2;
    const localInertia = new Ammo.btVector3(0, 0, 0);
    cubeShape.calculateLocalInertia(cubeMass, localInertia);
    const motionState = new Ammo.btDefaultMotionState(cubeTransform);
    const rbInfo = new Ammo.btRigidBodyConstructionInfo(cubeMass, motionState, cubeShape, localInertia);
    const cubeRigidBody = new Ammo.btRigidBody(rbInfo);
    physicsWorld.addRigidBody(cubeRigidBody);
    cube.userData.physicsBody = cubeRigidBody;
}

  // crear fisicas
  // añadir model 3d al suelo
  // añadir modelo 3d al cubo
  // añadir interacion entre cubos 