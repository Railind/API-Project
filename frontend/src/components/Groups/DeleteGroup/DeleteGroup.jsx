// import { useState } from "react";
import { useDispatch } from "react-redux";
// import { useNavigate } from "react-router-dom";
import { thunkGroupDeleter } from "../../../store/groups";
import { useNavigate } from "react-router-dom";


const DeleteGroup = ({ groupId }) => {
    const dispatch = useDispatch()
    const navigate = useNavigate()

    console.log(groupId, 'This is our DELETED group ID')



    const deleteHandler = async (e) => {
        e.preventDefault()
        dispatch(thunkGroupDeleter(groupId))
        navigate('/groups')
    }


    return <div className='delete-group'>
        <p> Do you want to Delete this group?</p>
        <button onClick={deleteHandler}>Confirm</button>
    </div>
}

export default DeleteGroup