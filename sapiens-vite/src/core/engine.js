import * as THREE from 'three';
import { CAMERA } from '../config.js';

/** Renderer, shared camera and frame timer. One camera is shared by the study room and the timeline. */
export function createEngine(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(innerWidth, innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;

  const camera = new THREE.PerspectiveCamera(CAMERA.fov.room, innerWidth / innerHeight, CAMERA.near, CAMERA.far);
  const timer = new THREE.Timer();

  addEventListener('resize', () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
  });

  const setFov = fov => { camera.fov = fov; camera.updateProjectionMatrix(); };

  return { renderer, camera, timer, setFov };
}
