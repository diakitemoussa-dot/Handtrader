"""Serveur HTTPS local pour tester la page AR sur un téléphone du même Wi-Fi.

Usage :  python serve-https.py
La caméra d'un téléphone n'est accessible qu'en HTTPS : le script crée un certificat
auto-signé (cert.pem / key.pem, via openssl) et affiche l'adresse à ouvrir sur le téléphone.
Le navigateur affichera un avertissement de sécurité : c'est normal, accepte-le.
"""
import http.server
import os
import socket
import ssl
import subprocess

PORT = 8443
HERE = os.path.dirname(os.path.abspath(__file__))
os.chdir(HERE)


def local_ip():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(("8.8.8.8", 80))
        return s.getsockname()[0]
    finally:
        s.close()


ip = local_ip()
if not (os.path.exists("cert.pem") and os.path.exists("key.pem")):
    subprocess.run(
        ["openssl", "req", "-x509", "-newkey", "rsa:2048", "-nodes", "-days", "30",
         "-keyout", "key.pem", "-out", "cert.pem", "-subj", "/CN=handtraking",
         "-addext", f"subjectAltName=IP:{ip},DNS:localhost"],
        check=True,
    )

ctx = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
ctx.load_cert_chain("cert.pem", "key.pem")
server = http.server.ThreadingHTTPServer(("0.0.0.0", PORT), http.server.SimpleHTTPRequestHandler)
server.socket = ctx.wrap_socket(server.socket, server_side=True)
print(f"Ouvre sur ton téléphone (même Wi-Fi) : https://{ip}:{PORT}/ar.html")
server.serve_forever()
