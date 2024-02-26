// import { useState } from "react";
import { useDispatch } from "react-redux";
import { thunkEventDeleter } from "../../../store/events";
import { useNavigate } from "react-router-dom";
import { useModal } from "../../../context/Modal";
import { useParams } from "react-router-dom";


// -------------------------------------
const DeleteEvent = ({ event }) => {
    const { eventId } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const closeModal = useModal().closeModal; // Ensure closeModal is retrieved correctly

    const deleteHandler = async () => {
        try {
            await dispatch(thunkEventDeleter(eventId));
            closeModal(); // Call closeModal function
            navigate(`/groups/${event.groupId}`);
        } catch (error) {
            console.error('Error deleting event:', error);
        }
    };

    const cancelHandler = () => {
        closeModal();
    };

    return (
        <div className='delete-group'>
            <h1>Confirm Delete</h1>
            <h3>Are you sure you want to remove this event?</h3>
            <button id="delete-button" onClick={deleteHandler}>Yes (Delete Group)</button>
            <button id="cancel-button" onClick={cancelHandler}>No (Keep Group)</button>
        </div>
    );
};

export default DeleteEvent
