import { BusinessPermitProfile } from '../entities/business-permit-profile.entity';
import { PermitType } from '../enums/permit-type.enum';

export interface BusinessPermitProfileRepository {
  findByProfileAndType(businessProfileId: string, permitType: PermitType): Promise<BusinessPermitProfile | null>;
  findManyByProfileId(businessProfileId: string): Promise<BusinessPermitProfile[]>;
  save(permitProfile: BusinessPermitProfile): Promise<void>;
}
