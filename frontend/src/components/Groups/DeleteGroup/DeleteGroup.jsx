import { useDispatch } from "react-redux";
// import { UseSelector } from "react-redux";
import { thunkGroupDeleter } from "../../../store/groups";
// import { thunkEventDeleter } from "../../../store/events";
import { useNavigate, useParams } from "react-router-dom"
import { useModal } from "../../../context/Modal";

const DeleteGroup = () => {
    const { groupId } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { closeModal } = useModal();
    // const events = useSelector(state => state.events)

    const deleteHandler = async () => {
        try {
            await dispatch(thunkGroupDeleter(groupId));

            // const groupEvents = Object.values(events).filter(event => event.groupId === groupId)
            // for (const event of groupEvents) {
            //     await dispatch(thunkEventDeleter(event.id));
            // }

            //We'll worry about deleting associated events in the future
            closeModal();
            navigate('/groups');
        } catch (error) {
            console.error('Error deleting group:', error);
        }
    };

    const cancelHandler = () => {
        closeModal();
    };

    return (
        <div className='delete-group'>
            <h1>Confirm Delete</h1>
            <h3>Are you sure you want to delete this group?</h3>
            <button id="delete-button" onClick={deleteHandler}>Yes (Delete Group)</button>
            <button id="cancel-button" onClick={cancelHandler}>No (Keep Group)</button>
        </div>
    );
};

export default DeleteGroup;
