import re


FORBIDDEN_PATTERNS = [
    r"ignore\s+(all\s+)?(previous|above|instructions)",
    r"system\s*:\s*override",
    r"<\|endoftext\|>",
    r"\[INST\]",
]


def sanitize_prompt(text: str) -> str:
    sanitized = text
    for pattern in FORBIDDEN_PATTERNS:
        sanitized = re.sub(pattern, "[REDACTED]", sanitized, flags=re.IGNORECASE)
    return sanitized.strip()


def validate_test_steps(steps: str) -> str:
    cleaned = steps.strip()
    if len(cleaned) < 5:
        raise ValueError("Test steps must be at least 5 characters")
    if len(cleaned) > 5000:
        raise ValueError("Test steps must be under 5000 characters")
    return sanitize_prompt(cleaned)
