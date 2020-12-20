import * as actions from '../actions.constants';
import { produce } from 'immer';

const initialState = {
    Tasks:[],
    User:{}
}

var ID = 1;
export default function(state=initialState, action){
    let newState = {};
    let Task = {};
    let User = {};
    switch(action.type){
        case actions.ADD_TASK:
            Task = action.payload.Task;
            User = action.payload.User;
            newState = produce(state,draft=>{
                const Tmp = {
                    ID:ID,
                    Task
                }
                draft.Tasks.push(Tmp);
                draft.User = User;
            });
            ID = ID+1;
            return newState;
        case actions.REMOVE_TASK:
            ID = action.payload;
            newState = produce(state,draft=>{
                draft.Tasks.filter((item)=>item.ID!=ID);
            });
            return newState;
        case actions.UPDATE_TASK:
            ID = action.payload.ID;
            Task = action.payload.Task;
            newState = produce(state,draft=>{
                for(var t in draft.Tasks){
                    if(draft.Tasks[t].ID==ID){
                        draft.Tasks[t] = Task;
                    }
                }
            });
            return newState;
        default:
            return state;
    }
}