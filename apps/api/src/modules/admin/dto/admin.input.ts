import { InputType, Field, Float, Int, ID } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-scalars';
import { IsNotEmpty, IsOptional, IsString, IsNumber, IsEnum, IsEmail } from 'class-validator';
import { BookingModel, HotelTemplate } from '../../hotel/entities/hotel.entity';

@InputType()
export class UpdateHotelInput {
  @Field(() => ID)
  @IsNotEmpty()
  @IsString()
  hotelId: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  name?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  address?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  city?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  state?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  pincode?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  phone?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsEmail()
  email?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  whatsapp?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  heroImageUrl?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  logoUrl?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  starRating?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  checkInTime?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  checkOutTime?: string;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  longitude?: number;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  themeConfig?: Record<string, unknown>;

  @Field(() => BookingModel, { nullable: true })
  @IsOptional()
  @IsEnum(BookingModel)
  bookingModel?: BookingModel;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  hourlyMinHours?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  hourlyMaxHours?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  razorpayAccountId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  stripeAccountId?: string;

  @Field(() => HotelTemplate, { nullable: true })
  @IsOptional()
  @IsEnum(HotelTemplate)
  template?: HotelTemplate;
}

@InputType()
export class CreateRoomTypeInput {
  @Field(() => ID)
  hotelId: string;

  @Field()
  name: string;

  @Field()
  slug: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => Float)
  basePriceDaily: number;

  @Field(() => Float, { nullable: true })
  basePriceHourly?: number;

  @Field(() => Int, { defaultValue: 2 })
  maxGuests: number;

  @Field(() => Int, { defaultValue: 0 })
  maxExtraGuests: number;

  @Field(() => Float, { defaultValue: 0 })
  extraGuestCharge: number;

  @Field(() => Int, { defaultValue: 1 })
  totalRooms: number;

  @Field(() => [String], { defaultValue: [] })
  amenities: string[];

  @Field(() => [String], { defaultValue: [] })
  images: string[];

  @Field(() => Int, { defaultValue: 0 })
  sortOrder: number;
}

@InputType()
export class UpdateRoomTypeInput {
  @Field(() => ID)
  id: string;

  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => Float, { nullable: true })
  basePriceDaily?: number;

  @Field(() => Float, { nullable: true })
  basePriceHourly?: number;

  @Field(() => Int, { nullable: true })
  maxGuests?: number;

  @Field(() => Int, { nullable: true })
  maxExtraGuests?: number;

  @Field(() => Float, { nullable: true })
  extraGuestCharge?: number;

  @Field(() => Int, { nullable: true })
  totalRooms?: number;

  @Field(() => [String], { nullable: true })
  amenities?: string[];

  @Field(() => [String], { nullable: true })
  images?: string[];

  @Field(() => Int, { nullable: true })
  sortOrder?: number;

  @Field({ nullable: true })
  isActive?: boolean;
}

@InputType()
export class BulkInventoryUpdateInput {
  @Field(() => ID)
  roomTypeId: string;

  @Field()
  startDate: Date;

  @Field()
  endDate: Date;

  @Field(() => Float, { nullable: true, description: 'Price override for the date range (null = use base price)' })
  priceOverride?: number;

  @Field(() => Int, { nullable: true, description: 'Override available count' })
  availableCount?: number;

  @Field({ nullable: true, description: 'Close/open dates for booking' })
  isClosed?: boolean;

  @Field(() => Int, { nullable: true, description: 'Minimum stay nights' })
  minStayNights?: number;
}

@InputType()
export class SingleDateInventoryInput {
  @Field(() => ID)
  roomTypeId: string;

  @Field()
  date: Date;

  @Field(() => Float, { nullable: true })
  priceOverride?: number;

  @Field(() => Int, { nullable: true })
  availableCount?: number;

  @Field({ nullable: true })
  isClosed?: boolean;

  @Field(() => Int, { nullable: true })
  minStayNights?: number;
}

// ============================================
// SEO Meta
// ============================================

@InputType()
export class UpsertSeoMetaInput {
  @Field(() => ID)
  hotelId: string;

  @Field({ description: 'Page identifier e.g. "homepage", "rooms", "contact"' })
  pageSlug: string;

  @Field({ nullable: true })
  metaTitle?: string;

  @Field({ nullable: true })
  metaDescription?: string;

  @Field({ nullable: true })
  ogImageUrl?: string;

  @Field({ nullable: true })
  canonicalUrl?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  customJsonLd?: any;
}

// ============================================
// Content / Theme
// ============================================

@InputType()
export class UpdateHotelContentInput {
  @Field(() => ID)
  hotelId: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  heroImageUrl?: string;

  @Field({ nullable: true })
  logoUrl?: string;

  @Field(() => GraphQLJSON, { nullable: true, description: 'Theme config: { primaryColor, fontFamily, etc. }' })
  themeConfig?: any;
}
