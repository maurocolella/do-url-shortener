import { Controller, Get, Param, Res, NotFoundException, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { UrlService } from '../url/url.service';
import { RateLimitGuard } from '../../common/guards/rate-limit.guard';

@Controller()
export class RedirectController {
  constructor(
    private readonly urlService: UrlService,
    private readonly configService: ConfigService
  ) {}

  @Get(':slug')
  @UseGuards(RateLimitGuard)
  async redirect(@Param('slug') slug: string, @Res() res: Response) {
    try {
      const originalUrl = await this.urlService.resolveUrl(slug);
      return res.redirect(originalUrl);
    } catch (error) {
      if (error instanceof NotFoundException) {
        // Get the frontend URL from config or use a default
        const frontendUrl = this.configService.get<string>('url.frontendUrl') || 'http://localhost:5173';
        
        // Redirect to the frontend's 404 page
        return res.redirect(`${frontendUrl}/404`);
      }
      throw error;
    }
  }
}
