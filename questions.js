/* 이 파일은 build.command 가 자동으로 만듭니다. 직접 고치지 마세요.
   문제를 고치려면 questions/ 폴더의 JSON 을 고친 뒤 build.command 를 실행하세요.

   만든 시각: 2026-09-04 22:55
   문제 수: 초급 4개, 중급 4개, 고급 3개 */

const QUESTIONS = [
  {
    "level": "easy",
    "src": "easy/01-array-index.json",
    "prompt": "틀린 곳을 찾으세요",
    "lang": "C",
    "code": "int arr[5] = {1, 2, 3, 4, 5};\n\nfor (int i = 0; i <= 5; i++) {\n    printf(\"%d \", arr[i]);\n}",
    "answer": "i <= 5   →   i < 5",
    "note": "크기가 5인 배열의 인덱스는 0부터 4까지다. arr[5]는 배열 밖을 읽는다.",
    "given": {
      "label": "원하는 출력",
      "text": "1 2 3 4 5"
    },
    "bad": [
      3
    ]
  },
  {
    "level": "easy",
    "src": "easy/02-assign-vs-equal.json",
    "prompt": "조건문에서 틀린 한 글자를 찾으세요",
    "lang": "C",
    "code": "int x = 5;\n\nif (x = 10) {\n    printf(\"x is 10\\n\");\n}",
    "answer": "x = 10   →   x == 10",
    "note": "=는 대입, ==가 비교다. x에 10을 넣은 뒤 그 값 10이 참으로 취급돼 조건이 항상 성립한다.",
    "bad": [
      3
    ]
  },
  {
    "level": "easy",
    "src": "easy/03-start-index.json",
    "prompt": "20 30 40 50 만 출력하려면 i의 시작값을 어떻게 바꿔야 할까요?",
    "lang": "C++",
    "code": "int arr[5] = {10, 20, 30, 40, 50};\n\nfor (int i = 0; i < 5; i++) {\n    cout << arr[i] << \" \";\n}",
    "answer": "int i = 0   →   int i = 1",
    "note": "10은 arr[0]이다. 인덱스 1부터 시작하면 20부터 끝까지 출력된다.",
    "bad": [
      3
    ]
  },
  {
    "level": "easy",
    "src": "easy/04-post-increment.json",
    "prompt": "출력 결과를 예측하세요",
    "lang": "C++",
    "code": "int a = 3;\nint b = a++;\n\ncout << a << \" \" << b;",
    "answer": "4 3",
    "note": "후위 증가 a++는 원래 값을 먼저 넘겨주고 나서 증가한다. b에는 증가 전 값 3이 들어간다.",
    "bad": [
      2
    ]
  },
  {
    "level": "medium",
    "src": "medium/01-star-pattern.json",
    "prompt": "틀린 곳을 찾으세요",
    "lang": "C",
    "code": "for (int i = 0; i < 3; i++) {\n    for (int j = 0; j <= i; i++) {\n        printf(\"*\");\n    }\n    printf(\"\\n\");\n}",
    "answer": "i++   →   j++",
    "note": "안쪽 반복문이 j 대신 i를 증가시킨다. j가 그대로라 조건 j <= i가 계속 참이 되어 끝나지 않는다.",
    "given": {
      "label": "원하는 출력",
      "text": "*\n**\n***"
    },
    "bad": [
      2
    ]
  },
  {
    "level": "medium",
    "src": "medium/02-python-sum.json",
    "prompt": "틀린 곳을 찾으세요",
    "lang": "Python",
    "code": "n = int(input())\nans = 0\nfor i in range(n):\n    ans = ans + n\nprint(ans)",
    "answer": "ans = ans + n   →   ans = ans + i + 1",
    "note": "range(n)은 0부터 n-1까지 돈다. 지금은 n을 n번 더해서 n × n 이 나온다.",
    "given": {
      "label": "하는 일",
      "text": "n을 입력받아 1부터 n까지 더한 값을 출력"
    },
    "bad": [
      4
    ]
  },
  {
    "level": "medium",
    "src": "medium/03-bit-precedence.json",
    "prompt": "틀린 곳을 찾으세요",
    "lang": "C++",
    "code": "bool isSet(int n, int i) {\n    if (n & (1 << i) == 1) return true;\n    else return false;\n}",
    "answer": "n & (1 << i) == 1   →   n & (1 << i)",
    "note": "==가 &보다 먼저 계산돼서 (1 << i) == 1 이 먼저 처리된다. i가 0일 때만 우연히 맞는다.",
    "given": {
      "label": "하는 일",
      "text": "n의 i번째 비트가 켜져 있는지 확인"
    },
    "bad": [
      2
    ]
  },
  {
    "level": "medium",
    "src": "medium/04-vector-erase.json",
    "prompt": "출력 결과를 예측하세요",
    "lang": "C++",
    "code": "vector<int> a = {1, 2, 3, 4, 5, 6};\n\nfor (auto it = a.begin(); it != a.end();) {\n    if (*it % 2 == 0) {\n        it = a.erase(it);\n    } else {\n        ++it;\n    }\n}\n\nfor (int x : a) {\n    cout << x << ' ';\n}",
    "answer": "1 3 5",
    "note": "erase는 지운 자리의 다음 원소를 가리키는 반복자를 돌려준다. 그걸 다시 it에 넣었으니 건너뛰는 원소 없이 짝수만 지워진다.",
    "bad": [
      5
    ]
  },
  {
    "level": "hard",
    "src": "hard/01-hanoi-base-case.json",
    "prompt": "틀린 곳을 찾으세요",
    "lang": "Python",
    "code": "def hanoi(n, source, target, auxiliary, moves):\n    if n == 1:\n        return\n    hanoi(n - 1, source, auxiliary, target, moves)\n    moves.append(f\"{source} -> {target}\")\n    hanoi(n - 1, auxiliary, target, source, moves)\n\nn = int(input())\nmoves = []\nhanoi(n, 'A', 'C', 'B', moves)\n\nprint(len(moves))\nfor move in moves:\n    print(move)",
    "answer": "if n == 1:   →   if n == 0:",
    "note": "원판이 1개일 때도 한 번은 옮겨야 한다. 지금은 그냥 돌아가버려서 7개가 아니라 3개만 나온다.",
    "given": {
      "label": "N = 3 일 때 원하는 출력의 첫 줄",
      "text": "7"
    },
    "bad": [
      2,
      3
    ]
  },
  {
    "level": "hard",
    "src": "hard/02-knapsack-unbounded.json",
    "prompt": "출력 결과를 예측하세요",
    "lang": "C++",
    "code": "int capacity = 17;\nvector<int> weight = {4, 7, 9};\nvector<int> value  = {7, 13, 16};\n\nvector<int> dp(capacity + 1, 0);\n\nfor (int i = 0; i < 3; ++i) {\n    for (int w = weight[i]; w <= capacity; ++w) {\n        dp[w] = max(dp[w], dp[w - weight[i]] + value[i]);\n    }\n}\n\ncout << dp[capacity] << '\\n';",
    "answer": "30",
    "note": "안쪽 루프가 오름차순이라 같은 물건을 여러 번 담게 된다. 4kg 두 개 + 9kg = 17kg, 7+7+16 = 30. 한 번씩만 담았다면 29다.",
    "bad": [
      8
    ]
  },
  {
    "level": "hard",
    "src": "hard/03-lowbit.json",
    "prompt": "출력 결과를 예측하세요",
    "lang": "C++",
    "code": "int x = 63;\nwhile (x > 0) {\n    cout << x << '\\n';\n    x -= (x & -x);\n}",
    "answer": "63 62 60 56 48 32   (한 줄에 하나씩, 6줄)",
    "note": "x & -x 는 가장 낮은 켜진 비트를 뽑아낸다. 63은 111111 이므로 켜진 비트를 아래부터 하나씩 끄면 6번 만에 0이 된다.",
    "bad": [
      4
    ]
  }
];
