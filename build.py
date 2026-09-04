#!/usr/bin/env python3
"""questions/ 폴더의 JSON 문제들을 questions.js 하나로 합칩니다.

브라우저는 file:// 로 열린 페이지에서 JSON 파일을 직접 읽지 못합니다(보안 정책).
그래서 문제는 JSON 으로 관리하되, 화면이 읽을 수 있는 형태로 한 번 합쳐 줍니다.

    python3 build.py        (또는 build.command 더블클릭)
"""

import json
import io
import os
import sys
from datetime import datetime

LEVELS = ["easy", "medium", "hard"]
LEVEL_NAME = {"easy": "초급", "medium": "중급", "hard": "고급"}

ROOT = os.path.dirname(os.path.abspath(__file__))
SRC_DIR = os.path.join(ROOT, "questions")
OUT = os.path.join(ROOT, "questions.js")

KNOWN_KEYS = {"prompt", "lang", "input", "output", "code", "bad", "answer", "note"}
REQUIRED = ["prompt", "code", "answer"]

errors = []
warnings = []


def fail(where, msg):
    errors.append("%s\n      %s" % (where, msg))


def warn(where, msg):
    warnings.append("%s — %s" % (where, msg))


def as_lines(value, where, field):
    """문자열이든 문자열 배열이든 받아서 한 덩어리 문자열로 만듭니다."""
    if isinstance(value, list):
        for line in value:
            if not isinstance(line, str):
                fail(where, "%s 의 줄은 전부 문자열이어야 합니다 (%r)" % (field, line))
                return ""
        return "\n".join(value)
    if isinstance(value, str):
        return value
    fail(where, "%s 는 문자열이거나 문자열 배열이어야 합니다" % field)
    return ""


def load_one(level, filename):
    path = os.path.join(SRC_DIR, level, filename)
    where = "questions/%s/%s" % (level, filename)

    try:
        with io.open(path, encoding="utf-8") as f:
            data = json.load(f)
    except json.JSONDecodeError as e:
        fail(where, "JSON 형식이 잘못되었습니다 — %d번째 줄 %d번째 글자: %s"
             % (e.lineno, e.colno, e.msg))
        return None
    except UnicodeDecodeError:
        fail(where, "UTF-8 로 저장된 파일이 아닙니다")
        return None

    if not isinstance(data, dict):
        fail(where, "파일 전체가 { } 하나여야 합니다")
        return None

    for key in REQUIRED:
        if key not in data:
            fail(where, '"%s" 항목이 빠졌습니다' % key)
    for key in data:
        if key not in KNOWN_KEYS:
            warn(where, '"%s" 는 쓰이지 않는 항목입니다 (오타일까요?)' % key)
    if errors:
        return None

    code = as_lines(data["code"], where, "code")
    lines = code.split("\n")

    q = {
        "level": level,
        "src": "%s/%s" % (level, filename),
        "prompt": data["prompt"],
        "lang": data.get("lang", ""),
        "code": code,
        "answer": data["answer"],
        "note": data.get("note", ""),
    }

    if "given" in data:
        fail(where, "given 은 더 이상 쓰지 않습니다. "
                    'input 과 output 으로 나눠 적어 주세요. 예) "output": ["1 2 3"]')

    for field in ("input", "output"):
        if data.get(field):
            q[field] = as_lines(data[field], where, field)

    bad = data.get("bad")
    if bad:
        if not isinstance(bad, list):
            fail(where, "bad 는 줄 번호 배열이어야 합니다. 예) [3]")
        else:
            for n in bad:
                if not isinstance(n, int) or n < 1 or n > len(lines):
                    fail(where, "bad 의 줄 번호 %r 가 범위를 벗어났습니다 "
                                "(이 문제의 코드는 %d줄입니다. 빈 줄도 셉니다)"
                         % (n, len(lines)))
            q["bad"] = bad

    if not data.get("note"):
        warn(where, "note(한 줄 설명)가 비어 있습니다")

    return q


def main():
    if not os.path.isdir(SRC_DIR):
        print("questions/ 폴더가 없습니다.")
        return 1

    for name in sorted(os.listdir(SRC_DIR)):
        p = os.path.join(SRC_DIR, name)
        if os.path.isdir(p) and name not in LEVELS and not name.startswith("."):
            warn("questions/" + name, "난이도 폴더가 아니어서 건너뜁니다 "
                                      "(쓸 수 있는 폴더: %s)" % ", ".join(LEVELS))

    out = []
    counts = {}
    for level in LEVELS:
        d = os.path.join(SRC_DIR, level)
        if not os.path.isdir(d):
            warn("questions/" + level, "폴더가 없습니다")
            counts[level] = 0
            continue
        files = sorted(f for f in os.listdir(d)
                       if f.endswith(".json") and not f.startswith("."))
        counts[level] = len(files)
        if not files:
            warn("questions/" + level, "문제가 하나도 없습니다")
        for f in files:
            q = load_one(level, f)
            if q:
                out.append(q)

    for w in warnings:
        print("  알림   " + w)

    if errors:
        print()
        for e in errors:
            print("  오류   " + e)
        print("\n오류가 %d건 있어서 questions.js 를 만들지 않았습니다. "
              "위 파일을 고치고 다시 실행해 주세요." % len(errors))
        return 1

    header = (
        "/* 이 파일은 build.command 가 자동으로 만듭니다. 직접 고치지 말아 주세요.\n"
        "   문제를 고치려면 questions/ 폴더의 JSON 을 고친 뒤 build.command 를 실행해 주세요.\n"
        "\n"
        "   만든 시각: %s\n"
        "   문제 수: %s */\n\n"
    ) % (
        datetime.now().strftime("%Y-%m-%d %H:%M"),
        ", ".join("%s %d개" % (LEVEL_NAME[l], counts.get(l, 0)) for l in LEVELS),
    )

    body = json.dumps(out, ensure_ascii=False, indent=2)
    with io.open(OUT, "w", encoding="utf-8") as f:
        f.write(header + "const QUESTIONS = " + body + ";\n")

    if warnings:
        print()
    for level in LEVELS:
        print("  %s   %d개" % (LEVEL_NAME[level], counts.get(level, 0)))
    print("\nquestions.js 를 새로 만들었습니다. 총 %d문제." % len(out))
    print("브라우저에서 index.html 을 새로고침하면 반영됩니다.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
