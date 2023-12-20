import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { BeneficiaryService } from './beneficiary.service';
import { CreateBeneficiaryDto } from './dto/create-beneficiary.dto';
import {
  ListBeneficiaryDto,
  ListBeneficiaryTransactionsDto,
} from './dto/list-beneficiary.dto';

import { AbilitiesGuard, CheckAbilities, JwtGuard } from '@binod7/rumsan-user';
import { ACTIONS, SUBJECTS } from 'src/common/constants/rs-user';
import {
  AssignBeneficiaryToProjectDto,
  UpdateBeneficiaryDto,
  UpdateBeneficiaryStatusDto,
} from './dto/update-beneficiary.dto';

@Controller('beneficiaries')
@ApiTags('beneficiaries')
@ApiBearerAuth('JWT')
export class BeneficiaryController {
  constructor(private readonly beneficiaryService: BeneficiaryService) {}

  @Post()
  create(@Body() createBeneficiaryDto: CreateBeneficiaryDto) {
    return this.beneficiaryService.create(createBeneficiaryDto);
  }

  @Get()
  @CheckAbilities({ action: ACTIONS.READ, subject: SUBJECTS.USER })
  @UseGuards(JwtGuard, AbilitiesGuard)
  findAll(@Query() query: ListBeneficiaryDto) {
    return this.beneficiaryService.findAll(query);
  }

  @Get('geo')
  getGeoLocation() {
    console.log('here');
    return this.beneficiaryService.getGeoLocation();
  }

  @Get('stats')
  getStats() {
    return this.beneficiaryService.getStats();
  }

  @Patch(':walletAddress/disable')
  disable(@Param('walletAddress') walletAddress: string) {
    return this.beneficiaryService.disableBeneficiary(walletAddress);
  }

  @Get(':uuid')
  findOne(@Param('uuid') uuid: string) {
    return this.beneficiaryService.findOne(uuid);
  }

  @Patch(':uuid')
  update(
    @Param('uuid') uuid: string,
    @Body() updateBeneficiaryDto: UpdateBeneficiaryDto,
  ) {
    return this.beneficiaryService.update(uuid, updateBeneficiaryDto);
  }

  @Delete(':uuid')
  remove(@Param('uuid') uuid: string) {
    return this.beneficiaryService.remove(uuid);
  }

  @Get(':uuid/transactions')
  getTransactions(
    @Param('uuid') uuid: string,
    @Query() query: ListBeneficiaryTransactionsDto,
  ) {
    return this.beneficiaryService.getTransactions(uuid, query);
  }

  @Post(':uuid/projects')
  assignProject(
    @Param('uuid') uuid: string,
    @Body() updateProjectData: AssignBeneficiaryToProjectDto,
  ) {
    return this.beneficiaryService.assignProject(
      uuid,
      +updateProjectData.projectId,
    );
  }

  @Patch(':uuid/status')
  updateStatus(
    @Param('uuid') uuid: string,
    @Body() update: UpdateBeneficiaryStatusDto,
  ) {
    return this.beneficiaryService.updateStatus(uuid, update);
  }
}
