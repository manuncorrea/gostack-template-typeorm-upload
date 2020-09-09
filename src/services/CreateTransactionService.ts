import Category from '../models/Category';
import Transaction from '../models/Transaction';
import { getRepository, getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';

import TransactionsRepository from '../repositories/TransactionsRepository';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request ): Promise<Transaction> {
    if (! ['income', 'outcome'].includes(type))
      throw new AppError('Invalid transaction');

      const transactionsRepository = getCustomRepository(TransactionsRepository);
      const categoriesRepository =  getRepository(Category);
      const balance = await transactionsRepository.getBalance();

      if (type === 'outcome' && value > balance.total)
        throw new AppError('Invalid transaction');


      let transactionCategory = await categoriesRepository.findOne({
        where: { title: category },
      });

      if (!transactionCategory) {
        transactionCategory = categoriesRepository.create({
          title: category,
        });

        await categoriesRepository.save(transactionCategory);
      }

      const transaction = transactionsRepository.create({
        title,
        value,
        type,
        category: transactionCategory,
      });

      console.log(transaction);

      await transactionsRepository.save(transaction);

      return transaction;
      
  }
}

export default CreateTransactionService;
