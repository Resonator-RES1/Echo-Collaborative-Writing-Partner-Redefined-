export type DraftState = { present: string };
export type DraftAction =
  | { type: 'SET'; payload: string }
  | { type: 'EXTERNAL_UPDATE'; payload: string }
  | { type: 'CLEAR' };

export const initialDraftState: DraftState = { present: '' };
  
export const draftReducer = (state: DraftState, action: DraftAction): DraftState => {
  const { present } = state;
  switch (action.type) {
    case 'SET':
    case 'EXTERNAL_UPDATE':
      if (action.payload === present) return state;
      return {
        present: action.payload,
      };
    case 'CLEAR':
        return {
            present: '',
        }
    default:
      return state;
  }
};
