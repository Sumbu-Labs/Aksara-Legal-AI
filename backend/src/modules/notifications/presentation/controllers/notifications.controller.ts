import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { CurrentUser } from '../../../auth/presentation/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../../auth/domain/interfaces/authenticated-user.interface';
import { NotificationsService } from '../../application/services/notifications.service';
import { NotificationStatus } from '../../domain/enums/notification-status.enum';
import { ListNotificationQueryDto } from '../dto/list-notification-query.dto';
import { NotificationResponseDto } from '../dto/notification-response.dto';

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Daftar notifikasi pengguna' })
  @ApiResponse({ status: 200, type: [NotificationResponseDto] })
  async listNotifications(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: ListNotificationQueryDto,
  ): Promise<NotificationResponseDto[]> {
    const notifications = await this.notificationsService.listNotifications(user.id, {
      status: query.status,
      skip: query.skip,
      take: query.take,
    });
    return notifications.map(NotificationResponseDto.fromDomain);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Menandai satu notifikasi sebagai dibaca' })
  @ApiResponse({ status: 204 })
  @HttpCode(204)
  async markAsRead(@Param('id') notificationId: string, @CurrentUser() user: AuthenticatedUser): Promise<void> {
    await this.notificationsService.markAsRead(user.id, notificationId);
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'Menandai semua notifikasi sebagai dibaca' })
  @ApiResponse({ status: 200, description: 'Jumlah notifikasi yang diperbarui', schema: { type: 'object', properties: { count: { type: 'number' } } } })
  async markAllAsRead(@CurrentUser() user: AuthenticatedUser): Promise<{ count: number }> {
    const count = await this.notificationsService.markAllAsRead(user.id);
    return { count };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Menghapus notifikasi' })
  @ApiResponse({ status: 204 })
  @HttpCode(204)
  async deleteNotification(@Param('id') notificationId: string, @CurrentUser() user: AuthenticatedUser): Promise<void> {
    await this.notificationsService.deleteNotification(user.id, notificationId);
  }
}
