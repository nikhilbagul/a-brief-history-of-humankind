import * as THREE from 'three';

const SUN_OFFSET = new THREE.Vector3(18, 32, 14);
const SHADOW_HALF = 30, SHADOW_RES = 2048;

function gradientTexture(stops) {
  const c = document.createElement('canvas'); c.width = 2; c.height = 256;
  const g = c.getContext('2d'), gr = g.createLinearGradient(0, 0, 0, 256);
  gr.addColorStop(0, stops[0]); gr.addColorStop(0.6, stops[1]); gr.addColorStop(1, stops[2]);
  g.fillStyle = gr; g.fillRect(0, 0, 2, 256);
  return new THREE.CanvasTexture(c);
}

/** Sky, fog, lights and ground for the timeline scene. The sun follows the camera target. */
export function createEnvironment(scene, length) {
  scene.background = gradientTexture(['#ffa64d', '#f8823a', '#ee6c32']);
  scene.fog = new THREE.Fog(0xf8823a, 60, 170);

  const ambient = new THREE.AmbientLight(0xffe6c8, 1.15);
  const hemi = new THREE.HemisphereLight(0xffd9b0, 0xd96a2e, 0.5);
  const sun = new THREE.DirectionalLight(0xfff2df, 2.1);
  sun.castShadow = true;
  sun.shadow.mapSize.set(SHADOW_RES, SHADOW_RES);
  Object.assign(sun.shadow.camera, { left: -SHADOW_HALF, right: SHADOW_HALF, top: SHADOW_HALF, bottom: -SHADOW_HALF, far: 120 });
  sun.shadow.bias = -0.0004;
  scene.add(ambient, hemi, sun, sun.target);

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(length + 700, 700),
    new THREE.MeshStandardMaterial({ color: 0xffa055, roughness: 1 }),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.set(length / 2, 0, 0);
  ground.receiveShadow = true;
  scene.add(ground);

  // Snap the shadow frustum to whole texels in light space so shadows don't shimmer while the camera moves.
  const lightBasis = new THREE.Matrix4().lookAt(SUN_OFFSET, new THREE.Vector3(), new THREE.Vector3(0, 1, 0));
  const lightInv = lightBasis.clone().invert();
  const texel = (SHADOW_HALF * 2) / SHADOW_RES;
  const v = new THREE.Vector3();

  return {
    follow(target) {
      v.copy(target).applyMatrix4(lightInv);
      v.x = Math.round(v.x / texel) * texel;
      v.y = Math.round(v.y / texel) * texel;
      v.applyMatrix4(lightBasis);
      sun.target.position.copy(v);
      sun.position.copy(v).add(SUN_OFFSET);
    },
    setPalette(p) {
      scene.background.dispose();
      scene.background = gradientTexture(p.sky);
      scene.fog.color.set(p.sky[1]);
      ground.material.color.setHex(p.ground);
      ambient.color.setHex(p.ambient); ambient.intensity = p.ambientIntensity;
      hemi.color.setHex(p.hemiSky); hemi.groundColor.setHex(p.hemiGround);
      sun.color.setHex(p.sun); sun.intensity = p.sunIntensity;
    },
  };
}
