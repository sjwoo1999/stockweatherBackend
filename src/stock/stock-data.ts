// src/stock/stock-data.ts

export interface StockMapping {
    primaryName: string; // 대표 종목명 (예: '카카오')
    searchKeywords: string[]; // 사용자가 이 종목을 검색할 때 사용될 키워드 목록 (소문자 변환 권장)
  }
  
  /**
   * 한국인이 많이 검색할 만한 주요 종목 및 테마에 대한 매핑 데이터입니다.
   * MVP 단계에서는 약 50개 종목에 대해 각 10개 내외의 키워드로 구성됩니다.
   * 이 데이터는 수동으로 관리되며, 필요에 따라 추가/수정 후 재배포해야 합니다.
   * (향후 DB 연결 또는 AI 기반 자동 업데이트로 확장 가능)
   */
  export const stockMappings: StockMapping[] = [
    // --- IT / 플랫폼 ---
    {
      primaryName: '카카오',
      searchKeywords: [
        '카카오', '카카오톡', '카뱅', '카카오뱅크', '카카오페이', '카카오게임즈',
        '다음', '다음카카오', '멜론', '선물하기', '이모티콘', '모빌리티', '택시'
      ],
    },
    {
      primaryName: '네이버',
      searchKeywords: [
        '네이버', 'Naver', '라인', '웹툰', '쇼핑', '검색', '스마트스토어',
        '지식인', '블로그', '카페', '클로바', '스노우'
      ],
    },
    // --- 반도체 / IT하드웨어 ---
    {
      primaryName: '삼성전자',
      searchKeywords: [
        '삼성전자', '삼전', '삼성', '갤', '갤럭시', '반도체', '파운드리', 'D램',
        '낸드', '스마트폰', '가전', 'AI반도체', 'HBM'
      ],
    },
    {
      primaryName: 'SK하이닉스',
      searchKeywords: [
        'SK하이닉스', '하이닉스', 'SK Hynix', 'HBM', '메모리', '반도체', 'D램', '낸드플래시'
      ],
    },
    {
      primaryName: 'LG전자',
      searchKeywords: [
        'LG전자', '엘지전자', 'LG', '가전', 'TV', '냉장고', '세탁기', '그램', '디오스', '휘센'
      ],
    },
    // --- 자동차 ---
    {
      primaryName: '현대차',
      searchKeywords: [
        '현대차', '현대자동차', '현차', '아이오닉', '제네시스', '전기차', '수소차', '기아'
      ],
    },
    {
      primaryName: '기아',
      searchKeywords: [
        '기아', '기아차', 'EV6', '셀토스', '스포티지', '레이'
      ],
    },
    // --- 2차 전지 ---
    {
      primaryName: 'LG에너지솔루션',
      searchKeywords: [
        'LG에너지솔루션', '엘지에너지솔루션', 'LG엔솔', '배터리', '이차전지', '전기차배터리'
      ],
    },
    {
      primaryName: '삼성SDI',
      searchKeywords: [
        '삼성SDI', 'SDI', '배터리', '이차전지', '전기차배터리', 'ESS'
      ],
    },
    {
      primaryName: 'SK온',
      searchKeywords: [
        'SK온', 'SK On', '배터리', '이차전지'
      ],
    },
    {
      primaryName: '에코프로비엠',
      searchKeywords: [
        '에코프로비엠', '에코프로BM', '에코프로', '양극재', '이차전지'
      ],
    },
    {
      primaryName: '포스코퓨처엠',
      searchKeywords: [
        '포스코퓨처엠', '포퓨', '퓨처엠', '양극재', '음극재', '이차전지'
      ],
    },
    // --- 바이오 / 제약 ---
    {
      primaryName: '삼성바이오로직스',
      searchKeywords: [
        '삼성바이오로직스', '삼바', '바이오로직스', 'CDMO', '바이오'
      ],
    },
    {
      primaryName: '셀트리온',
      searchKeywords: [
        '셀트리온', '바이오시밀러', '제약', '바이오'
      ],
    },
    // --- 금융 ---
    {
      primaryName: 'KB금융',
      searchKeywords: [
        'KB금융', 'KB', '국민은행', '은행', '금융지주'
      ],
    },
    {
      primaryName: '신한지주',
      searchKeywords: [
        '신한지주', '신한은행', '신한금융', '은행', '금융지주'
      ],
    },
    // --- 기타 주요 대기업 ---
    {
      primaryName: 'POSCO홀딩스',
      searchKeywords: [
        'POSCO홀딩스', '포스코홀딩스', '포스코', '철강', '리튬'
      ],
    },
    {
      primaryName: '현대모비스',
      searchKeywords: [
        '현대모비스', '모비스', '현대차그룹'
      ],
    },
    {
      primaryName: 'LG화학',
      searchKeywords: [
        'LG화학', '엘지화학', '화학', '배터리소재'
      ],
    },
    {
      primaryName: 'KT&G',
      searchKeywords: [
        'KT&G', '케이티앤지', '담배', '홍삼', '정관장'
      ],
    },
    // --- 테마성 키워드 (종목 코드는 없지만 관련 뉴스 검색) ---
    {
      primaryName: 'AI',
      searchKeywords: [
        '인공지능', 'AI', 'GPT', '거대언어모델', 'LLM', 'AI 반도체', '챗봇', '로봇'
      ],
    },
    {
      primaryName: '2차 전지',
      searchKeywords: [
        '2차 전지', '이차전지', '배터리', '양극재', '음극재', '분리막', '전해액', '리튬이온', '전고체 배터리'
      ],
    },
    {
      primaryName: '메타버스',
      searchKeywords: [
        '메타버스', 'VR', 'AR', '가상현실', '확장현실', '가상화폐', 'NFT'
      ],
    },
    {
      primaryName: '로봇',
      searchKeywords: [
        '로봇', '로봇산업', '로봇주', '휴머노이드', '산업용 로봇', '협동 로봇'
      ],
    },
    {
      primaryName: '자율주행',
      searchKeywords: [
        '자율주행', '자율주행차', 'ADAS', '레벨3', '레벨4', '자율주행기술'
      ],
    },
    // ... (총 50개 종목/테마를 목표로 추가)
  ];