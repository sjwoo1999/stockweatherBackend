// src/disclosure/disclosure.service.ts

import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import * as AdmZip from 'adm-zip';
import { parseStringPromise } from 'xml2js';
import * as iconv from 'iconv-lite';
import { format, subDays } from 'date-fns'; // date-fns 추가

// 새로 생성된 인터페이스 파일에서 임포트
import { DisclosureItem } from './interfaces/disclosure-item.interface';

// DART 회사 정보 인터페이스
export interface DartCompanyInfo {
  corp_code: string;
  corp_name: string;
  corp_eng_name: string | null;
  stock_code: string | null;
  modify_date: string;
}

@Injectable()
export class DisclosureService implements OnModuleInit {
  private readonly logger = new Logger(DisclosureService.name);
  private dartApiKey: string | undefined;
  private corpCodeList: DartCompanyInfo[] = [];
  private readonly TEMP_ZIP_FILE_NAME = 'temp_corpcode.zip';
  private readonly DECOMPRESSED_XML_FILE_NAME = 'CORPCODE.xml';
  private readonly disclosureDirPath: string;

  constructor(private configService: ConfigService) {
    this.dartApiKey = this.configService.get<string>('DART_OPENAPI_KEY');
    if (!this.dartApiKey) {
      this.logger.error('DART_OPENAPI_KEY 환경 변수가 설정되지 않았습니다.');
    } else {
      this.logger.log(
        `[${DisclosureService.name}] 초기화 - DART_OPENAPI_KEY 로드됨: ${!!this.dartApiKey}`,
      );
    }

    this.disclosureDirPath = path.join(process.cwd(), 'disclosure_temp');
    if (!fs.existsSync(this.disclosureDirPath)) {
      this.logger.log(
        `[${DisclosureService.name}] ${this.disclosureDirPath} 디렉토리가 없어 생성합니다.`,
      );
      fs.mkdirSync(this.disclosureDirPath, { recursive: true });
    }
  }

  async onModuleInit() {
    await this.loadCorpCodeList();
  }

  /**
   * DART API로부터 회사 고유번호 목록을 로드하고 파싱합니다.
   * ZIP 파일 다운로드, 압축 해제, XML 파싱 및 데이터 저장 과정을 포함합니다.
   */
  private async loadCorpCodeList(): Promise<void> {
    const url = `https://opendart.fss.or.kr/api/corpCode.xml?crtfc_key=${this.dartApiKey}`;
    const tempZipFilePath = path.join(
      this.disclosureDirPath,
      this.TEMP_ZIP_FILE_NAME,
    );
    const decompressedFilePath = path.join(
      this.disclosureDirPath,
      this.DECOMPRESSED_XML_FILE_NAME,
    );

    this.logger.log(
      `[${DisclosureService.name}] DART 회사 고유번호 목록 로드 시작...`,
    );

    try {
      const response = await axios.get(url, { responseType: 'arraybuffer' });
      const contentType = response.headers['content-type'];
      this.logger.debug(
        `[${DisclosureService.name}] DART corpCode.xml 응답 Content-Type: ${contentType}`,
      );

      if (
        contentType &&
        contentType.includes('application/x-msdownload') &&
        response.data
      ) {
        this.logger.log(
          `[${DisclosureService.name}] DART API가 ZIP 파일을 반환했습니다. 임시 ZIP 파일에 저장 후 압축 해제합니다.`,
        );

        fs.writeFileSync(tempZipFilePath, response.data);
        this.logger.debug(
          `[${DisclosureService.name}] DART corpCode.xml ZIP 파일을 ${tempZipFilePath}에 저장했습니다.`,
        );

        const zip = new AdmZip(tempZipFilePath);
        zip.extractAllTo(this.disclosureDirPath, true);

        this.logger.debug(
          `[${DisclosureService.name}] ZIP 파일 ${tempZipFilePath} 압축 해제 완료.`,
        );

        fs.unlinkSync(tempZipFilePath);
        this.logger.debug(
          `[${DisclosureService.name}] 임시 ZIP 파일 ${tempZipFilePath} 삭제 완료.`,
        );

        const xmlBuffer = fs.readFileSync(decompressedFilePath);

        // DART 개발 가이드에 'UTF-8'로 명시되어 있으므로 UTF-8로 디코딩
        const data = iconv.decode(xmlBuffer, 'UTF-8');
        this.logger.debug(
          `[${DisclosureService.name}] 해제된 CORPCODE.xml raw XML (첫 500자): ${data.substring(0, 500)}`,
        );

        const result = await parseStringPromise(data);

        if (result && result.result && Array.isArray(result.result.list)) {
          // xml2js로 파싱된 raw item 구조 확인 (샘플)
          result.result.list.slice(0, 5).forEach((item: any, index: number) => {
            this.logger.debug(
              `[${DisclosureService.name}] XML 파싱 raw item 샘플 ${index}: ${JSON.stringify(item)}`,
            );
          });

          this.corpCodeList = result.result.list
            .map((item: any) => {
              const corpCode =
                item.corp_code && item.corp_code[0]
                  ? String(item.corp_code[0]).trim()
                  : '';
              const corpName =
                item.corp_name && item.corp_name[0]
                  ? String(item.corp_name[0]).trim()
                  : '';
              const corpEngName =
                item.corp_eng_name && item.corp_eng_name[0]
                  ? String(item.corp_eng_name[0]).trim()
                  : null;
              const stockCode =
                item.stock_code &&
                item.stock_code[0] &&
                String(item.stock_code[0]).trim() !== ''
                  ? String(item.stock_code[0]).trim()
                  : null;
              const modifyDate =
                item.modify_date && item.modify_date[0]
                  ? String(item.modify_date[0]).trim()
                  : '';

              if (!corpCode) {
                this.logger.warn(
                  `[${DisclosureService.name}] 파싱된 회사 정보에서 corp_code가 누락/빈 값입니다. (회사명: ${corpName})`,
                );
              }

              return {
                corp_code: corpCode,
                corp_name: corpName,
                corp_eng_name: corpEngName,
                stock_code: stockCode,
                modify_date: modifyDate,
              };
            })
            .filter(
              (company) => company.corp_code && company.corp_code.trim() !== '',
            ); // corp_code가 빈 문자열이거나 falsy한 값인 항목 필터링

          this.logger.log(
            `[${DisclosureService.name}] DART 회사 고유번호 목록 ${this.corpCodeList.length}개 로드 완료.`,
          );

          // 최종 corpCodeList에 저장된 항목 샘플 확인
          if (this.corpCodeList.length > 0) {
            this.logger.debug(
              `[${DisclosureService.name}] 로드된 회사 고유번호 목록 샘플 (첫 5개):`,
            );
            this.corpCodeList.slice(0, 5).forEach((c) => {
              this.logger.debug(
                `  회사명: ${c.corp_name}, 고유번호: ${c.corp_code}, 종목코드: ${c.stock_code}`,
              );
            });
          }
        } else {
          this.logger.error(
            `[${DisclosureService.name}] DART corpCode.xml 파싱 실패: 예상치 못한 XML 구조입니다.`,
          );
          this.corpCodeList = [];
        }

        fs.unlinkSync(decompressedFilePath);
        this.logger.debug(
          `[${DisclosureService.name}] 해제된 XML 파일 ${decompressedFilePath} 삭제 완료.`,
        );
      } else {
        this.logger.error(
          `[${DisclosureService.name}] DART API 응답이 예상한 ZIP 파일이 아니거나 데이터가 없습니다. Content-Type: ${contentType}`,
        );
        this.corpCodeList = [];
      }
    } catch (error) {
      this.logger.error(
        `[${DisclosureService.name}] DART 회사 고유번호 목록 로드 중 오류 발생:`,
        error.message,
      );
      this.corpCodeList = [];
      if (fs.existsSync(tempZipFilePath)) {
        fs.unlinkSync(tempZipFilePath);
        this.logger.debug(
          `[${DisclosureService.name}] 오류 발생으로 인해 임시 ZIP 파일 ${tempZipFilePath} 삭제 완료.`,
        );
      }
      if (fs.existsSync(decompressedFilePath)) {
        fs.unlinkSync(decompressedFilePath);
        this.logger.debug(
          `[${DisclosureService.name}] 오류 발생으로 인해 해제된 XML 파일 ${decompressedFilePath} 삭제 완료.`,
        );
      }
    }
  }

  /**
   * 회사명 또는 종목코드로 회사 정보를 검색합니다.
   * @param query 검색어
   * @returns 검색된 회사 정보 배열 (DartCompanyInfo[])
   */
  searchCompaniesByName(query: string): DartCompanyInfo[] {
    const lowerCaseQuery = query.toLowerCase();
    this.logger.debug(
      `[${DisclosureService.name}] searchCompaniesByName 호출됨. 쿼리: "${query}", 소문자 쿼리: "${lowerCaseQuery}"`,
    );

    if (this.corpCodeList.length === 0) {
      this.logger.warn(
        `[${DisclosureService.name}] corpCodeList가 비어있습니다. 회사 정보 로드에 실패했을 수 있습니다. 검색 결과: 0개`,
      );
      return [];
    }

    const filteredCompanies = this.corpCodeList.filter((company) => {
      const companyName = company.corp_name
        ? company.corp_name.toLowerCase()
        : '';
      const stockCode = company.stock_code
        ? company.stock_code.toLowerCase()
        : '';

      const nameMatches = companyName.includes(lowerCaseQuery);
      const stockCodeMatches = stockCode.includes(lowerCaseQuery);

      const isCorpCodeValid =
        company.corp_code && company.corp_code.trim() !== '';

      if ((nameMatches || stockCodeMatches) && !isCorpCodeValid) {
        this.logger.warn(
          `[${DisclosureService.name}] 검색 결과에 유효한 corp_code가 없는 회사 포함: ${company.corp_name}`,
        );
      }

      return (nameMatches || stockCodeMatches) && isCorpCodeValid;
    });

    this.logger.debug(
      `[${DisclosureService.name}] 쿼리 "${query}"에 대한 검색 결과: ${filteredCompanies.length}개`,
    );
    return filteredCompanies;
  }

  /**
   * 고유번호로 회사 정보를 조회합니다.
   * @param corpCode 회사 고유번호
   * @returns 회사 정보 (DartCompanyInfo) 또는 null
   */
  getCorpInfoByCode(corpCode: string): DartCompanyInfo | null {
    if (this.corpCodeList.length === 0) {
      this.logger.warn(
        `[${DisclosureService.name}] corpCodeList가 비어있어 corpCode ${corpCode} 검색 실패.`,
      );
      return null;
    }
    const company = this.corpCodeList.find((c) => c.corp_code === corpCode);
    if (!company) {
      this.logger.warn(
        `[${DisclosureService.name}] corpCode ${corpCode}에 해당하는 회사 정보를 찾을 수 없습니다.`,
      );
    }
    // 반환 전 corp_code 유효성 다시 확인
    if (company && (!company.corp_code || company.corp_code.trim() === '')) {
      this.logger.warn(
        `[${DisclosureService.name}] getCorpInfoByCode: corpCode ${corpCode}에 대한 회사 정보는 있으나, corp_code가 유효하지 않습니다.`,
      );
      return null;
    }
    return company || null;
  }

  /**
   * 특정 회사에 대한 공시 목록을 DART API로부터 가져옵니다.
   * @param corpCode 회사 고유번호
   * @param bgnDt 시작일자 (YYYYMMDD)
   * @param endDt 종료일자 (YYYYMMDD)
   * @param page 페이지 번호
   * @param pageSize 페이지당 건수
   * @returns 공시 목록 배열 (DisclosureItem[] 타입)
   */
  async searchDisclosures(
    corpCode: string,
    bgnDt: string,
    endDt: string,
    page: number = 1,
    pageSize: number = 100,
  ): Promise<DisclosureItem[]> {
    const url = `https://opendart.fss.or.kr/api/list.json?crtfc_key=${this.dartApiKey}&corp_code=${corpCode}&bgn_de=${bgnDt}&end_de=${endDt}&page_no=${page}&page_set=${pageSize}`;
    this.logger.log(`[${DisclosureService.name}] 공시 검색 요청: ${url}`);

    try {
      const response = await axios.get(url);
      if (response.data.status === '000') {
        return response.data.list.map((item: any) => ({
          rcept_no: item.rcept_no,
          corp_cls: item.corp_cls,
          corp_code: item.corp_code,
          corp_name: item.corp_name,
          report_nm: item.report_nm,
          flr_nm: item.flr_nm,
          rcept_dt: item.rcept_dt,
          rmk: item.rmk,
          reprt_code: item.reprt_code,
          bsns_year: item.bsns_year,
        }));
      } else {
        this.logger.error(
          `[${DisclosureService.name}] DART 공시 검색 API 오류: ${response.data.message} (status: ${response.data.status})`,
        );
        return [];
      }
    } catch (error) {
      this.logger.error(
        `[${DisclosureService.name}] DART 공시 검색 중 오류 발생:`,
        error.message,
      );
      return [];
    }
  }

  /**
   * 특정 회사에 대한 최신 공시 목록을 가져옵니다.
   * @param corpCode 회사 고유번호
   * @param count 가져올 공시 개수
   * @returns 최신 공시 목록 배열 (DisclosureItem[] 타입)
   */
  async getRecentDisclosures(
    corpCode: string,
    count: number = 5,
  ): Promise<DisclosureItem[]> {
    const today = new Date();
    const threeMonthsAgo = subDays(today, 90); // 일반적으로 3개월 정도의 기간을 조회합니다. (필요에 따라 조절)

    const bgnDt = format(threeMonthsAgo, 'yyyyMMdd');
    const endDt = format(today, 'yyyyMMdd');

    this.logger.log(
      `[${DisclosureService.name}] getRecentDisclosures 호출: corpCode=${corpCode}, 기간=${bgnDt}~${endDt}, 요청 개수=${count}`,
    );

    try {
      // DART API는 정확히 'count' 개를 반환하지 않을 수 있으므로,
      // 일단 많은 수를 요청하고 클라이언트에서 필터링하거나,
      // API가 지원하는 방식으로 페이징을 통해 더 가져올 수 있습니다.
      // 여기서는 일단 한 페이지에 최신 공시를 충분히 담을 수 있도록 pageSize를 크게 잡습니다.
      const disclosures = await this.searchDisclosures(
        corpCode,
        bgnDt,
        endDt,
        1,
        200,
      ); // 넉넉하게 200개 요청

      // 접수일자(rcept_dt)를 기준으로 내림차순 정렬하여 최신 공시를 가져옵니다.
      const sortedDisclosures = disclosures.sort((a, b) => {
        return b.rcept_dt.localeCompare(a.rcept_dt);
      });

      // 요청한 개수만큼 잘라 반환합니다.
      return sortedDisclosures.slice(0, count);
    } catch (error) {
      this.logger.error(
        `[${DisclosureService.name}] 최신 공시를 가져오는 중 오류 발생 (corpCode: ${corpCode}):`,
        error.message,
      );
      return [];
    }
  }

  /**
   * 공시 서류 원본 파일을 가져옵니다.
   * @param rceptNo 접수번호
   * @returns 공시 내용 (string) 또는 null
   */
  async fetchDisclosureContent(rceptNo: string): Promise<string | null> {
    const url = `https://opendart.fss.or.kr/api/document.xml?crtfc_key=${this.dartApiKey}&rcept_no=${rceptNo}`;
    this.logger.log(`[${DisclosureService.name}] 공시 내용 요청: ${url}`);

    try {
      const response = await axios.get(url, { responseType: 'arraybuffer' });
      const decodedContent = iconv.decode(Buffer.from(response.data), 'UTF-8');
      return decodedContent;
    } catch (error) {
      this.logger.error(
        `[${DisclosureService.name}] 공시 내용 불러오기 중 오류 발생 (접수번호: ${rceptNo}):`,
        error.message,
      );
      return null;
    }
  }
}
