from app.services.autopilot.validators.fields import FieldValidator


def test_validator_finds_missing_fields():
    schema = {
        "required": ["nama_usaha", "alamat"],
        "properties": {
            "nama_usaha": {"description": "Nama usaha"},
            "alamat": {"description": "Alamat lengkap"},
        },
    }
    validator = FieldValidator(schema)
    missing = validator.find_missing({"nama_usaha": "Warung"})
    assert missing == ["alamat"]
    guidance = validator.guidance(missing)
    assert "alamat" in guidance
