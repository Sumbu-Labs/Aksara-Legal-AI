import pytest
from fastapi.testclient import TestClient

from app.api.deps import get_rag_pipeline
from app.main import app


class DummyPipeline:
    async def answer(self, payload):
        return {
            "answer_md": "Langkah-langkah perizinan",
            "citations": [],
            "retrieval_meta": {},
            "model_meta": {},
        }


@pytest.fixture(autouse=True)
def override_pipeline():
    app.dependency_overrides[get_rag_pipeline] = lambda: DummyPipeline()
    yield
    app.dependency_overrides.clear()


def test_must_cite_returns_guardrail():
    client = TestClient(app)
    response = client.post(
        "/v1/qa/query",
        json={"question": "Apa itu?", "user_id": "user-1", "region": "DIY"},
    )
    assert response.status_code == 200
    body = response.json()
    assert body["answer_md"] == "Saya tidak dapat memverifikasi ini."
