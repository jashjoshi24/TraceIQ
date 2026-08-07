import json
import urllib.request
import urllib.error
import http.cookiejar
from urllib.parse import urlencode

BASE_URL = "http://127.0.0.1:8001"

# Setup cookie jar to capture HttpOnly refresh_token cookie
cookie_jar = http.cookiejar.CookieJar()
handler = urllib.request.HTTPCookieProcessor(cookie_jar)
opener = urllib.request.build_opener(handler)
urllib.request.install_opener(opener)

def make_request(path, method="GET", data=None, headers=None):
    url = f"{BASE_URL}{path}"
    headers = headers or {}
    
    # Set JSON headers
    if "Content-Type" not in headers and data is not None:
        headers["Content-Type"] = "application/json"
        
    req_data = None
    if data is not None:
        if headers.get("Content-Type") == "application/json":
            req_data = json.dumps(data).encode("utf-8")
        else:
            req_data = urlencode(data).encode("utf-8")
            
    req = urllib.request.Request(url, data=req_data, headers=headers, method=method)
    
    try:
        with urllib.request.urlopen(req) as response:
            status_code = response.getcode()
            response_data = response.read().decode("utf-8")
            res_json = json.loads(response_data) if response_data else {}
            return status_code, res_json, response.headers
    except urllib.error.HTTPError as e:
        status_code = e.code
        try:
            error_data = e.read().decode("utf-8")
            res_json = json.loads(error_data) if error_data else {}
        except Exception:
            res_json = {"detail": str(e)}
        return status_code, res_json, e.headers
    except Exception as e:
        return 0, {"detail": str(e)}, {}

def run_tests():
    print("=" * 60)
    print(" TRACEIQ API VERIFICATION TEST SUITE")
    print("=" * 60)
    
    # 1. Test Login with Seeded Admin
    print("\n[TEST 1] Logging in with seeded admin...")
    login_payload = {"username": "admin", "password": "adminpassword"}
    status, body, headers = make_request("/auth/login", method="POST", data=login_payload)
    
    if status == 200:
        print(" -> SUCCESS: Logged in successfully!")
        access_token = body["access_token"]
        print(f" -> Access Token: {access_token[:30]}...")
        # Inspect cookies
        cookies = {c.name: c.value for c in cookie_jar}
        print(f" -> Captured Cookies: {list(cookies.keys())}")
        if "refresh_token" in cookies:
            print(" -> SUCCESS: HttpOnly refresh token cookie found!")
        else:
            print(" -> FAILED: refresh_token cookie not found in jar.")
    else:
        print(f" -> FAILED: {status} - {body}")
        return

    auth_headers = {"Authorization": f"Bearer {access_token}"}

    # 2. Get /auth/me
    print("\n[TEST 2] Fetching authenticated user details (/auth/me)...")
    status, body, _ = make_request("/auth/me", method="GET", headers=auth_headers)
    if status == 200:
        print(" -> SUCCESS: Received user details!")
        print(f" -> Username: {body['username']}")
        print(f" -> Email: {body['email']}")
        print(f" -> Profile: {body.get('profile', {})}")
        print(f" -> Roles: {[r['name'] for r in body.get('roles', [])]}")
    else:
        print(f" -> FAILED: {status} - {body}")

    # 3. Register a new user
    print("\n[TEST 3] Registering a new investigator user...")
    new_user_payload = {
        "username": "investigator_alice",
        "email": "alice@sentinelx.com",
        "password": "alicepassword123"
    }
    status, body, _ = make_request("/auth/register", method="POST", data=new_user_payload)
    if status == 201:
        print(" -> SUCCESS: Registered user!")
        print(f" -> User ID: {body['id']}")
    else:
        print(f" -> FAILED: {status} - {body}")

    # 4. Refresh token
    print("\n[TEST 4] Silent token refresh (/auth/refresh)...")
    status, body, _ = make_request("/auth/refresh", method="POST")
    if status == 200:
        print(" -> SUCCESS: Refreshed access token!")
        new_access_token = body["access_token"]
        auth_headers = {"Authorization": f"Bearer {new_access_token}"}
        # Verify cookie rotation
        cookies = {c.name: c.value for c in cookie_jar}
        print(f" -> Rotated Cookies: {list(cookies.keys())}")
    else:
        print(f" -> FAILED: {status} - {body}")

    # 5. Fetch and Update profile
    print("\n[TEST 5] Updating user profile...")
    status, body, _ = make_request("/users/profile", method="GET", headers=auth_headers)
    print(f" -> Original Profile: {body}")
    
    update_payload = {
        "first_name": "Super",
        "last_name": "Administrator",
        "phone": "+1-555-0199",
        "department": "Global Security Operations Center"
    }
    status, body, _ = make_request("/users/profile", method="PUT", data=update_payload, headers=auth_headers)
    if status == 200:
        print(" -> SUCCESS: Profile updated!")
        print(f" -> Updated Profile: {body}")
    else:
        print(f" -> FAILED: {status} - {body}")

    # 6. Change Password
    print("\n[TEST 6] Self-service password change...")
    pw_change_payload = {
        "current_password": "adminpassword",
        "new_password": "newadminpassword"
    }
    status, body, _ = make_request("/users/change-password", method="PUT", data=pw_change_payload, headers=auth_headers)
    if status == 200:
        print(" -> SUCCESS: Password changed!")
    else:
        print(f" -> FAILED: {status} - {body}")

    # 7. Login with New Password
    print("\n[TEST 7] Logging in with new password...")
    login_payload = {"username": "admin", "password": "newadminpassword"}
    status, body, _ = make_request("/auth/login", method="POST", data=login_payload)
    if status == 200:
        print(" -> SUCCESS: Logged in with new password!")
        access_token = body["access_token"]
        auth_headers = {"Authorization": f"Bearer {access_token}"}
    else:
        print(f" -> FAILED: {status} - {body}")

    # 8. Admin Query Users list
    print("\n[TEST 8] Listing users as Admin (paginated)...")
    status, body, _ = make_request("/users?page=1&limit=5&sort_by=username&sort_order=asc", method="GET", headers=auth_headers)
    if status == 200:
        print(" -> SUCCESS: Fetched users list!")
        print(f" -> Total Users: {body['total']}")
        print(f" -> Items: {[u['username'] for u in body['items']]}")
    else:
        print(f" -> FAILED: {status} - {body}")

    # 9. Admin Query Roles
    print("\n[TEST 9] Querying RBAC roles as Admin...")
    status, body, _ = make_request("/roles", method="GET", headers=auth_headers)
    if status == 200:
        print(" -> SUCCESS: Fetched roles!")
        for role in body:
            print(f"   -> Role: {role['name']} (Permissions: {[p['name'] for p in role['permissions']]})")
    else:
        print(f" -> FAILED: {status} - {body}")

    # 10. Logout
    print("\n[TEST 10] Logging out...")
    status, body, _ = make_request("/auth/logout", method="POST")
    if status == 200:
        print(" -> SUCCESS: Logged out!")
        # Verify cookie cleared
        cookies = {c.name: c.value for c in cookie_jar}
        print(f" -> Active Cookies after logout: {cookies}")
    else:
        print(f" -> FAILED: {status} - {body}")

    print("\n" + "=" * 60)
    print(" VERIFICATION COMPLETE")
    print("=" * 60)

if __name__ == "__main__":
    run_tests()
