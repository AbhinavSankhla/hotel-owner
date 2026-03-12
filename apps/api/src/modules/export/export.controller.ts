import { Controller, Get, Param, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { ExportService } from './export.service';

/**
 * REST endpoint for downloading hotel site as ZIP.
 * GET /api/export/:hotelId/site.zip
 */
@Controller('export')
export class ExportController {
  constructor(private readonly exportService: ExportService) {}

  @Get(':hotelId/site.zip')
  async downloadSiteZip(
    @Param('hotelId') hotelId: string,
    @Res() res: Response,
  ) {
    const { stream, filename } = await this.exportService.buildSiteZip(hotelId);

    res.set({
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${filename}"`,
    });

    stream.pipe(res);
  }
}
