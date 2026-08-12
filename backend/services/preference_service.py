"""
Accessibility-mode presets.

The backend is the single source of truth for what each mode turns on. The
frontend applies whatever preferences the API returns rather than keeping its
own copy of this table.
"""

from models.user import UserPreference

MODE_DEFAULTS: dict[str, dict] = {
    "visually-impaired": {
        "font_size": "x-large",
        "high_contrast": True,
        "screen_reader_optimized": True,
        "voice_navigation": True,
        "text_to_speech": True,
        "voice_commands": True,
        "large_touch_targets": True,
        "audio_feedback": True,
        "magnifier_ready": False,
        "continuous_listening": False,
    },
    "low-vision": {
        "theme": "dark",
        "font_size": "large",
        "high_contrast": True,
        "screen_reader_optimized": False,
        "voice_navigation": True,
        "text_to_speech": True,
        "voice_commands": True,
        "large_touch_targets": False,
        "audio_feedback": False,
        "magnifier_ready": True,
        "continuous_listening": False,
    },
    "standard": {
        "theme": "system",
        "font_size": "normal",
        "high_contrast": False,
        "screen_reader_optimized": False,
        "voice_navigation": False,
        "text_to_speech": False,
        "voice_commands": False,
        "large_touch_targets": False,
        "audio_feedback": False,
        "magnifier_ready": False,
        "continuous_listening": False,
    },
}


def apply_mode_defaults(preferences: UserPreference, mode: str) -> UserPreference:
    """Overwrite the accessibility-related columns with the preset for `mode`."""
    for column, value in MODE_DEFAULTS.get(mode, MODE_DEFAULTS["standard"]).items():
        setattr(preferences, column, value)
    return preferences
