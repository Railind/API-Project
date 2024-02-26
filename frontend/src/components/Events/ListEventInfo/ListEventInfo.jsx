import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
// import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { thunkEventLoadInformation } from '../../../store/events';
import { thunkGroupInfo } from '../../../store/groups';
import DeleteEvent from '../DeleteEvent/DeleteEvent';
import OpenModalButton from '../../OpenModalButton/OpenModalButton';
// import DeleteEvent from '../DeleteEvent/DeleteEvent';
function ListEventInfo() {
    // const navigate = useNavigate()
    const { eventId } = useParams()
    const dispatch = useDispatch()
    // console.log(eventId, 'this is our groupId')
    const sessionUser = useSelector(state => state.session.user)
    const event = useSelector(state => state.events[eventId])
    const group = useSelector(state => state.groups[event?.groupId])
    //Testing the edit feature using these
    // const ownerCheck = user?.id == group?.organizerId;
    const organizerButtons = (!sessionUser || group.length === 1 && sessionUser.id !== group[0].Organizer.id) ? "hidden" : null


    console.log(event)

    useEffect(() => {
        if (eventId && !event?.description) {
            dispatch(thunkEventLoadInformation(eventId));
        }
        if (event?.groupId && !group) {
            dispatch(thunkGroupInfo(event.groupId));
        }
    }, [dispatch, eventId, event?.description, event?.groupId, group]);
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
            <div className="group-info">
                <Link to={`/groups/${group.id}`}>
                    {group && (
                        <div>
                            <img className='group-image' src={group.previewImage} alt="" />
                            <p>Group: {group.name}</p>
                            <p>{group.private ? "Private" : "Public"}</p>
                        </div>
                    )}

                </Link>
            </div>
            <ul className="group-list">
                <li key={event.id}>
                    <p>{event.name}</p>
                    <p>This is details about our event :o</p>
                    <p>{event.description}</p>
                    <p>{event.type}</p>
                    <p>{event.price}</p>
                    <p>{event.startDate}</p>
                    <p>{event.endDate}</p>



                    <div className={`${organizerButtons} event-card2-button-container`}>
                        <button className="organizer-button event-button" onClick={() => (alert(`Feature Coming Soon...`))}>Update</button>
                        <OpenModalButton
                            buttonText="Delete"
                            modalComponent={<DeleteEvent event={event} />}
                        />
                        {/* <button className="organizer-button event-button">Delete 2</button> */}
                    </div>


                    {/* {(ownerCheck) && <div className="OrganizerButton">
                        <OpenModalButton
                            buttonText="Delete"
                            modalComponent={<DeleteEvent event={event} />}
                        />
                    </div>} */}
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
