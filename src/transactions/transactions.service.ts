import { PrismaService } from '@binod7/prisma-db';
import { Injectable } from '@nestjs/common';
import { paginate } from '@utils/paginate';
import { PrismaTransaction } from '@utils/prisma/prisma.extensions';
import { bufferToHexString, hexStringToBuffer } from '@utils/string-format';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { ListTransactionDto } from './dto/list-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';

@Injectable()
export class TransactionsService {
  prisma = null;
  constructor(private _prisma: PrismaService) {
    this.prisma = _prisma.$extends(PrismaTransaction);
  }

  create(createTransactionDto: CreateTransactionDto) {
    return 'This action adds a new transaction';
  }

  async findAll(query: ListTransactionDto) {
    const { page, perPage, ...rest } = query;
    return paginate(
      this.prisma.transaction,
      {},
      {
        page,
        perPage,
        transformRows: (rows) => {
          return rows.map((row) => {
            return {
              ...row,
              txHash: bufferToHexString(row.txHash),
            };
          });
        },
      },
    );
  }

  async findOne(txHash: string) {
    console.log(txHash);
    const result = await this.prisma.transaction.findFirstOrThrow({
      where: {
        txHash: hexStringToBuffer(txHash),
      },
    });
    console.log(result);

    return {
      ...result,
      txHash: bufferToHexString(result?.txHash),
    };
  }

  update(txHash: string, updateTransactionDto: UpdateTransactionDto) {
    return this.prisma.transaction.update({
      data: {
        ...updateTransactionDto,
      },
      where: {
        txHash: hexStringToBuffer(txHash),
      },
    });
  }

  remove(txHash: string) {
    // /  return `This action removes a #${txHash} transaction`;
    return this.prisma.transaction.delete({
      where: {
        txHash: txHash,
      },
    });
  }
}
