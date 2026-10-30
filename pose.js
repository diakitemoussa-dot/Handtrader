// Position de la caméra par rapport à un marqueur carré, à partir de ses 4 coins dans l'image.
//
// Repère « monde » : l'origine est le centre du marqueur, y est la verticale (la normale du marqueur),
// la longueur du côté du marqueur vaut 1. Le marqueur est posé à plat sur la surface, en y = 0.
import * as THREE from 'three';

// coins du marqueur dans son plan (X droite, Y haut), dans l'ordre renvoyé par le détecteur :
// haut-gauche, haut-droite, bas-droite, bas-gauche
const MODEL = [[-0.5, 0.5], [0.5, 0.5], [0.5, -0.5], [-0.5, -0.5]];

// résout A x = b (élimination de Gauss, pivot partiel)
function solve(A, b) {
  const n = b.length;
  for (let i = 0; i < n; i++) {
    let p = i;
    for (let r = i + 1; r < n; r++) if (Math.abs(A[r][i]) > Math.abs(A[p][i])) p = r;
    [A[i], A[p]] = [A[p], A[i]]; [b[i], b[p]] = [b[p], b[i]];
    if (Math.abs(A[i][i]) < 1e-12) return null;
    for (let r = i + 1; r < n; r++) {
      const k = A[r][i] / A[i][i];
      for (let c = i; c < n; c++) A[r][c] -= k * A[i][c];
      b[r] -= k * b[i];
    }
  }
  const x = new Array(n);
  for (let i = n - 1; i >= 0; i--) {
    let s = b[i];
    for (let c = i + 1; c < n; c++) s -= A[i][c] * x[c];
    x[i] = s / A[i][i];
  }
  return x;
}

/**
 * @param corners  4 coins {x, y} en pixels vidéo (y vers le bas)
 * @param f        focale en pixels vidéo
 * @param cx, cy   centre optique en pixels vidéo
 * @returns {position: Vector3, quaternion: Quaternion} de la caméra Three.js dans le repère monde, ou null
 */
export function cameraPoseFromMarker(corners, f, cx, cy) {
  // homographie plan du marqueur -> plan image normalisé
  const A = [], b = [];
  for (let i = 0; i < 4; i++) {
    const [X, Y] = MODEL[i];
    const u = (corners[i].x - cx) / f, v = (corners[i].y - cy) / f;
    A.push([X, Y, 1, 0, 0, 0, -u * X, -u * Y]); b.push(u);
    A.push([0, 0, 0, X, Y, 1, -v * X, -v * Y]); b.push(v);
  }
  const h = solve(A, b);
  if (!h) return null;
  let h1 = [h[0], h[3], h[6]], h2 = [h[1], h[4], h[7]], t = [h[2], h[5], 1];

  const norm = v => Math.hypot(v[0], v[1], v[2]);
  const lambda = 2 / (norm(h1) + norm(h2));
  h1 = h1.map(x => x * lambda); h2 = h2.map(x => x * lambda); t = t.map(x => x * lambda);
  if (t[2] < 0) { h1 = h1.map(x => -x); h2 = h2.map(x => -x); t = t.map(x => -x); }   // le marqueur est devant la caméra

  // base orthonormée (r1, r2, r3)
  const r1 = new THREE.Vector3(...h1).normalize();
  const r2 = new THREE.Vector3(...h2);
  r2.addScaledVector(r1, -r2.dot(r1)).normalize();
  const r3 = new THREE.Vector3().crossVectors(r1, r2);

  // axes de la caméra (convention vision : x droite, y bas, z devant) exprimés dans le repère du marqueur
  const ax = new THREE.Vector3(r1.x, r2.x, r3.x);
  const ay = new THREE.Vector3(r1.y, r2.y, r3.y);
  const az = new THREE.Vector3(r1.z, r2.z, r3.z);
  // position de la caméra dans le repère du marqueur : -R^T t
  const tv = new THREE.Vector3(...t);
  const pos = new THREE.Vector3(-r1.dot(tv), -r2.dot(tv), -r3.dot(tv));

  // repère marqueur (X, Y, Z) -> monde (x, y, z) = (X, Z, -Y)
  const toWorld = v => new THREE.Vector3(v.x, v.z, -v.y);
  // caméra Three.js : x = x vision, y = -y vision, z = -z vision
  const m = new THREE.Matrix4().makeBasis(toWorld(ax), toWorld(ay).negate(), toWorld(az).negate());
  return { position: toWorld(pos), quaternion: new THREE.Quaternion().setFromRotationMatrix(m) };
}
