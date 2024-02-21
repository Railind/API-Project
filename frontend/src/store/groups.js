// import { csrfFetch } from './csrf';


export const LOAD_GROUPS = 'groups/LOAD_GROUPS'
export const LOAD_GROUP_INFORMATION = 'groups/LOAD_GROUP_INFORMATION'
export const EDIT_GROUP = 'groups/EDIT_GROUP'
export const DELETE_GROUP = 'group/DELETE_GROUP'

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



export const thunkingGroup = () => async (dispatch) => {
    const response = await fetch('/api/groups')
    const groups = await response.json()
    dispatch(loadGroups(groups))
    console.log('Testing')
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
        default:
            return state;
    }
};

export default groupReducer
