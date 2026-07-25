FRAMEWORK_LANGUAGE_MAP = {
    "selenium_java": "java",
    "selenium_python": "python",
    "playwright_js": "javascript",
    "playwright_ts": "typescript",
    "cypress": "javascript",
    "robot_framework": "robot",
}


def build_prompt(
    test_steps: str,
    framework: str,
    browser: str = "chrome",
    design_pattern: str = "pom",
    options: dict | None = None,
    system_prompt_override: str | None = None,
    custom_prompt: str | None = None,
) -> tuple[str, str]:
    language = FRAMEWORK_LANGUAGE_MAP.get(framework, "python")
    options = options or {}

    if system_prompt_override:
        system_prompt = system_prompt_override
    else:
        system_prompt = (
            "You are a Senior Automation Test Architect with 15+ years of experience. "
            "You write production-ready, enterprise-grade automation code. "
            "Always return ONLY the code without any markdown formatting, explanations, or code fences. "
            "The code must be complete, runnable, and follow industry best practices."
        )

    framework_display = framework.replace("_", " ").title()

    requirements = []
    if options.get("assertions", True):
        requirements.append("- Include meaningful assertions for each step")
    if options.get("comments", True):
        requirements.append("- Add clear comments explaining each section")
    if options.get("explicit_waits", True):
        requirements.append("- Use explicit waits instead of hardcoded sleeps")
    if options.get("error_handling", True):
        requirements.append("- Implement comprehensive error handling with try-catch")
    if options.get("logging"):
        requirements.append("- Add structured logging for each step")
    if options.get("screenshots"):
        requirements.append("- Capture screenshots on failure and at key checkpoints")
    if options.get("retry_logic"):
        requirements.append("- Implement retry logic for flaky operations")
    if options.get("generate_test_data"):
        requirements.append("- Generate realistic test data for the scenario")

    design_pattern_note = {
        "pom": "Use Page Object Model — create separate page classes with locators and actions",
        "screenplay": "Use Screenplay Pattern — actors, tasks, and questions",
        "keyword_driven": "Use Keyword-Driven approach — high-level keywords mapping to actions",
        "hybrid": "Use a Hybrid pattern combining POM with data-driven techniques",
    }

    user_prompt = custom_prompt or (
        f"Generate a complete, production-ready {framework_display} automation script.\n\n"
        f"Framework: {framework_display}\n"
        f"Language: {language}\n"
        f"Browser: {browser}\n"
        f"Design Pattern: {design_pattern_note.get(design_pattern, 'Use Page Object Model')}\n\n"
        f"Scenario:\n{test_steps}\n\n"
        f"Requirements:\n"
        + "\n".join(requirements)
        + "\n\n"
        "Use clean naming conventions. Make the script directly executable. "
        "Generate all necessary file structure including page objects, test files, "
        "configuration, and dependencies.\n\n"
        "IMPORTANT: Return ONLY the code. No markdown, no explanations."
    )

    return system_prompt, user_prompt


def get_file_extension(framework: str) -> str:
    ext_map = {
        "selenium_java": "java",
        "selenium_python": "py",
        "playwright_js": "js",
        "playwright_ts": "ts",
        "cypress": "js",
        "robot_framework": "robot",
    }
    return ext_map.get(framework, "txt")


def get_language(framework: str) -> str:
    return FRAMEWORK_LANGUAGE_MAP.get(framework, "python")
