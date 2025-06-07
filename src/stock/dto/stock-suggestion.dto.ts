export interface StockSuggestionDto {
  name: string;
  code: string; // DART 고유번호 (corp_code)
  stockCode?: string; // 종목 코드 (상장사만 존재, 없을 수 있음)
}
