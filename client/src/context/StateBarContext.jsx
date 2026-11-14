import { useState, useCallback } from 'react';
import { StateBarContext } from './StateBarContextOnly';

export const StateBarProvider = ({ children }) => {
  const [state, setState] = useState({
    count: 0,
    singular: 'registro',
    plural: 'registros',
    searchValue: '',
    onSearchChange: () => {},
    onSearchSubmit: () => {},
    onClearSearch: () => {},
    archived: false,
    onArchivedChange: () => {},
    extraFilters: [],
  });

  const updateState = useCallback((partial) => {
    setState(prev => ({ ...prev, ...partial }));
  }, []);

  const resetState = useCallback(() => {
    setState({
      count: 0,
      singular: 'registro',
      plural: 'registros',
      searchValue: '',
      onSearchChange: () => {},
      onSearchSubmit: () => {},
      onClearSearch: () => {},
      archived: false,
      onArchivedChange: () => {},
      extraFilters: [],
    });
  }, []);

  const value = {
    ...state,
    setState: updateState,
    resetState,
  };

  return (
    <StateBarContext.Provider value={value}>
      {children}
    </StateBarContext.Provider>
  );
};