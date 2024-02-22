// import { csrfFetch } from './csrf';

import { csrfFetch } from "./csrf"


export const LOAD_GROUPS = 'groups/LOAD_GROUPS'
export const LOAD_GROUP_INFORMATION = 'groups/LOAD_GROUP_INFORMATION'
export const EDIT_GROUP = 'groups/EDIT_GROUP'
export const DELETE_GROUP = 'group/DELETE_GROUP'
export const CREATE_GROUP = 'group/CREATE_GROUP'


export const loadGroups = (groups) => ({
    type: LOAD_GROUPS,
    groups
})

export const loadGroupInfo = (group) => ({
    type: LOAD_GROUP_INFORMATION,
    group
})

export const editGroup = (groupId, group) => ({
    type: EDIT_GROUP,
    groupId,
    group
})

export const deleteGroup = (groupId) => ({
    type: DELETE_GROUP,
    groupId,
})

export const createGroup = (group) => ({
    tpye: CREATE_GROUP,
    group
})



export const thunkingGroup = () => async (dispatch) => {
    const response = await fetch('/api/groups')
    const groups = await response.json()
    dispatch(loadGroups(groups))
    console.log('Testing')
}

export const thunkGroupCreator = (group) => async (dispatch) => {
    const response = await csrfFetch('/api/groups',
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(group)
        })
    if (response.ok) {
        const group = await response.json()
        dispatch(createGroup(group))
        return group
    } else throw response
}



export const thunkGroupEditor = (groupId, group) => async (dispatch) => {
    const response = await csrfFetch(`/api/groups/${groupId}`,
        {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(group)
        }
    )
    if (response.ok) {
        const group = await response.json()
        dispatch(editGroup(groupId, group))
        return group
    }
    else return error = await response.json()
}



export const thunkGroupDeleter = (group) => async (dispatch) => {
    const response = await csrfFetch(`/api/groups/${group.id}`,
        {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        }
    )
    if (response.ok) {
        const message = await response.json()
        //We'll delete events later
        dispatch(deleteGroup(group.id))
        return message
    }
    else return error = await response.json()

}




const groupReducer = (state = {}, action) => {
    switch (action.type) {
        case LOAD_GROUPS: {
            const groupState = { ...state };
            action.groups.Groups.forEach(group => {
                groupState[group.id] = { ...group };
            });
            return groupState;
        }
        case LOAD_GROUP_INFORMATION: {
            const groupState = { ...state };
            return groupState
        }
        case EDIT_GROUP: {
            const groupState = { ...state };
            return groupState
        }
        case DELETE_GROUP: {
            const groupState = { ...state };
            delete groupState[action.groupId]
            return groupState
        }
        case CREATE_GROUP: {
            const groupState = { ...state };
            groupState[action.group.id] = action.group
            return groupState
        }
        default:
            return state;
    }
};

export default groupReducer
