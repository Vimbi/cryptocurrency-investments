import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FilesService } from './files.service';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../roles/roles.decorator';
import { RoleEnum } from '../roles/roles.enum';
import { FileInterceptor } from '@nestjs/platform-express';
import { imageFilter } from '../../utils/image-filter';
import { UploadFileDto } from './dto/upload-file.dto';
import { FileEnum } from './files.enum';
import { File } from './entities/file.entity';
import { GetQueryDto } from '../../types/get-query.dto';
import { JwtTwoFactorGuard } from '../auth/guards/jwt-two-factor.guard';
import { documentFilter } from '../../utils/document-filter';
import { maxFileSize } from '../../utils/max-file-size';

@ApiBearerAuth()
@UseGuards(JwtTwoFactorGuard, RolesGuard)
@Roles(RoleEnum.superAdmin)
@ApiTags('Files')
@Controller({
  path: 'files',
  version: '1',
})
export class FilesController {
  constructor(private readonly service: FilesService) {}

  @Post('upload-image')
  @UseInterceptors(
    FileInterceptor('file', {
      fileFilter: imageFilter,
      limits: maxFileSize(FileEnum.image),
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UploadFileDto })
  @ApiResponse({ type: File })
  async uploadPhoto(@UploadedFile() file: Express.Multer.File) {
    return await this.service.uploadImage({
      file,
      folder: FileEnum.image,
    });
  }

  @Post('upload-doc')
  @UseInterceptors(
    FileInterceptor('file', {
      fileFilter: documentFilter,
      limits: maxFileSize(FileEnum.document),
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UploadFileDto })
  @ApiResponse({ type: File })
  async uploadDoc(@UploadedFile() file: Express.Multer.File) {
    return await this.service.uploadDocument({
      file,
      folder: FileEnum.document,
    });
  }

  @Get()
  async find(@Query() dto: GetQueryDto) {
    return await this.service.find(dto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return await this.service.delete({ id });
  }
}
