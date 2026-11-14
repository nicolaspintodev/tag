import { useContext } from 'react';
import { StateBarContext } from '../context/StateBarContextOnly';

export const useStateBar = () => {
  const context = useContext(StateBarContext);
  if (!context) {
    throw new Error('useStateBar must be used within a StateBarProvider');
  }
  return context;
};