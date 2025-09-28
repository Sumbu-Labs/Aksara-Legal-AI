class RetrievalError(Exception):
    """Raised when the retrieval pipeline fails."""


class GuardrailError(Exception):
    """Raised when grounding confidence is below threshold."""


class TemplateNotFoundError(Exception):
    """Raised when no template is available for a given key."""


class PdfExportError(Exception):
    """Raised when PDF conversion fails."""


class MissingFieldError(Exception):
    """Raised when required fields are missing for Autopilot."""
