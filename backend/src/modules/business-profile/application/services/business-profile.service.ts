import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { USER_REPOSITORY } from '../../../auth/common/auth.constants';
import { UserRepository } from '../../../auth/domain/repositories/user.repository';
import { BusinessProfile } from '../../domain/entities/business-profile.entity';
import { BusinessPermitProfile } from '../../domain/entities/business-permit-profile.entity';
import { BusinessScale } from '../../domain/enums/business-scale.enum';
import { BusinessType } from '../../domain/enums/business-type.enum';
import { PermitType } from '../../domain/enums/permit-type.enum';
import { BUSINESS_PROFILE_REPOSITORY, BUSINESS_PERMIT_PROFILE_REPOSITORY } from '../../common/business-profile.constants';
import { BusinessProfileRepository } from '../../domain/repositories/business-profile.repository';
import { BusinessPermitProfileRepository } from '../../domain/repositories/business-permit-profile.repository';
import { CreateBusinessProfileCommand } from '../dto/create-business-profile.command';
import { UpdateBusinessProfileCommand } from '../dto/update-business-profile.command';
import { UpdatePermitProfileCommand } from '../dto/update-permit-profile.command';

@Injectable()
export class BusinessProfileService {
  constructor(
    @Inject(BUSINESS_PROFILE_REPOSITORY)
    private readonly businessProfileRepository: BusinessProfileRepository,
    @Inject(BUSINESS_PERMIT_PROFILE_REPOSITORY)
    private readonly businessPermitProfileRepository: BusinessPermitProfileRepository,
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
  ) {}

  async getProfileByUser(userId: string): Promise<BusinessProfile | null> {
    return this.businessProfileRepository.findByUserId(userId);
  }

  async createProfile(command: CreateBusinessProfileCommand): Promise<BusinessProfile> {
    await this.ensureUserExists(command.userId);

    const existingProfile = await this.businessProfileRepository.findByUserId(command.userId);
    if (existingProfile) {
      throw new ConflictException('Business profile already exists for this user');
    }

    const profile = BusinessProfile.create({
      userId: command.userId,
      businessName: command.businessName,
      businessType: command.businessType,
      businessScale: command.businessScale,
      province: command.province ?? null,
      city: command.city ?? null,
      address: command.address ?? null,
      industryTags: command.industryTags ?? [],
      permits: [],
    });

    await this.businessProfileRepository.save(profile);

    const permits = await this.ensureDefaultPermitProfiles(profile.id);
    profile.updatePermits(permits);
    await this.updateCompletionStatus(profile);

    return profile;
  }

  async updateProfile(command: UpdateBusinessProfileCommand): Promise<BusinessProfile> {
    const profile = await this.businessProfileRepository.findByUserId(command.userId);
    if (!profile) {
      throw new NotFoundException('Business profile not found');
    }

    profile.updateDetails({
      businessName: command.businessName,
      businessType: command.businessType,
      businessScale: command.businessScale,
      province: command.province,
      city: command.city,
      address: command.address,
      industryTags: command.industryTags,
    });

    await this.businessProfileRepository.save(profile);

    const permits = await this.businessPermitProfileRepository.findManyByProfileId(profile.id);
    profile.updatePermits(permits);
    await this.updateCompletionStatus(profile);

    return profile;
  }

  async updatePermit(command: UpdatePermitProfileCommand): Promise<BusinessProfile> {
    const profile = await this.businessProfileRepository.findByUserId(command.userId);
    if (!profile) {
      throw new NotFoundException('Business profile not found');
    }

    let permit = await this.businessPermitProfileRepository.findByProfileAndType(
      profile.id,
      command.permitType,
    );

    if (!permit) {
      permit = BusinessPermitProfile.create({
        businessProfileId: profile.id,
        permitType: command.permitType,
      });
    }

    permit.update({
      formData: command.formData,
      fieldChecklist: command.fieldChecklist,
      isChecklistComplete: command.isChecklistComplete,
    });

    await this.businessPermitProfileRepository.save(permit);

    const permits = await this.businessPermitProfileRepository.findManyByProfileId(profile.id);
    profile.updatePermits(permits);
    await this.updateCompletionStatus(profile);

    return profile;
  }

  private async ensureUserExists(userId: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
  }

  private async ensureDefaultPermitProfiles(businessProfileId: string): Promise<BusinessPermitProfile[]> {
    const permits = await this.businessPermitProfileRepository.findManyByProfileId(businessProfileId);
    const existingTypes = new Set(permits.map((permit) => permit.permitType));

    const defaultTypes = Object.values(PermitType);
    const creations: BusinessPermitProfile[] = [];

    for (const permitType of defaultTypes) {
      if (!existingTypes.has(permitType)) {
        const created = BusinessPermitProfile.create({
          businessProfileId,
          permitType,
        });
        await this.businessPermitProfileRepository.save(created);
        creations.push(created);
      }
    }

    return [...permits, ...creations];
  }

  private async updateCompletionStatus(profile: BusinessProfile): Promise<void> {
    const isBasicInfoComplete = this.isBasicInfoComplete(profile);
    const allPermitCompleted = profile.permits.length > 0 && profile.permits.every((permit) => permit.isChecklistComplete);

    if (isBasicInfoComplete && allPermitCompleted) {
      profile.markCompleted();
    } else {
      profile.markIncomplete();
    }

    await this.businessProfileRepository.save(profile);
  }

  private isBasicInfoComplete(profile: BusinessProfile): boolean {
    return (
      this.isNonEmpty(profile.businessName) &&
      this.isValidEnumValue(profile.businessType, BusinessType) &&
      this.isValidEnumValue(profile.businessScale, BusinessScale)
    );
  }

  private isNonEmpty(value: string | null | undefined): boolean {
    return !!value && value.trim().length > 0;
  }

  private isValidEnumValue<T extends Record<string, string>>(value: string, enumObj: T): boolean {
    return Object.values(enumObj).includes(value);
  }
}
