import { csrfFetch } from "./csrf";
import { ADD_GROUP_PREVIEW_IMAGE } from "./groups";


export const LOAD_EVENTS = 'events/LOAD_EVENTS'
export const LOAD_EVENT_INFORMATION = 'events/LOAD_EVENT_INFORMATION'
export const CREATE_EVENT = 'events/CREATE_EVENTS'
export const DELETE_EVENT = 'events/DELETE_EVENTS'
export const UPDATE_EVENT = 'events/UPDATE_EVENTS'
export const CREATE_EVENT_IMAGE = 'events/CREATE_EVENT_IMAGE'
// export const EDIT_GROUP = 'events/'



export const loadEvents = (events) => ({
    type: LOAD_EVENTS,
    events
})

export const loadEventInformation = (event) => ({
    type: LOAD_EVENT_INFORMATION,
    event
})

export const createEvent = (event) => ({
    type: CREATE_EVENT,
    event
})

// export const editGroup = (eventId, event) => ({
//     type: EDIT_GROUP,
//     eventId,
//     event
// })

export const deleteEvent = (eventId) => ({
    type: DELETE_EVENT,
    eventId,
})

export const createEventPreview = (eventId, image) => ({
    type: CREATE_EVENT_IMAGE,
    eventId,
    image
})

export const thunkingEvents = () => async (dispatch) => {
    const response = await fetch('/api/events')
    const eventsInfo = await response.json()

    if (response.ok) {
        dispatch(loadEvents(eventsInfo.Events))
    }
}

export const thunkEventLoadInformation = (eventId) => async (dispatch) => {
    const response = await csrfFetch(`/api/events/${eventId}`)
    const event = await response.json()

    if (response.ok) dispatch(loadEventInformation(event))
}

export const thunkEventDeleter = (eventId) => async (dispatch) => {
    const response = await csrfFetch(`/api/events/${eventId}`,
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
        dispatch(deleteEvent(eventId))
        return message
    }
    // else return error = await response.json()

}


export const thunkEventCreator = (groupId, event) => async (dispatch) => {
    const response = await csrfFetch(`/api/groups/${groupId}/events`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(event)
        })
    if (response.ok) {
        const event = await response.json()
        dispatch(createEvent(event))
        return event
    } else throw response
}

export const thunkCreateEventPreview = (eventId, image) => async (dispatch) => {
    const formData = new FormData()
    formData.append('image', image)

    const response = await csrfFetch(`/api/events/${eventId}/images`, {
        method: 'POST',
        body: formData
    })

    if (response.ok) {
        const resImage = await response.json()
        await dispatch(createEventPreview(eventId, resImage))
        return resImage;
    } else throw response
}


const eventReducer = (state = {}, action) => {
    switch (action.type) {
        case CREATE_EVENT: {
            const eventState = { ...state };
            eventState[action.event.id] = action.event
            return eventState
        }
        case LOAD_EVENT_INFORMATION: {
            return {
                ...state,
                [action.event.id]: action.event
            };
        }
        case DELETE_EVENT: {
            const eventState = { ...state };
            delete eventState[action.eventId]
            return eventState
        }
        case LOAD_EVENTS: {
            const eventState = { ...state };
            action.events.forEach(event => {
                eventState[event.id] = event;
            });
            return eventState;
        }
        case ADD_GROUP_PREVIEW_IMAGE: {
            if (state[action.eventId].EventImages) {
                return {
                    ...state,
                    [action.eventId]: {
                        ...state[action.eventId],
                        EventImages: [
                            ...state[action.eventId].EventImages,
                            action.image
                        ]
                    }
                }
            } else {
                return {
                    ...state,
                    [action.eventId]: {
                        ...state[action.eventId],
                        EventImages: [
                            action.image
                        ]
                    }
                }
            }
        }
        default:
            return state;
    }
};

export default eventReducer
