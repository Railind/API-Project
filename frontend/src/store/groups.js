import { csrfFetch } from "./csrf"


export const LOAD_GROUPS = 'groups/LOAD_GROUPS'
export const LOAD_GROUP_INFORMATION = 'groups/LOAD_GROUP_INFORMATION'
export const EDIT_GROUP = 'groups/EDIT_GROUP'
export const DELETE_GROUP = 'groups/DELETE_GROUP'
export const CREATE_GROUP = 'groups/CREATE_GROUP'
export const ADD_GROUP_IMAGES = 'groups/ADD_GROUP_IMAGES'
export const ADD_GROUP_PREVIEW_IMAGE = 'groups/ADD_GROUP_PREVIEW_IMAGE'
export const LOAD_GROUP_EVENTS = 'groups/LOAD_GROUP_EVENTS'
export const LOAD_GROUP_MEMBERS = 'groups/LOAD_GROUP_MEMBERS'

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
    type: CREATE_GROUP,
    group
})

export const addGroupImages = (groupId, images) => ({
    type: ADD_GROUP_PREVIEW_IMAGE,
    groupId,
    images
})

export const addGroupPreviewImage = (groupId, image) => ({
    type: ADD_GROUP_PREVIEW_IMAGE,
    groupId,
    image
})

export const loadGroupEvents = (groupId, events) => ({
    type: LOAD_GROUP_EVENTS,
    groupId,
    events
})

export const loadGroupMembers = (groupId, members) => ({
    type: LOAD_GROUP_MEMBERS,
    groupId,
    members
})


export const thunkingGroup = () => async (dispatch) => {
    const response = await fetch('/api/groups')
    const groups = await response.json()
    dispatch(loadGroups(groups))
}

export const thunkGroupInfo = (groupId) => async (dispatch) => {
    const response = await csrfFetch(`/api/groups/${groupId}`)
    const group = await response.json()
    dispatch(thunkGroupInfo(group))
    return group;
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
    // else return error = await response.json()
}



export const thunkGroupDeleter = (groupId) => async (dispatch) => {
    const response = await csrfFetch(`/api/groups/${groupId}`,
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
        dispatch(deleteGroup(groupId))
        return message
    }
    // else return error = await response.json()

}

export const thunkGroupAddImages = (groupId, images) => async (dispatch) => {
    const formData = new FormData();
    Array.from(images).forEach(image => formData.append('images', image))

    const response = await csrfFetch(`/api/groups/${groupId}/images`, {
        method: 'POST',
        body: formData
    })

    if (response.ok) {
        const newImages = await response.json()
        //We'll delete events later
        await dispatch(addGroupPreviewImage(groupId, newImages))
        return newImages
    }
    else return response
}

export const thunkGroupAddPreviewImage = (groupId, image) => async (dispatch) => {
    const formData = new FormData();
    formData.append('previewImage', image)

    const response = await csrfFetch(`/api/groups/${groupId}/prviewImage`, {
        method: 'POST',
        body: formData
    })

    if (response.ok) {
        const newImage = await response.json()
        //We'll delete events later
        await dispatch(addGroupPreviewImage(groupId, newImage))
        return newImage
    }
    else return response
}

export const thunkGroupEventLoader = (groupId) => async (dispatch) => {
    const response = await csrfFetch(`/api/groups/${groupId}/events`)
    if (response.ok) {
        const events = await response.json()
        dispatch(loadGroupEvents(groupId, events))
        return events
    }
    else return response.json()

}

export const thunkGroupMemberLoader = (groupId) => async (dispatch) => {
    const response = await csrfFetch(`/api/groups/${groupId}/members`)

    if (response.ok) {
        const members = await response.json()
        dispatch(loadGroupMembers(groupId, members))
        return members
    }
    else return response.json()

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
        case ADD_GROUP_IMAGES: {
            return {
                ...state, [action.groupId]: {
                    ...state[action.groupId], Events: action.events.Events
                }
            }
        }
        case ADD_GROUP_PREVIEW_IMAGE: {
            return {
                ...state,
                [action.groupId]: {
                    ...state[action.groupId],
                    GroupImages: [...state[action.groupId].GroupImages, action.image]
                }
            };
        }
        case LOAD_GROUP_EVENTS: {
            return {
                ...state, [action.groupId]: {
                    ...state[action.groupId], Events: action.events.Events
                }
            }
        }
        case LOAD_GROUP_MEMBERS: {
            const Members = {}
            action.members.Members.forEach(member => {
                Members[member.id] = member
            })

            return {
                ...state, [action.groupId]: {
                    ...state[action.groupId], Members
                }
            }
        }
        default:
            return state;
    }
};

export default groupReducer
