import random
import string

from fastapi.testclient import TestClient

from app.core.config import settings


def random_lower_string() -> str:
    return "".join(random.choices(string.ascii_lowercase, k=32))


def random_email() -> str:
    return f"{random_lower_string()}@{random_lower_string()}.com"


def login(client: TestClient, *, email: str, password: str) -> None:
    """
    Log in through the API; the HttpOnly access_token cookie is stored on the
    client itself, so subsequent requests on the same client are authenticated.
    """
    client.cookies.clear()
    r = client.post(
        f"{settings.API_V1_STR}/login/access-token",
        data={"username": email, "password": password},
    )
    assert r.status_code == 200, f"Login failed: {r.text}"


def login_superuser(client: TestClient) -> None:
    login(
        client,
        email=settings.FIRST_SUPERUSER,
        password=settings.FIRST_SUPERUSER_PASSWORD,
    )
