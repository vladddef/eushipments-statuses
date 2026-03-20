import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { chromium } from 'playwright-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import {formatDate} from "../helpers/time";

chromium.use(StealthPlugin());

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
  private readonly username: string;
  private readonly password: string;
  private session;

  constructor(configService: ConfigService) {
    this.baseUrl = configService.getOrThrow<string>('eushipments.cabinetUrl');
    this.username = configService.getOrThrow<string>('eushipments.cabinetUsername');
    this.password = configService.getOrThrow<string>('eushipments.cabinetPassword');
  }

  private async login(): Promise<void> {
    this.logger.log('Opening browser for login...');
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto(`${this.baseUrl}/login`);
    await page.fill('input[name="username"]', this.username);
    await page.fill('input[name="password"]', this.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(`${this.baseUrl}/home`, { timeout: 10000 });

    this.session = await context.storageState();
    this.logger.log('Session saved');
    await browser.close();
  }

  private async getPage(path: string) {
    if (!this.session) {
      await this.login();
    }

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ storageState: this.session! });
    const page = await context.newPage();

    await page.goto(`${this.baseUrl}/${path}`);
    await page.waitForLoadState('networkidle');

    if (page.url().includes('login')) {
      this.logger.warn('Session expired, re-logging in...');
      await browser.close();
      this.session = null;
      return this.getPage(path);
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