import { combineReducers } from 'redux';

// IMPORT ALL REDECUERS;
import taskReducer from './task.reducer';
const allReducers = combineReducers({
    taskReducer
})
export default allReducers;