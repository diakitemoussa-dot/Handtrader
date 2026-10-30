# Handtrader

Cubes 3D à attraper avec la main, via la caméra (MediaPipe + Three.js).

- `index.html` : version ordinateur (gravité, cubes solides empilables, lancer).
- `ar.html` : version AR pour smartphone. Les cubes sont ancrés sur un marqueur posé sur une table (caméra arrière).
- `marker.html` : le marqueur à afficher sur un autre écran ou à imprimer (10–15 cm).
- `pose.js` : calcul de la position de la caméra par rapport au marqueur.
- `vendor/` : détecteur de marqueurs ArUco ([js-aruco2](https://github.com/damianofalcioni/js-aruco2), Apache-2.0).
- `serve-https.py` : serveur HTTPS local pour tester sur un téléphone.
