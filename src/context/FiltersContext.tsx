// src/context/FiltersContext.tsx
import { createContext, useContext } from 'react';

interface FiltersContextValue {
  filtersOpen: boolean;
  setFiltersOpen: (open: boolean) => void;
}

export const FiltersContext = createContext<FiltersContextValue>({
  filtersOpen: false,
  setFiltersOpen: () => {},
});

export const useFilters = () => useContext(FiltersContext);
