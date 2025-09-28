from __future__ import annotations

from typing import Any, Dict

import jwt
from fastapi import Depends, HTTPException, Request, status

from app.core.config import get_settings


def decode_jwt(token: str) -> Dict[str, Any]:
    settings = get_settings()
    try:
        payload = jwt.decode(
            token,
            settings.jwt_public_key,
            algorithms=["RS256"],
            audience=settings.jwt_audience,
            issuer=settings.jwt_issuer,
        )
        return payload
    except jwt.PyJWTError as exc:  # type: ignore[attr-defined]
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token") from exc


async def get_current_user(request: Request) -> Dict[str, Any]:
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing token")
    token = auth_header.split(" ", 1)[1]
    return decode_jwt(token)


async def require_user_id(user=Depends(get_current_user)) -> str:
    user_id = user.get("sub")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing user id")
    return str(user_id)
