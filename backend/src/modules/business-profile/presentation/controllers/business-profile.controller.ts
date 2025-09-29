import {
  Body,
  Controller,
  Get,
  Param,
  ParseEnumPipe,
  Patch,
  Post,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthenticatedUser } from '../../../auth/domain/interfaces/authenticated-user.interface';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { CurrentUser } from '../../../auth/presentation/decorators/current-user.decorator';
import { BusinessProfileService } from '../../application/services/business-profile.service';
import { PermitType } from '../../domain/enums/permit-type.enum';
import { BusinessProfileResponseDto } from '../dto/business-profile-response.dto';
import { CreateBusinessProfileDto } from '../dto/create-business-profile.dto';
import { UpdateBusinessProfileDto } from '../dto/update-business-profile.dto';
import { UpdatePermitProfileDto } from '../dto/update-permit-profile.dto';

@UseGuards(JwtAuthGuard)
@Controller('business-profile')
export class BusinessProfileController {
  constructor(private readonly businessProfileService: BusinessProfileService) {}

  @Get('me')
  async getMyProfile(@CurrentUser() user: AuthenticatedUser | undefined): Promise<BusinessProfileResponseDto | null> {
    const profile = await this.businessProfileService.getProfileByUser(this.ensureUser(user));
    if (!profile) {
      return null;
    }
    return BusinessProfileResponseDto.fromDomain(profile);
  }

  @Post()
  async createProfile(
    @Body() dto: CreateBusinessProfileDto,
    @CurrentUser() user: AuthenticatedUser | undefined,
  ): Promise<BusinessProfileResponseDto> {
    const profile = await this.businessProfileService.createProfile({
      userId: this.ensureUser(user),
      businessName: dto.businessName,
      businessType: dto.businessType,
      businessScale: dto.businessScale,
      province: dto.province,
      city: dto.city,
      address: dto.address,
      industryTags: dto.industryTags,
    });

    return BusinessProfileResponseDto.fromDomain(profile);
  }

  @Patch()
  async updateProfile(
    @Body() dto: UpdateBusinessProfileDto,
    @CurrentUser() user: AuthenticatedUser | undefined,
  ): Promise<BusinessProfileResponseDto> {
    const profile = await this.businessProfileService.updateProfile({
      userId: this.ensureUser(user),
      businessName: dto.businessName,
      businessType: dto.businessType,
      businessScale: dto.businessScale,
      province: dto.province,
      city: dto.city,
      address: dto.address,
      industryTags: dto.industryTags,
    });

    return BusinessProfileResponseDto.fromDomain(profile);
  }

  @Patch('permits/:permitType')
  async updatePermit(
    @Param('permitType', new ParseEnumPipe(PermitType)) permitType: PermitType,
    @Body() dto: UpdatePermitProfileDto,
    @CurrentUser() user: AuthenticatedUser | undefined,
  ): Promise<BusinessProfileResponseDto> {
    const profile = await this.businessProfileService.updatePermit({
      userId: this.ensureUser(user),
      permitType,
      formData: dto.formData,
      fieldChecklist: dto.fieldChecklist,
      isChecklistComplete: dto.isChecklistComplete,
    });

    return BusinessProfileResponseDto.fromDomain(profile);
  }

  private ensureUser(user: AuthenticatedUser | undefined): string {
    if (!user) {
      throw new UnauthorizedException('User context missing');
    }
    return user.id;
  }
}
