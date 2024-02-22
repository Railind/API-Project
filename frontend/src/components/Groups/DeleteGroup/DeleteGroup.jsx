// import { useState } from "react";
import { useDispatch } from "react-redux";
// import { useNavigate } from "react-router-dom";
import { thunkGroupDeleter } from "../../../store/groups";
import { useNavigate } from "react-router-dom";


const DeleteGroup = ({ group }) => {
    const dispatch = useDispatch()
    const navigate = useNavigate




    const deleteHandler = async (e) => {
        e.preventDefault()
        dispatch(thunkGroupDeleter(group))
        navigate('/groups')
    }


    return <div className='delete-group'>
        <p> Do you want to Delete this group?</p>
        <button onClick={deleteHandler}>Confirm</button>
    </div>
}

export default DeleteGroup
