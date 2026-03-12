import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as archiver from 'archiver';
import { PassThrough } from 'stream';

/**
 * Generates a self-contained static-site ZIP for a hotel.
 * Includes HTML pages, CSS, and hotel data as JSON.
 */
@Injectable()
export class ExportService {
  private readonly logger = new Logger(ExportService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Build ZIP for a hotel and return a readable stream
   */
  async buildSiteZip(hotelId: string): Promise<{ stream: PassThrough; filename: string }> {
    const hotel = await this.prisma.hotel.findUnique({
      where: { id: hotelId },
      include: {
        roomTypes: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
        },
        media: { orderBy: { sortOrder: 'asc' } },
        seoMeta: true,
        reviews: {
          where: { isPublished: true },
          take: 20,
          orderBy: { createdAt: 'desc' },
          include: { guest: { select: { name: true } } },
        },
      },
    });

    if (!hotel) throw new NotFoundException('Hotel not found');

    const passthrough = new PassThrough();
    const archive = archiver.default('zip', { zlib: { level: 9 } });

    archive.on('error', (err) => {
      this.logger.error(`Archive error for hotel ${hotelId}`, err);
      passthrough.destroy(err);
    });

    archive.pipe(passthrough);

    // CSS
    archive.append(this.generateCSS(hotel.themeConfig as any), { name: 'css/style.css' });

    // Main page
    archive.append(this.generateIndex(hotel), { name: 'index.html' });

    // Rooms page
    archive.append(this.generateRoomsPage(hotel), { name: 'rooms.html' });

    // Reviews page
    archive.append(this.generateReviewsPage(hotel), { name: 'reviews.html' });

    // Hotel data as JSON (for custom integrations)
    archive.append(JSON.stringify({ hotel, exportedAt: new Date().toISOString() }, null, 2), {
      name: 'data/hotel.json',
    });

    await archive.finalize();

    return { stream: passthrough, filename: `${hotel.slug}-site.zip` };
  }

  private generateCSS(theme: any): string {
    const primary = theme?.primaryColor || '#2563eb';
    const font = theme?.fontFamily || "'Inter', -apple-system, BlinkMacSystemFont, sans-serif";
    return `
:root { --primary: ${primary}; --font: ${font}; }
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: var(--font); color: #1f2937; background: #fff; line-height: 1.6; }
.container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
header { background: var(--primary); color: #fff; padding: 24px 0; }
header h1 { font-size: 28px; }
header p { opacity: 0.85; margin-top: 4px; }
nav { background: #f9fafb; border-bottom: 1px solid #e5e7eb; padding: 12px 0; }
nav a { margin-right: 24px; text-decoration: none; color: var(--primary); font-weight: 500; }
.hero { padding: 60px 0; text-align: center; background: #f3f4f6; }
.hero h2 { font-size: 36px; margin-bottom: 12px; }
.section { padding: 48px 0; }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 24px; }
.card { border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; }
.card-body { padding: 20px; }
.card h3 { font-size: 20px; margin-bottom: 8px; }
.card .price { color: var(--primary); font-size: 24px; font-weight: 700; }
.card .amenities { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
.card .amenities span { background: #eff6ff; color: var(--primary); padding: 4px 10px; border-radius: 6px; font-size: 13px; }
.review { border-bottom: 1px solid #e5e7eb; padding: 20px 0; }
.review .stars { color: #f59e0b; }
.review .author { font-weight: 600; }
footer { background: #111827; color: #9ca3af; padding: 32px 0; text-align: center; font-size: 14px; }
`;
  }

  private pageWrapper(hotel: any, title: string, content: string): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - ${hotel.name}</title>
  <link rel="stylesheet" href="css/style.css">
</head>
<body>
  <header>
    <div class="container">
      <h1>${hotel.name}</h1>
      <p>${hotel.address}, ${hotel.city}, ${hotel.state}</p>
    </div>
  </header>
  <nav>
    <div class="container">
      <a href="index.html">Home</a>
      <a href="rooms.html">Rooms</a>
      <a href="reviews.html">Reviews</a>
    </div>
  </nav>
  ${content}
  <footer>
    <div class="container">
      <p>&copy; ${new Date().getFullYear()} ${hotel.name}. All rights reserved.</p>
      <p style="margin-top:8px">${hotel.phone} &middot; ${hotel.email}</p>
    </div>
  </footer>
</body>
</html>`;
  }

  private generateIndex(hotel: any): string {
    const stars = '&#9733;'.repeat(hotel.starRating);
    const content = `
  <div class="hero">
    <div class="container">
      <h2>Welcome to ${hotel.name}</h2>
      <p style="font-size:18px;color:#6b7280">${stars} ${hotel.starRating}-Star Hotel in ${hotel.city}</p>
      <p style="margin-top:16px;max-width:600px;margin-left:auto;margin-right:auto;color:#4b5563">${hotel.description || ''}</p>
    </div>
  </div>
  <div class="section">
    <div class="container">
      <h2 style="margin-bottom:24px">Our Rooms</h2>
      <div class="grid">
        ${(hotel.roomTypes || []).slice(0, 3).map((rt: any) => `
        <div class="card">
          ${rt.images?.[0] ? `<img src="${rt.images[0]}" alt="${rt.name}" style="width:100%;height:200px;object-fit:cover">` : ''}
          <div class="card-body">
            <h3>${rt.name}</h3>
            <p class="price">&#8377;${rt.basePriceDaily.toLocaleString('en-IN')}<span style="font-size:14px;font-weight:400;color:#6b7280"> / night</span></p>
          </div>
        </div>`).join('')}
      </div>
    </div>
  </div>`;
    return this.pageWrapper(hotel, 'Home', content);
  }

  private generateRoomsPage(hotel: any): string {
    const content = `
  <div class="section">
    <div class="container">
      <h2 style="margin-bottom:24px">Rooms &amp; Suites</h2>
      <div class="grid">
        ${(hotel.roomTypes || []).map((rt: any) => `
        <div class="card">
          ${rt.images?.[0] ? `<img src="${rt.images[0]}" alt="${rt.name}" style="width:100%;height:220px;object-fit:cover">` : ''}
          <div class="card-body">
            <h3>${rt.name}</h3>
            <p style="color:#6b7280;margin-bottom:12px">${rt.description || ''}</p>
            <p class="price">&#8377;${rt.basePriceDaily.toLocaleString('en-IN')}<span style="font-size:14px;font-weight:400;color:#6b7280"> / night</span></p>
            <p style="color:#6b7280;font-size:14px;margin-top:8px">Max guests: ${rt.maxGuests}</p>
            <div class="amenities">
              ${(rt.amenities || []).map((a: string) => `<span>${a}</span>`).join('')}
            </div>
          </div>
        </div>`).join('')}
      </div>
    </div>
  </div>`;
    return this.pageWrapper(hotel, 'Rooms', content);
  }

  private generateReviewsPage(hotel: any): string {
    const content = `
  <div class="section">
    <div class="container">
      <h2 style="margin-bottom:24px">Guest Reviews</h2>
      ${(hotel.reviews || []).length === 0 ? '<p style="color:#6b7280">No reviews yet.</p>' : ''}
      ${(hotel.reviews || []).map((r: any) => `
      <div class="review">
        <p class="stars">${'&#9733;'.repeat(r.rating)}${'&#9734;'.repeat(5 - r.rating)}</p>
        <p class="author">${r.guest?.name || 'Guest'}</p>
        ${r.title ? `<p style="font-weight:600;margin-top:4px">${r.title}</p>` : ''}
        <p style="color:#4b5563;margin-top:4px">${r.comment || ''}</p>
        ${r.hotelReply ? `<p style="background:#f9fafb;padding:12px;border-radius:8px;margin-top:8px;font-size:14px"><strong>Hotel reply:</strong> ${r.hotelReply}</p>` : ''}
      </div>`).join('')}
    </div>
  </div>`;
    return this.pageWrapper(hotel, 'Reviews', content);
  }
}
