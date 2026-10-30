# Handtrader

Cubes 3D à attraper avec la main, via la caméra (MediaPipe + Three.js).

- `index.html` : version ordinateur (gravité, cubes solides empilables, lancer).
- `ar.html` : **vraie AR sans marqueur** (WebXR : détection de la table/du sol, caméra et suivi de la main).
  Android + Chrome, téléphone compatible ARCore.
- `ar-marker.html` + `marker.html` + `pose.js` : mode de secours avec marqueur ArUco (iPhone, Safari sans WebXR).
- `vendor/` : détecteur de marqueurs ([js-aruco2](https://github.com/damianofalcioni/js-aruco2), Apache-2.0).
- `serve-https.py` : serveur HTTPS local pour tester sur un téléphone.
