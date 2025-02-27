// hooks/useBanking.js
import { useContext } from 'react';
import {BankingProvider} from '../../providers/BankingProvider/index';

export const useBanking = () => {
  const context = useContext(BankingProvider);
  if (context === undefined) {
    throw new Error('useBanking must be used within BankingProvider');
  }
  return context;
};