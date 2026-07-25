import io

from PIL import Image

from app.services.virtual_try_on import mock_provider


def _tiny_jpeg_bytes() -> bytes:
    buffer = io.BytesIO()
    Image.new("RGB", (64, 64), color=(200, 200, 200)).save(buffer, format="JPEG")
    return buffer.getvalue()


def _register_and_add_to_cart(client, email="tryon@example.com") -> int:
    client.post("/api/auth/register", json={"email": email, "password": "password123"})
    item = client.post(
        "/api/cart",
        json={
            "title": "테스트 재킷",
            "price": 39000,
            "mall_name": "테스트몰",
            "image_url": "https://example.com/jacket.jpg",
            "link": "https://example.com/item/1",
            "category": "패션의류",
        },
    ).json()
    return item["id"]


def test_create_job_requires_login(client):
    response = client.post(
        "/api/virtual-try-on",
        files={"person_image": ("photo.jpg", _tiny_jpeg_bytes(), "image/jpeg")},
        data={"cart_item_id": "1"},
    )
    assert response.status_code == 401


def test_create_job_rejects_unsupported_mime_type(client):
    cart_item_id = _register_and_add_to_cart(client)
    response = client.post(
        "/api/virtual-try-on",
        files={"person_image": ("photo.gif", b"not-really-a-gif", "image/gif")},
        data={"cart_item_id": str(cart_item_id)},
    )
    assert response.status_code == 400


def test_create_job_rejects_oversized_image(client):
    cart_item_id = _register_and_add_to_cart(client, email="oversize@example.com")
    oversized = b"0" * (10 * 1024 * 1024 + 1)
    response = client.post(
        "/api/virtual-try-on",
        files={"person_image": ("photo.jpg", oversized, "image/jpeg")},
        data={"cart_item_id": str(cart_item_id)},
    )
    assert response.status_code == 400


def test_create_job_rejects_cart_item_owned_by_another_user(client):
    other_item_id = _register_and_add_to_cart(client, email="owner2@example.com")
    client.post("/api/auth/logout")
    client.post("/api/auth/register", json={"email": "intruder2@example.com", "password": "password123"})

    response = client.post(
        "/api/virtual-try-on",
        files={"person_image": ("photo.jpg", _tiny_jpeg_bytes(), "image/jpeg")},
        data={"cart_item_id": str(other_item_id)},
    )
    assert response.status_code == 404


def test_full_mock_flow_reaches_succeeded_with_result_image(client, monkeypatch):
    monkeypatch.setattr(mock_provider, "_PROCESSING_AFTER_SECONDS", 0.0)
    monkeypatch.setattr(mock_provider, "_SUCCEEDED_AFTER_SECONDS", 0.0)

    cart_item_id = _register_and_add_to_cart(client, email="fullflow@example.com")
    create = client.post(
        "/api/virtual-try-on",
        files={"person_image": ("photo.jpg", _tiny_jpeg_bytes(), "image/jpeg")},
        data={"cart_item_id": str(cart_item_id)},
    )
    assert create.status_code == 201
    job = create.json()
    assert job["status"] == "queued"

    status = client.get(f"/api/virtual-try-on/status/{job['id']}")
    assert status.status_code == 200
    body = status.json()
    assert body["status"] == "succeeded"
    assert body["result_image_url"].startswith("data:image/jpeg;base64,")


def test_status_requires_ownership(client):
    cart_item_id = _register_and_add_to_cart(client, email="statusowner@example.com")
    create = client.post(
        "/api/virtual-try-on",
        files={"person_image": ("photo.jpg", _tiny_jpeg_bytes(), "image/jpeg")},
        data={"cart_item_id": str(cart_item_id)},
    )
    job_id = create.json()["id"]

    client.post("/api/auth/logout")
    client.post("/api/auth/register", json={"email": "statusintruder@example.com", "password": "password123"})

    response = client.get(f"/api/virtual-try-on/status/{job_id}")
    assert response.status_code == 404
