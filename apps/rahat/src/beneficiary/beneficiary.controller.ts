import { InjectQueue } from '@nestjs/bull';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UploadedFile,
  UseInterceptors
} from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import {
  AddBenToProjectDto,
  CreateBeneficiaryDto,
  ListBeneficiaryDto,
  UpdateBeneficiaryDto,
  ValidateWalletDto,
} from '@rahataid/extensions';
import {
  BQUEUE,
  BeneficiaryJobs,
  Enums,
  MS_TIMEOUT,
  TFile,
} from '@rahataid/sdk';
import { Queue } from 'bull';
import { UUID } from 'crypto';
import { catchError, throwError, timeout } from 'rxjs';
import { DocParser } from './parser';

function getDateInfo(dateString) {
  try {
    // const [day, month, year] = dateString.split("/");
    const date = new Date(dateString);
    return {
      date: date.toISOString(),
      year: date.getFullYear(),
      month: date.getMonth(),
      day: date.getDate(),
      age: new Date().getFullYear() - date.getFullYear(),
      isAdult: new Date().getFullYear() - date.getFullYear() > 18,
    }
  } catch (error) {
    console.error(error);
    return null;
  }
}

@Controller('beneficiaries')
@ApiTags('Beneficiaries')
export class BeneficiaryController {
  constructor(
    @Inject('BEN_CLIENT') private readonly client: ClientProxy,
    @InjectQueue(BQUEUE.RAHAT) private readonly queue: Queue
  ) { }

  @Get()
  async list(@Query() dto: ListBeneficiaryDto) {
    return this.client.send({ cmd: BeneficiaryJobs.LIST }, dto);
  }

  @Get('pii')
  async listPiiData(@Query() dto: any) {
    return this.client.send({ cmd: BeneficiaryJobs.LIST_PII }, dto);
  }

  @Get('stats')
  async getStats() {
    return this.client.send({ cmd: BeneficiaryJobs.STATS }, {});
  }

  @Post()
  async create(@Body() dto: CreateBeneficiaryDto) {
    return this.client.send({ cmd: BeneficiaryJobs.CREATE }, dto);
  }

  @ApiParam({ name: 'uuid', required: true })
  @Post('projects/:uuid')
  async referBeneficiary(
    @Param('uuid') uuid: UUID,
    @Body() dto: AddBenToProjectDto
  ) {
    return this.client.send(
      { cmd: BeneficiaryJobs.ADD_TO_PROJECT },
      { dto, projectUid: uuid }
    );
  }

  @Post('bulk')
  async createBulk(@Body() dto: CreateBeneficiaryDto[]) {
    const data = dto.map((b) => ({
      ...b,
      birthDate: b.birthDate ? new Date(b.birthDate).toISOString() : null,
    }));
    return this.client
      .send({ cmd: BeneficiaryJobs.CREATE_BULK }, data)
      .pipe(
        catchError((error) =>
          throwError(() => new RpcException(error.response))
        )
      )
      .pipe(timeout(MS_TIMEOUT));
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async upload(@UploadedFile() file: TFile, @Req() req: Request) {
    const docType: Enums.UploadFileType =
      req.body['doctype']?.toUpperCase() || Enums.UploadFileType.JSON;
    const beneficiaries = await DocParser(docType, file.buffer);
    console.log('beneficiaries', beneficiaries)

    const beneficiariesMapped = beneficiaries.map((b) => ({
      birthDate: new Date(b['Birth Date'],).toISOString(),
      internetStatus: b['Internet Status*'],
      bankedStatus: b['Bank Status*'],
      location: b['Location'],
      phoneStatus: b['Phone Status*'],
      ageRange: b['Age Range*'],
      notes: b['Notes'],
      gender: b["Gender*"],
      latitude: b['Latitude'],
      longitude: b['Longitude'],
      walletAddress: b['Wallet Address'],
      piiData: {
        name: b['Name*'],
        phone: b['Whatsapp Number*'],
        extras: {
          isAdult: getDateInfo(b['Birth Date'])?.isAdult,
          governmentId: b['Government ID'],
          age: getDateInfo(b['Birth Date'])?.age,
        },
      },
    }));

    console.log('beneficiariesMapped', beneficiariesMapped)

    return this.client
      .send({ cmd: BeneficiaryJobs.CREATE_BULK }, beneficiariesMapped)
      .pipe(
        catchError((error) => {
          console.log('error', error)
          return throwError(() => new BadRequestException(error.message))
        }
        )
      )
      .pipe(timeout(MS_TIMEOUT));
  }

  @Patch(':uuid')
  @ApiParam({ name: 'uuid', required: true })
  async update(@Param('uuid') uuid: UUID, @Body() dto: UpdateBeneficiaryDto) {
    return this.client.send({ cmd: BeneficiaryJobs.UPDATE }, { uuid, ...dto });
  }

  @Get(':uuid')
  @ApiParam({ name: 'uuid', required: true })
  async getBeneficiary(@Param('uuid') uuid: UUID) {
    return this.client.send({ cmd: BeneficiaryJobs.GET }, uuid);
  }

  @Get('wallet/:wallet')
  @ApiParam({ name: 'wallet', required: true })
  async getBeneficiaryByWallet(@Param('wallet') wallet: string) {
    return this.client.send({ cmd: BeneficiaryJobs.GET_BY_WALLET }, wallet);
  }

  @Get('phone/:phone')
  @ApiParam({ name: 'phone', required: true })
  async getBeneficiaryByPhone(@Param('phone') phone: string) {
    return this.client.send({ cmd: BeneficiaryJobs.GET_BY_PHONE }, phone);
  }

  @Get('verification-link/:uuid')
  @ApiParam({ name: 'uuid', required: true })
  async generateVerificationLink(@Param('uuid') uuid: UUID) {
    return this.client.send({ cmd: BeneficiaryJobs.GENERATE_LINK }, uuid);
  }

  @Post('validate-wallet')
  async validateWallet(@Body() dto: ValidateWalletDto) {
    return this.client.send({ cmd: BeneficiaryJobs.VALIDATE_WALLET }, dto);
  }

  @Post('verify-signature')
  async verifySignature(@Body() dto: any) {
    return this.client.send({ cmd: BeneficiaryJobs.VERIFY_SIGNATURE }, dto);
  }
}
