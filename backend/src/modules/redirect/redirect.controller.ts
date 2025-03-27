import { Controller, Get, Param, Res, NotFoundException, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { UrlService } from '../url/url.service';
import { RateLimitGuard } from '../../common/guards/rate-limit.guard';

@Controller()
export class RedirectController {
  constructor(private readonly urlService: UrlService) {}

  @Get(':slug')
  @UseGuards(RateLimitGuard)
  async redirect(@Param('slug') slug: string, @Res() res: Response) {
    try {
      const originalUrl = await this.urlService.resolveUrl(slug);
      return res.redirect(originalUrl);
    } catch (error) {
      if (error instanceof NotFoundException) {
        // Return a 404 page
        return res.status(404).send(`
          <html>
            <head>
              <title>404 - URL Not Found</title>
              <style>
                body {
                  font-family: Arial, sans-serif;
                  text-align: center;
                  padding: 50px;
                  background-color: #f8f9fa;
                }
                h1 {
                  color: #dc3545;
                }
                p {
                  margin: 20px 0;
                }
                a {
                  color: #007bff;
                  text-decoration: none;
                }
                a:hover {
                  text-decoration: underline;
                }
              </style>
            </head>
            <body>
              <h1>404 - URL Not Found</h1>
              <p>The shortened URL you are looking for does not exist.</p>
              <p><a href="/">Go to Homepage</a></p>
            </body>
          </html>
        `);
      }
      throw error;
    }
  }
}
