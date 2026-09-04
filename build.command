#!/bin/bash
# 더블클릭하면 questions/ 폴더의 JSON 문제들을 questions.js 로 합친다.
cd "$(dirname "$0")" || exit 1

if ! command -v python3 >/dev/null 2>&1; then
  echo "python3 을 찾을 수 없습니다."
  echo "터미널에서  xcode-select --install  을 실행해 설치한 뒤 다시 시도하세요."
  exit 1
fi

python3 build.py
status=$?
echo
if [ $status -ne 0 ]; then
  echo "빌드에 실패했습니다. 위 오류를 확인하세요."
fi
echo "이 창은 닫으셔도 됩니다."
exit $status
