import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
// import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { thunkEventLoadInformation } from '../../../store/events';
// import DeleteEvent from '../DeleteEvent/DeleteEvent';
function ListEventInfo() {
    // const navigate = useNavigate()
    const { eventId } = useParams()
    const dispatch = useDispatch()
    console.log(eventId, 'this is our groupId')
    const events = useSelector(state => state.events)
    const event = events[eventId]
    //Testing the edit feature using these



    useEffect(() => {
        if (eventId && !event?.description) {
            dispatch(thunkEventLoadInformation(eventId));
        }
    }, [dispatch, eventId, event?.description]);
    // const ownerCheck = (group) => {
    //     return group.ownerId === currentUser.id
    // }
    // event?.EventImages || []


    if (!event) {
        return <p> Event not found!</p>
    }

    return (
        <>
            <div className='return-to-groupsView'>
                <Link id='back-to-groups' to={'/events'}>Back to Events</Link>
            </div>
            <img className='event-image' src={event.previewImage} alt="" />

            <h2>This event</h2>
            <ul className="group-list">
                <li key={event.id}>
                    <p>{event.name}</p>
                    <p>This is details about our event :o</p>
                    <p>{event.description}</p>
                    <p>{event.type}</p>
                    <p>{event.price}</p>
                    <p>{event.startDate}</p>
                    <p>{event.endDate}</p>


                    {/* <div>
                        <button onClick={() => navigate(`/events/${event.id}/edit`)}>
                            Update
                        </button>
                    </div>
                    <div>
                        <DeleteEvent />
                    </div> */}
                </li>

            </ul>
        </>
    );
}

export default ListEventInfo;
