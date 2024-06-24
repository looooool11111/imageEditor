import { combineReducers } from 'redux';
import systemReducer from './system';
const rootReducer = combineReducers({
  system: systemReducer,
});

export default rootReducer;
