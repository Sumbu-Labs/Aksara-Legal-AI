from app.services.rag.ingestion.chunker import chunk_text


def test_chunking_overlap():
    text = " ".join([f"kata{i}" for i in range(1000)])
    chunks = chunk_text(text, "Bagian Uji", chunk_size=100, overlap=20)
    assert len(chunks) > 5
    assert chunks[0].section == "Bagian Uji"
    assert chunks[1].text.split()[0] == "kata80"
