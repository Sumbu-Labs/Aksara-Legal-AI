import { BusinessScale } from '../../domain/enums/business-scale.enum';
import { BusinessType } from '../../domain/enums/business-type.enum';

export interface CreateBusinessProfileCommand {
  userId: string;
  businessName: string;
  businessType: BusinessType;
  businessScale: BusinessScale;
  province?: string | null;
  city?: string | null;
  address?: string | null;
  industryTags?: string[];
}
