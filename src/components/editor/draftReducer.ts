export type DraftState = { present: string, original: string, previous: string };
export type DraftAction =
  | { type: 'SET'; payload: string }
  | { type: 'EXTERNAL_UPDATE'; payload: string }
  | { type: 'SET_ORIGINAL'; payload: string }
  | { type: 'CLEAR' };

export const initialDraftState: DraftState = { present: '', original: '', previous: '' };
  
export const draftReducer = (state: DraftState, action: DraftAction): DraftState => {
  const { present, original, previous } = state;
  switch (action.type) {
    case 'SET':
    case 'EXTERNAL_UPDATE':
      if (action.payload === present) return state;
      return {
        ...state,
        previous: present,
        present: action.payload,
      };
    case 'SET_ORIGINAL':
        return {
            ...state,
            original: action.payload,
        };
    case 'CLEAR':
        return {
            present: '',
            original: '',
            previous: ''
        }
    default:
      return state;
  }
};
