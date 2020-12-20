import * as actions from '../actions.constants';

export const addTask = content => ({
    type:actions.ADD_TASK,
    payload:{
        Task:content.Task,
        User:content.User
    }
});

export const removeTask = ID => ({
    type:actions.REMOVE_TASK,
    payload:{
        ID
    }
});

export const updateTask = (ID,Task) => ({
    type:actions.UPDATE_TASK,
    payload:{
        ID,
        Task
    }
});