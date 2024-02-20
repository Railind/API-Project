import { csrfFetch } from './csrf';


export const LOAD_GROUPS = 'groups/LOAD_GROUPS'


export const loadGroups = (groups) => ({
    type: LOAD_GROUPS,
    groups
})



export const thunkingGroup = () => async (dispatch) => {
    const response = await fetch('/api/groups')
    const groups = await response.json()
    dispatch(loadGroups(groups))
}
