---
title: "MLflow run이 끝났는데 RUNNING으로 남는 문제 (Windows cp949)"
description: "학습은 정상 종료됐는데 MLflow UI에서 run이 계속 RUNNING이었습니다. 원인은 Windows 콘솔 인코딩과 이모지 출력이었습니다."
pubDate: 2026-10-19
category: troubleshooting
authors: [park-sihyun]
tags: [MLflow, Python, Windows]
draft: true
---

> 작성자 확인 전 초안이에요. 재현 환경의 버전과 오류 원문을 채운 뒤 공개해 주세요.

## 증상

Windows에서 학습 스크립트를 돌리면 학습과 결과 저장은 끝까지 되는데, MLflow UI에서는 run 상태가 계속 `RUNNING`이었어요. 지표와 아티팩트는 다 올라가 있어서 처음에는 UI 갱신 문제라고 생각했어요.

## 원인

`mlflow.end_run()`이 run을 닫으면서 콘솔에 이모지가 들어간 안내 문구를 출력해요. 한국어 Windows 콘솔의 기본 인코딩은 cp949라서 이 문자를 인코딩하지 못하고 `UnicodeEncodeError`가 나요.

이 예외 때문에 run을 `FINISHED`로 바꾸는 단계까지 가지 못하고 프로세스가 끝났어요. 그래서 지표는 남고 상태만 `RUNNING`으로 남았던 거예요.

## 해결

파이썬을 UTF-8 모드로 실행해요.

```bash
python -X utf8 ml/training/train_classifier.py --config ...
```

`PYTHONIOENCODING=utf-8` 환경 변수로도 풀 수 있어요. 하지만 격리 모드(`-I`)로 실행하면 `PYTHON*` 환경 변수를 모두 무시하므로 효과가 없어요. 우리는 내려받은 데이터를 다룰 때 `-I`를 쓰고 있어서 `-X utf8`로 통일했어요.

## 다음에 같은 일을 막으려면

- 학습 명령 문서에 `-X utf8`을 기본으로 적어요.
- 이미 `RUNNING`으로 남은 run은 결과 파일을 기준으로 다시 기록하고, 다시 기록했다는 태그를 붙여 구분해요.
