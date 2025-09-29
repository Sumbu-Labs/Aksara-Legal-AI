import { randomUUID } from 'crypto';
import { BusinessScale } from '../enums/business-scale.enum';
import { BusinessType } from '../enums/business-type.enum';
import { BusinessPermitProfile } from './business-permit-profile.entity';

type Nullable<T> = T | null | undefined;

export interface BusinessProfileProps {
  id: string;
  userId: string;
  businessName: string;
  businessType: BusinessType;
  businessScale: BusinessScale;
  province: Nullable<string>;
  city: Nullable<string>;
  address?: string | null;
  industryTags: string[];
  completedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  permits: BusinessPermitProfile[];
}

export interface CreateBusinessProfileParams {
  id?: string;
  userId: string;
  businessName: string;
  businessType: BusinessType;
  businessScale: BusinessScale;
  province?: Nullable<string>;
  city?: Nullable<string>;
  address?: string | null;
  industryTags?: string[];
  completedAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
  permits?: BusinessPermitProfile[];
}

export class BusinessProfile {
  private constructor(private props: BusinessProfileProps) {}

  static create(params: CreateBusinessProfileParams): BusinessProfile {
    const now = new Date();
    return new BusinessProfile({
      id: params.id ?? randomUUID(),
      userId: params.userId,
      businessName: params.businessName,
      businessType: params.businessType,
      businessScale: params.businessScale,
      province: params.province ?? null,
      city: params.city ?? null,
      address: params.address ?? null,
      industryTags: params.industryTags ?? [],
      completedAt: params.completedAt ?? null,
      createdAt: params.createdAt ?? now,
      updatedAt: params.updatedAt ?? now,
      permits: params.permits ?? [],
    });
  }

  get id(): string {
    return this.props.id;
  }

  get userId(): string {
    return this.props.userId;
  }

  get businessName(): string {
    return this.props.businessName;
  }

  get businessType(): BusinessType {
    return this.props.businessType;
  }

  get businessScale(): BusinessScale {
    return this.props.businessScale;
  }

  get province(): Nullable<string> {
    return this.props.province ?? null;
  }

  get city(): Nullable<string> {
    return this.props.city ?? null;
  }

  get address(): Nullable<string> {
    return this.props.address ?? null;
  }

  get industryTags(): string[] {
    return this.props.industryTags;
  }

  get completedAt(): Nullable<Date> {
    return this.props.completedAt ?? null;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  get permits(): BusinessPermitProfile[] {
    return this.props.permits;
  }

  updateDetails(details: {
    businessName?: string;
    businessType?: BusinessType;
    businessScale?: BusinessScale;
    province?: Nullable<string>;
    city?: Nullable<string>;
    address?: Nullable<string>;
    industryTags?: string[];
  }): void {
    if (details.businessName !== undefined) {
      this.props.businessName = details.businessName;
    }
    if (details.businessType !== undefined) {
      this.props.businessType = details.businessType;
    }
    if (details.businessScale !== undefined) {
      this.props.businessScale = details.businessScale;
    }
    if (details.province !== undefined) {
      this.props.province = details.province ?? null;
    }
    if (details.city !== undefined) {
      this.props.city = details.city ?? null;
    }
    if (details.address !== undefined) {
      this.props.address = details.address ?? null;
    }
    if (details.industryTags !== undefined) {
      this.props.industryTags = details.industryTags;
    }
    this.touch();
  }

  updatePermits(permits: BusinessPermitProfile[]): void {
    this.props.permits = permits;
    this.touch();
  }

  markCompleted(): void {
    this.props.completedAt = new Date();
    this.touch();
  }

  markIncomplete(): void {
    this.props.completedAt = null;
    this.touch();
  }

  toJSON(): BusinessProfileProps {
    return { ...this.props };
  }

  private touch(): void {
    this.props.updatedAt = new Date();
  }
}
