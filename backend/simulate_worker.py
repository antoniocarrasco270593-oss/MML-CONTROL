import requests
import time
import random

API_URL = "http://localhost:8000"

# 1. Register a worker
worker_email = f"worker{random.randint(100,999)}@test.com"
worker_pass = "worker123"

print(f"Creating worker: {worker_email}...")
try:
    requests.post(f"{API_URL}/register", json={
        "email": worker_email,
        "password": worker_pass,
        "full_name": "Repartidor Test",
        "worker_number": 7
    })
except:
    print("Worker might already exist, trying login...")

# 2. Login
print("Logging in...")
resp = requests.post(f"{API_URL}/token", data={
    "username": worker_email,
    "password": worker_pass
})
if resp.status_code != 200:
    print("Login failed")
    exit()

token = resp.json()["access_token"]
headers = {"Authorization": f"Bearer {token}"}

# 3. Start Shift
print("Starting Shift...")
requests.post(f"{API_URL}/shifts/start", headers=headers)

# 4. Simulate Movement (Madrid Center)
lat, lng = 40.4168, -3.7038
print("Sending location updates... LOOK AT YOUR MAP!")

try:
    while True:
        # Move slightly
        lat += random.uniform(-0.001, 0.001)
        lng += random.uniform(-0.001, 0.001)
        
        requests.post(f"{API_URL}/location", json={
            "latitude": lat,
            "longitude": lng
        }, headers=headers)
        
        print(f"Ping: {lat:.4f}, {lng:.4f}")
        time.sleep(2)
except KeyboardInterrupt:
    requests.post(f"{API_URL}/shifts/end", headers=headers)
    print("Shift ended.")
