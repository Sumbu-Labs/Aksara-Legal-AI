import { BusinessScale } from '../../domain/enums/business-scale.enum';
import { BusinessType } from '../../domain/enums/business-type.enum';

type Nullable<T> = T | null | undefined;

export interface UpdateBusinessProfileCommand {
  userId: string;
  businessName?: string;
  businessType?: BusinessType;
  businessScale?: BusinessScale;
  province?: Nullable<string>;
  city?: Nullable<string>;
  address?: Nullable<string>;
  industryTags?: string[];
}
