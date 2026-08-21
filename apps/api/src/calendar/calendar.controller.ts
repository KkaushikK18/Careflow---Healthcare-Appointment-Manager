import { Controller, Get, Post, Delete, Query, Req, Res, UseGuards, BadRequestException } from '@nestjs/common';
import { CalendarService } from './calendar.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('calendar')
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  /**
   * Get calendar connection status
   * GET /calendar/status
   */
  @UseGuards(AuthGuard)
  @Get('status')
  async getStatus(@Req() req: any) {
    return this.calendarService.getConnectionStatus(req.user.sub);
  }

  /**
   * Initiate OAuth flow - redirect user to Google consent screen
   * GET /calendar/connect
   */
  @UseGuards(AuthGuard)
  @Get('connect')
  async connect(@Req() req: any, @Res() res: any) {
    const userId = req.user.sub;
    const authUrl = this.calendarService.getAuthUrl(userId);
    
    return res.redirect(302, authUrl);
  }

  /**
   * OAuth callback handler
   * GET /calendar/callback?code=...&state=userId
   */
  @Get('callback')
  async handleCallback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Res() res: any,
  ) {
    if (!code) {
      throw new BadRequestException('Authorization code is required');
    }

    if (!state) {
      throw new BadRequestException('User ID is required in state parameter');
    }

    try {
      await this.calendarService.handleCallback(code, state);
      
      // Redirect to frontend success page
      const frontendUrl = process.env.NEXT_PUBLIC_API_URL?.replace(':3001', ':3000') || 'http://localhost:3000';
      return res.redirect(302, `${frontendUrl}?calendar=connected`);
    } catch (error: any) {
      const frontendUrl = process.env.NEXT_PUBLIC_API_URL?.replace(':3001', ':3000') || 'http://localhost:3000';
      return res.redirect(302, `${frontendUrl}?calendar=error&message=${encodeURIComponent(error.message)}`);
    }
  }

  /**
   * Disconnect calendar
   * DELETE /calendar/disconnect
   */
  @UseGuards(AuthGuard)
  @Delete('disconnect')
  async disconnect(@Req() req: any) {
    await this.calendarService.disconnect(req.user.sub);
    return { message: 'Calendar disconnected successfully' };
  }

  /**
   * Manually trigger calendar sync for an appointment
   * POST /calendar/sync/:appointmentId
   */
  @UseGuards(AuthGuard)
  @Post('sync/:appointmentId')
  async syncAppointment(@Req() req: any, @Query('appointmentId') appointmentId: string) {
    if (!appointmentId) {
      throw new BadRequestException('Appointment ID is required');
    }

    await this.calendarService.syncAppointmentToCalendars(appointmentId);
    return { message: 'Calendar sync initiated' };
  }
}
