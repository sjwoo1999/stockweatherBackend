// src/disclosure/interfaces/disclosure-item.interface.ts

export interface DisclosureItem {
  rcept_no: string; // 접수번호
  corp_cls: string; // 법인구분 (Y: 유가증권, K: 코스닥, N: 코넥스)
  corp_code: string; // 고유번호
  corp_name: string; // 회사명
  report_nm: string; // 보고서명
  flr_nm: string; // 제출인명
  rcept_dt: string; // 접수일자 (YYYYMMDD)
  rmk: string; // 비고 (연결, 개별 등)
  // DART list.json API 응답에 포함될 수 있는 필드를 추가합니다.
  reprt_code: string; // 보고서 코드 (예: 11011 for 사업보고서)
  bsns_year: string; // 사업 연도 (YYYY)
  // AI 분석을 위해 필요한 추가적인 필드 (선택 사항)
  doc_url?: string; // 공시 문서 원본 URL (실제로는 DART API 응답에 직접 포함되지 않을 수 있음)
  doc_title?: string;
  doc_content?: string;
}
