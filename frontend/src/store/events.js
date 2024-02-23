import { csrfFetch } from "./csrf";

export const CREATE_EVENT = 'events/CREATE_EVENTS'
export const DELETE_EVENT = 'events/DELETE_EVENTS'
export const UPDATE_EVENT = 'events/UPDATE_EVENTS'
export const LOAD_EVENTINFO = 'events/LOAD_EVENTS'




export const createEvent = (event) => ({
    type: CREATE_EVENT,
    event
})

export const editGroup = (eventId, event) => ({
    type: EDIT_GROUP,
    eventId,
    event
})

export const deleteEvent = (eventId) => ({
    type: DELETE_EVENT,
    eventId,
})

export const thunkingEvents = () => async (dispatch) => {
    const response = await fetch('/api/events')
    const events = await response.json()

    if (response.ok) {
        dispatch(loadEvents(events.Events))
    }
}

export const thunkEventCreator = (event) => async (dispatch) => {
    const response = await csrfFetch('/api/groups/${groupId}/events',
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




const eventReducer = (state = {}, action) => {
    switch (action.type) {
        case CREATE_EVENT: {
            const eventState = { ...state };
            eventState[action.event.id] = action.event
            return eventState
        }
        case LOAD_EVENTS: {
            const eventState = { ...state };
            action.events.forEach(event => {
                if (!eventsState[event.id]) {
                    eventState[event.id] = event;
                }
            });
            return eventState;
        }
        case LOAD_EVENT_INFORMATION: {
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

export default eventReducer
