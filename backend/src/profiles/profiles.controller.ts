import {
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  Param,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { UpdateProfileDto } from './dto/update-profile.dto';
import type { RequestWithUser } from 'types/auth';
import type { IReturnMessage, ReturnDataType } from 'types/general';

@Controller('profiles')
@UseGuards(AuthGuard('jwt'))
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) { }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ReturnDataType<any>> {
    return this.profilesService.findOne(id);
  }

  @UseInterceptors(FileInterceptor('image'))
  @Post('/photo/upload')
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: RequestWithUser,
  ): Promise<ReturnDataType<{ url: string }>> {
    if (!file) throw new InternalServerErrorException('There`s no image data');
    const key = `avatars/${Date.now()}_${file.originalname}`;
    return this.profilesService.uploadImage(file, key, req.user.id);
  }

  @Delete('/photo/delete')
  async deleteImage(@Req() req: RequestWithUser): Promise<IReturnMessage> {
    return this.profilesService.deleteImage(req.user);
  }

  @Patch(':id')
  async updateProfile(
    @Body() dto: UpdateProfileDto,
    @Req() req: RequestWithUser,
  ): Promise<IReturnMessage> {
    return this.profilesService.updateProfile(dto, req.user);
  }

  @Get('ai-suggestions/polling')
  @UseGuards(AuthGuard('jwt'))
  async getPollingDataAiSuggestions(
    @Req() req: RequestWithUser,
  ): Promise<ReturnDataType<string[] | null>> {
    return this.profilesService.getPollingDataAiSuggestions(req.user.id);
  }
}
