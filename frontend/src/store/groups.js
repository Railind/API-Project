// import { csrfFetch } from './csrf';


export const LOAD_GROUPS = 'groups/LOAD_GROUPS'


export const loadGroups = (groups) => ({
    type: LOAD_GROUPS,
    groups
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
            // Ensure we're accessing the 'Groups' array within 'action.groups'
            action.groups.Groups.forEach(group => {
                groupState[group.id] = { ...group };
            });
            return groupState;
        }
        default:
            return state;
    }
};

export default groupReducer
