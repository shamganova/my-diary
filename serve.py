# Runs the diary on this computer, so the iPad can open it over Wi-Fi.
# Start it from the project folder:  python diary_app/serve.py
# Stop it with Ctrl + C.

import socket
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

PORT = 8000
FOLDER = Path(__file__).parent  # the diary_app folder


class NoCacheHandler(SimpleHTTPRequestHandler):
    # Tell the browser to always check for a newer version, so changes show up on the iPad
    def end_headers(self):
        self.send_header("Cache-Control", "no-cache")
        super().end_headers()


def wifi_address():
    # Find this computer's address in the home network (nothing is sent to the internet)
    with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as s:
        s.connect(("8.8.8.8", 80))
        return s.getsockname()[0]


handler = partial(NoCacheHandler, directory=FOLDER)
server = ThreadingHTTPServer(("0.0.0.0", PORT), handler)
print(f"Дневник запущен. Открой на iPad: http://{wifi_address()}:{PORT}")
print("Чтобы остановить, нажми Ctrl + C")
server.serve_forever()
