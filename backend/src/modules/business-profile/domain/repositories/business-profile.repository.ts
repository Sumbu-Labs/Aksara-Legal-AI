import { BusinessProfile } from '../entities/business-profile.entity';

export interface BusinessProfileRepository {
  findByUserId(userId: string): Promise<BusinessProfile | null>;
  findById(id: string): Promise<BusinessProfile | null>;
  save(profile: BusinessProfile): Promise<void>;
}
