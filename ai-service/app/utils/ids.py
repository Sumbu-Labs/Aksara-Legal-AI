import secrets


def generate_request_id() -> str:
    return secrets.token_hex(8)
