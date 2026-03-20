import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import { chromium } from 'playwright-extra';
import { formatDate } from '../helpers/time';

export interface CabinetOrder {
  SHIPMENT_NUMBER: string;
  C_NAME: string;
  REFERENCE_NUMBER: string;
  RECIPIENT: string;
  OP_PHONENUMBER: string | null;
  CITY_NAME: string;
  COD: string | null;
  STATUS_TEXT: string;
}

@Injectable()
export class CabinetService {
  private readonly logger = new Logger(CabinetService.name);
  private readonly baseUrl: string;
  private readonly sessionPath: string;

  constructor(configService: ConfigService) {
    this.baseUrl = configService.getOrThrow<string>('eushipments.cabinetUrl');
    this.sessionPath = configService.getOrThrow<string>(
      'eushipments.cabinetSessionPath',
    );
  }

  async login(): Promise<void> {
    this.logger.log('Opening browser for manual login...');
    const browser = await chromium.launch({
      channel: 'chrome',
      headless: false,
    });
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto(`${this.baseUrl}/login`);
    this.logger.log('Waiting for manual login (2 minutes)...');
    await page.waitForURL((url) => !url.toString().includes('login'), {
      timeout: 120000,
    });

    const session = await context.storageState();
    fs.writeFileSync(this.sessionPath, JSON.stringify(session));
    this.logger.log(`Session saved to ${this.sessionPath}`);
    await browser.close();
  }

  private async getPage(path: string) {
    if (!fs.existsSync(this.sessionPath)) {
      throw new Error(
        `Session file not found at ${this.sessionPath}. Run login() first.`,
      );
    }

    const browser = await chromium.launch({ headless: true });
    const storageState = JSON.parse(fs.readFileSync(this.sessionPath, 'utf-8'));
    const context = await browser.newContext({ storageState });
    const page = await context.newPage();

    await page.goto(`${this.baseUrl}/${path}`);
    await page.waitForLoadState('networkidle');

    if (page.url().includes('login')) {
      await browser.close();
      throw new Error('Session expired. Run login() to re-authenticate.');
    }

    return { browser, page };
  }

  async getOrders(startDate?: Date, endDate?: Date): Promise<CabinetOrder[]> {
    const today = new Date();
    const start = formatDate(startDate ?? today);
    const end = formatDate(endDate ?? today);
    const query = `stats/table?startDate=${encodeURIComponent(start)}&endDate=${encodeURIComponent(end)}`;

    const { browser, page } = await this.getPage(query);

    const html = await page.content();
    await browser.close();

    const match = html.match(/var waybills = (\[.*?]);/);
    if (!match) {
      this.logger.error('Could not find waybills data in page source');
      return [];
    }

    return JSON.parse(match[1]) as CabinetOrder[];
  }
}
