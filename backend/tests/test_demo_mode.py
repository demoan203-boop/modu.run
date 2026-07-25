import io

from PIL import Image


def _tiny_jpeg_bytes() -> bytes:
    buffer = io.BytesIO()
    Image.new("RGB", (64, 64), color=(200, 200, 200)).save(buffer, format="JPEG")
    return buffer.getvalue()


def test_demo_login_succeeds_without_database(demo_client):
    response = demo_client.post("/api/auth/login", json={"email": "admin", "password": "1234"})
    assert response.status_code == 200
    assert response.json() == {"id": -1, "email": "admin"}


def test_demo_login_rejects_wrong_credentials(demo_client):
    response = demo_client.post("/api/auth/login", json={"email": "admin", "password": "wrong"})
    assert response.status_code == 503


def test_register_still_requires_database(demo_client):
    response = demo_client.post(
        "/api/auth/register", json={"email": "someone@example.com", "password": "password123"}
    )
    assert response.status_code == 503


def test_me_without_login_returns_401(demo_client):
    assert demo_client.get("/api/auth/me").status_code == 401


def test_demo_cart_flow_without_database(demo_client):
    demo_client.post("/api/auth/login", json={"email": "admin", "password": "1234"})

    add = demo_client.post(
        "/api/cart",
        json={
            "title": "데모 재킷",
            "price": 19000,
            "mall_name": "데모몰",
            "image_url": "https://example.com/jacket.jpg",
            "link": "https://example.com/item/1",
            "category": "패션의류",
        },
    )
    assert add.status_code == 201
    item_id = add.json()["id"]

    listing = demo_client.get("/api/cart")
    assert listing.status_code == 200
    assert len(listing.json()) == 1

    remove = demo_client.delete(f"/api/cart/{item_id}")
    assert remove.status_code == 204
    assert demo_client.get("/api/cart").json() == []


def test_demo_virtual_try_on_flow_without_database(demo_client, monkeypatch):
    from app.services.virtual_try_on import mock_provider

    monkeypatch.setattr(mock_provider, "_PROCESSING_AFTER_SECONDS", 0.0)
    monkeypatch.setattr(mock_provider, "_SUCCEEDED_AFTER_SECONDS", 0.0)

    demo_client.post("/api/auth/login", json={"email": "admin", "password": "1234"})
    item = demo_client.post(
        "/api/cart",
        json={
            "title": "데모 재킷",
            "price": 19000,
            "mall_name": "데모몰",
            "image_url": "https://example.com/jacket.jpg",
            "link": "https://example.com/item/2",
            "category": "패션의류",
        },
    ).json()

    create = demo_client.post(
        "/api/virtual-try-on",
        files={"person_image": ("photo.jpg", _tiny_jpeg_bytes(), "image/jpeg")},
        data={"cart_item_id": str(item["id"])},
    )
    assert create.status_code == 201
    job_id = create.json()["id"]

    status = demo_client.get(f"/api/virtual-try-on/status/{job_id}")
    assert status.status_code == 200
    assert status.json()["status"] == "succeeded"
    assert status.json()["result_image_url"].startswith("data:image/jpeg;base64,")
