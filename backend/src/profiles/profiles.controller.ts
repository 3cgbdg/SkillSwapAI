import { Body, Controller, Get, InternalServerErrorException, Param, Post, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';

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
  async uploadPhoto(@UploadedFile() file: Express.Multer.File, @Req() req: Request): Promise<string> {
    console.log(file)
    if (!file)
      throw new InternalServerErrorException("There`s no image data")
    const key = `avatars/${Date.now()}_${file.originalname}`;
    return this.profilesService.uploadPhoto(file, key, (req as any).user.id);
  }

}
