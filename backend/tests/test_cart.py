def _register(client, email="cart@example.com"):
    client.post("/api/auth/register", json={"email": email, "password": "password123"})


def _item_payload(link="https://example.com/item/1"):
    return {
        "title": "무선 이어폰",
        "price": 30000,
        "mall_name": "몰A",
        "image_url": "https://example.com/img.jpg",
        "link": link,
        "category": "디지털/가전",
    }


def test_add_and_list_cart_item(client):
    _register(client)

    add = client.post("/api/cart", json=_item_payload())
    assert add.status_code == 201
    assert add.json()["title"] == "무선 이어폰"

    listing = client.get("/api/cart")
    assert listing.status_code == 200
    assert len(listing.json()) == 1


def test_add_same_item_twice_is_idempotent(client):
    _register(client)

    first = client.post("/api/cart", json=_item_payload())
    second = client.post("/api/cart", json=_item_payload())
    assert first.json()["id"] == second.json()["id"]

    listing = client.get("/api/cart")
    assert len(listing.json()) == 1


def test_remove_cart_item(client):
    _register(client)

    added = client.post("/api/cart", json=_item_payload()).json()
    remove = client.delete(f"/api/cart/{added['id']}")
    assert remove.status_code == 204

    listing = client.get("/api/cart")
    assert listing.json() == []


def test_cart_requires_login(client):
    response = client.get("/api/cart")
    assert response.status_code == 401


def test_cannot_remove_another_users_item(client):
    _register(client, email="owner@example.com")
    added = client.post("/api/cart", json=_item_payload()).json()

    client.post("/api/auth/logout")
    _register(client, email="intruder@example.com")

    remove = client.delete(f"/api/cart/{added['id']}")
    assert remove.status_code == 404
