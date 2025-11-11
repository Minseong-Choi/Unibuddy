# Unibuddy
A React based Chrome Extension(MadCamp Week3)

![image.png](attachment:a129de97-9852-46f8-9026-beb9acf005b9:image.png)

# 팀원 소개

이재현

최민성

한정진

# 개요

오늘도 자료조사하느라 바쁜 대학생을 위한 크롬 확장프로그램. Unibuddy!

자료 조사할 때 유용한 클리핑 기능과 딴짓할 때 유용한 미니게임을 제공합니다.

# 기능 소개

### 구글 로그인 및 클리핑 기능

---

![image.png](attachment:1cde4932-c13d-45fd-acdf-45cff9d2732d:image.png)

크롬 확장프로그램 시작 시 로그인 화면

![로그인을 누르면 등록된 사용자 즉시로그인](attachment:01d16a02-d997-4e6a-a3fa-a888926579e2:image.png)

로그인을 누르면 등록된 사용자 즉시로그인

![로그인 성공시 화면](attachment:303e7f00-0674-49d5-92fd-681e9020ccfd:image.png)

로그인 성공시 화면

![프로젝트 추가/삭제로 프로젝트별 관리](attachment:a898a9f5-5c0b-448e-b733-928589f9176a:image.png)

프로젝트 추가/삭제로 프로젝트별 관리

![프로젝트 내부 초기 화면, 태그 추가 하여 카테고리화 가능](attachment:3b1b500d-d18c-4299-9aff-2373cd4a8a97:image.png)

프로젝트 내부 초기 화면, 태그 추가 하여 카테고리화 가능

![원하는 내용을 블럭씌우면 우하단에 생성한 태그가 뜸](attachment:5c06730c-bc32-45ed-858d-997466a0e171:image.png)

원하는 내용을 블럭씌우면 우하단에 생성한 태그가 뜸

![태그를 누르면 클립 관리 창에 추가](attachment:c366a1d2-b04e-4200-9d4e-f3d07cd5d38a:image.png)

태그를 누르면 클립 관리 창에 추가

![다양한 내용 클리핑 가능](attachment:6a6968ea-49fb-4ea3-bc57-5cbef04e2a1d:image.png)

다양한 내용 클리핑 가능

![수기로 새로운 클립 추가도 가능](attachment:09a56ff5-c30f-41db-80e7-f85afcdbee66:image.png)

수기로 새로운 클립 추가도 가능

![클립 관리 창에 추가된 모습](attachment:970c24c5-e912-4a6f-9426-58870188ad1e:image.png)

클립 관리 창에 추가된 모습

![클립 태그별 필터링 기능](attachment:3388bf18-e236-43b8-9222-29beb57c107c:image.png)

클립 태그별 필터링 기능

### 미니게임 - 넙죽이 쌓기

---

![image.png](attachment:fc702414-2240-47fd-934b-636f536823a3:image.png)

![image.png](attachment:6820d3be-acf3-4f02-98d1-a8681d87691d:image.png)

제작 - Unity

WebGL로 빌드하여 확장 프로그램에서 플레이 해볼 수 있게 만들었습니다.

혼자하기: 넙죽이를 쌓는 만큼 점수를 얻습니다.

같이하기: 입장코드를 입력하여 친구와 같이 게임을 즐길 수 있습니다. 두 사람이 번갈아 넙죽이를 쌓다가 먼저 떨어뜨리는 사람이 패배합니다.

미니게임 URL https://unibuddygame.duckdns.org:8443/game/

### 미니게임 - 넙죽이 쌓기 - 시행착오

---

1. 서버가 두 클라이언트 사이에서 넙죽이의 좌표, 회전 정보를 중계하는 식으로 구현
    
    → 두 클라이언트의 물리엔진이 완벽하게 동일하게 작동하지 않는 문제 발생
    
    → 생성된 물체가 자신의 위치 정보를 주기적으로 상대 클라이언트에게 전송하는 동기화 알고리즘 추가
    
2. 유니티 에디터로 테스트할 땐 문제없다가 WebGL로 빌드하니 넙죽이가 바닥을 뚫고 지나감.
    
    → 다른 물리엔진을 사용하는 WebGL 특성 때문이라 짐작
    
    → 동적으로 Collider를 추가하는 방식에서 미리 추가한 Collider를 활성화하는 방식으로 바꿔서 해결 
    
3. 확장 프로그램 실행 시 클라이언트가 WebGL 빌드 파일을 서버에서 받아오는데 실패함.
    
    → manifest.json 파일에서 content_security_policy 수정. 게임 배포 서버의 컨텐츠를 허가함.
    
4. 서버 배포 후 게임 로드가 안 되는 문제 발생. 
    
    → https 사용 중인 메인 페이지에서 확장 프로그램이 http 사용을 시도해서 브라우저가 차단한 것이 원인
    
    → 급하게 OpenSSL로 자가 서명 인증서를 만들어 게임 배포 서버를 https로 수정함.
    
    → 하지만 유니티 스크립트에서 사용중이던 웹소켓은 자가 서명 인증서를 사용하는 https를 차단해버림.
    
    → 게임 파일은 https 서버에서 받아오고 멀티 플레이 통신은 http 서버를 사용하는 기괴한 구조 탄생.
    
    → 근데 멀티 플레이 통신도 localhost가 아니면 https 사용해야 된다고 함.
    
    → 그냥 도메인하나 만들어서 https 서버로 통일시킴
    

웹 페이지 개발

기술 스택

프론트

React

Unity - WebGL

벡엔드

Express

아쉽게도 게임에 추가 못한 포닉스

![image.png](attachment:1514ae38-997b-4a67-b641-89d48a7c3fbb:image.png)

[Ideation (1)](https://www.notion.so/Ideation-1-2a2d7b0c48b580b187a2ecbe442e4727?pvs=21)

모델링

[KakaoTalk_20250723_182451960.mp4](attachment:2790992f-fcaa-4fd0-9803-1eb1aa88195b:KakaoTalk_20250723_182451960.mp4)

![image.png](attachment:6e0d2c94-f4c8-4745-9307-9404e935b1d9:image.png)

![image.png](attachment:83406e44-42eb-4e66-8ff9-ca768aed785a:image.png)
