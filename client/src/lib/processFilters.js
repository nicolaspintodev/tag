const PROCESS_FILTER_KEYS = [
  'liquidado_cliente',
  'liquidado_chofer',
  'liquidado_proveedor',
  'facturado',
];

export const emptyProcessFilters = () => Object.fromEntries(PROCESS_FILTER_KEYS.map(key => [key, false]));

export const initialProcessFilterState = () => ({
  applied: emptyProcessFilters(),
  draft: emptyProcessFilters(),
  menuOpen: false,
});

export const processFilterReducer = (state, action) => {
  switch (action.type) {
    case 'toggle':
      return state.menuOpen
        ? { ...state, draft: { ...state.applied }, menuOpen: false }
        : { ...state, draft: { ...state.applied }, menuOpen: true };
    case 'close':
      return { ...state, draft: { ...state.applied }, menuOpen: false };
    case 'change':
      return { ...state, draft: { ...state.draft, [action.key]: action.value } };
    case 'apply':
      return { applied: { ...state.draft }, draft: { ...state.draft }, menuOpen: false };
    case 'clear': {
      const empty = emptyProcessFilters();
      return { applied: empty, draft: { ...empty }, menuOpen: false };
    }
    default:
      return state;
  }
};
