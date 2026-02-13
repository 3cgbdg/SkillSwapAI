import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { User } from '@prisma/client';
import { UpdateProfileDto } from './dto/update-profile.dto';
import type { RequestWithUser } from 'types/auth';
import type { IReturnMessage, ReturnDataType } from 'types/general';

@Controller('profiles')
@UseGuards(AuthGuard('jwt'))
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) { }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ReturnDataType<Partial<User> | null>> {
    return this.profilesService.findOne(id);
  }

  @Post('me/avatar/upload')
  @UseInterceptors(FileInterceptor('image'))
  async uploadAvatarImage(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: RequestWithUser,
  ): Promise<ReturnDataType<{ url: string }>> {
    if (!file) {
      throw new BadRequestException('Image data is missing');
    }
    return this.profilesService.updateProfileAvatarImage(file, req.user.id);
  }

  @Delete('me/avatar/delete')
  async deleteAvatarImage(@Req() req: RequestWithUser): Promise<IReturnMessage> {
    return this.profilesService.deleteProfileAvatarImage(req.user);
  }

  @Patch(':id')
  async updateProfile(
    @Body() dto: UpdateProfileDto,
    @Req() req: RequestWithUser,
  ): Promise<IReturnMessage> {
    return this.profilesService.updateProfile(dto, req.user);
  }
}
