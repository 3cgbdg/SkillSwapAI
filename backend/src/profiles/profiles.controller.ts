import { Body, Controller, Delete, Get, InternalServerErrorException, Param, Patch, Post, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Controller('profiles')
@UseGuards(AuthGuard('jwt'))
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) { }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.profilesService.findOne(id);
  }


  @UseInterceptors(FileInterceptor('image'))
  @Post('/photo/upload')
  async uploadImage(@UploadedFile() file: Express.Multer.File, @Req() req: Request): Promise<string> {
    if (!file)
      throw new InternalServerErrorException("There`s no image data")
    const key = `avatars/${Date.now()}_${file.originalname}`;
    return this.profilesService.uploadImage(file, key, (req as any).user.id);
  }

  @Delete('/photo/delete')
  async deleteImage(@Req() req: Request): Promise<{ message: string }> {
    return this.profilesService.deleteImage((req as any).user);
  }

  @Patch(':id')
  async updateProfile(@Body() dto: UpdateProfileDto, @Req() req: Request): Promise<{ message: string }> {
    return this.profilesService.updateProfile(dto, (req as any).user);
  }

}
