"""Ensure static type checks remain green."""

from __future__ import annotations

import shutil
import subprocess
import unittest
from pathlib import Path


class TypingCheckTestCase(unittest.TestCase):
    @unittest.skipUnless(shutil.which("mypy"), "mypy is not available in the execution environment")
    def test_mypy_clean(self) -> None:
        project_root = Path(__file__).resolve().parents[1]
        config = project_root / "mypy.ini"
        result = subprocess.run(
            ["mypy", "--config-file", str(config)],
            capture_output=True,
            text=True,
            cwd=project_root,
            check=False,
        )
        if result.returncode != 0:
            raise AssertionError(f"mypy failed:\n{result.stdout}\n{result.stderr}")
