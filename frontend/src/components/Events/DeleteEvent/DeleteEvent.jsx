// import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { thunkEventDeleter } from "../../../store/events";
import { useNavigate } from "react-router-dom";


const DeleteEvent = ({ event }) => {
    const dispatch = useDispatch()
    const navigate = useNavigate()

    // console.log(event.id, 'This is our DELETED event ID')

    const group = useSelector(state => state.groups[event.groupId])
    console.log(group, 'this is our group')
    const groupId = group ? group.id : null;

    const deleteHandler = async (e) => {
        e.preventDefault()
        dispatch(thunkEventDeleter(event.id))
        navigate(`/groups/${groupId}`)
    }


    return <div className='delete-group'>
        <p> Do you want to Delete this event?</p>
        <button onClick={deleteHandler}>Confirm</button>
    </div>
}

export default DeleteEvent
