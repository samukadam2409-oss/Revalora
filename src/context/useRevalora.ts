import { useContext } from 'react';
import { RevaloraContext } from './RevaloraContext';

export const useRevalora = () => {
  const context = useContext(RevaloraContext);
  if (!context) {
    throw new Error('useRevalora must be used within a RevaloraProvider');
  }
  return context;
};

