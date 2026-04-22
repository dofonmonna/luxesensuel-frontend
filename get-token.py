import requests
import hashlib
import time

APP_KEY = "531148"
APP_SECRET = "PMGo9kWoUpx7PPu7qn4GwVGIze95O2JE"
CODE = "3_531148_KWA4sUOyQxnIJI4pfYlL9Uly1253"
API_PATH = "/auth/token/create"

TIMESTAMP = str(int(time.time() * 1000))

params = {
    "app_key": APP_KEY,
    "code": CODE,
    "grant_type": "authorization_code",
    "sign_method": "md5",
    "timestamp": TIMESTAMP,
}

# Signature GOP = SECRET + API_PATH + sorted_params + SECRET
sign_str = APP_SECRET + API_PATH
for k in sorted(params.keys()):
    sign_str += k + params[k]
sign_str += APP_SECRET

sign = hashlib.md5(sign_str.encode("utf-8")).hexdigest().upper()
params["sign"] = sign

print("Sign string:", sign_str)

response = requests.post(
    "https://api-sg.aliexpress.com/rest" + API_PATH,
    data=params,
    headers={"Content-Type": "application/x-www-form-urlencoded"}
)
print("Status:", response.status_code)
print("Result:", response.json())