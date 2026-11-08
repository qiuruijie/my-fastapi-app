import uuid

from fastapi.testclient import TestClient
from sqlmodel import Session

from app.core.config import settings
from tests.utils.item import create_random_item


def test_create_item(superuser_client: TestClient) -> None:
    data = {"title": "Foo", "description": "Fighters"}
    response = superuser_client.post(
        f"{settings.API_V1_STR}/items/",
        json=data,
    )
    assert response.status_code == 200
    content = response.json()
    assert content["title"] == data["title"]
    assert content["description"] == data["description"]
    assert "id" in content
    assert "owner_id" in content


def test_read_item(superuser_client: TestClient, db: Session) -> None:
    item = create_random_item(db)
    response = superuser_client.get(
        f"{settings.API_V1_STR}/items/{item.id}",
    )
    assert response.status_code == 200
    content = response.json()
    assert content["title"] == item.title
    assert content["description"] == item.description
    assert content["id"] == str(item.id)
    assert content["owner_id"] == str(item.owner_id)


def test_read_item_not_found(superuser_client: TestClient) -> None:
    response = superuser_client.get(
        f"{settings.API_V1_STR}/items/{uuid.uuid4()}",
    )
    assert response.status_code == 404
    content = response.json()
    assert content["detail"] == "Item not found"


def test_read_item_not_enough_permissions(
    normal_user_client: TestClient, db: Session
) -> None:
    item = create_random_item(db)
    response = normal_user_client.get(
        f"{settings.API_V1_STR}/items/{item.id}",
    )
    assert response.status_code == 403
    content = response.json()
    assert content["detail"] == "Not enough permissions"


def test_read_items(superuser_client: TestClient, db: Session) -> None:
    create_random_item(db)
    create_random_item(db)
    response = superuser_client.get(
        f"{settings.API_V1_STR}/items/",
    )
    assert response.status_code == 200
    content = response.json()
    assert len(content["data"]) >= 2


def test_update_item(superuser_client: TestClient, db: Session) -> None:
    item = create_random_item(db)
    data = {"title": "Updated title", "description": "Updated description"}
    response = superuser_client.put(
        f"{settings.API_V1_STR}/items/{item.id}",
        json=data,
    )
    assert response.status_code == 200
    content = response.json()
    assert content["title"] == data["title"]
    assert content["description"] == data["description"]
    assert content["id"] == str(item.id)
    assert content["owner_id"] == str(item.owner_id)


def test_update_item_not_found(superuser_client: TestClient) -> None:
    data = {"title": "Updated title", "description": "Updated description"}
    response = superuser_client.put(
        f"{settings.API_V1_STR}/items/{uuid.uuid4()}",
        json=data,
    )
    assert response.status_code == 404
    content = response.json()
    assert content["detail"] == "Item not found"


def test_update_item_not_enough_permissions(
    normal_user_client: TestClient, db: Session
) -> None:
    item = create_random_item(db)
    data = {"title": "Updated title", "description": "Updated description"}
    response = normal_user_client.put(
        f"{settings.API_V1_STR}/items/{item.id}",
        json=data,
    )
    assert response.status_code == 403
    content = response.json()
    assert content["detail"] == "Not enough permissions"


def test_delete_item(superuser_client: TestClient, db: Session) -> None:
    item = create_random_item(db)
    response = superuser_client.delete(
        f"{settings.API_V1_STR}/items/{item.id}",
    )
    assert response.status_code == 200
    content = response.json()
    assert content["message"] == "Item deleted successfully"


def test_delete_item_not_found(superuser_client: TestClient) -> None:
    response = superuser_client.delete(
        f"{settings.API_V1_STR}/items/{uuid.uuid4()}",
    )
    assert response.status_code == 404
    content = response.json()
    assert content["detail"] == "Item not found"


def test_delete_item_not_enough_permissions(
    normal_user_client: TestClient, db: Session
) -> None:
    item = create_random_item(db)
    response = normal_user_client.delete(
        f"{settings.API_V1_STR}/items/{item.id}",
    )
    assert response.status_code == 403
    content = response.json()
    assert content["detail"] == "Not enough permissions"
