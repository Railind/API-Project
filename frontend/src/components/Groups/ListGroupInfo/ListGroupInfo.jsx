import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import { useEffect } from 'react';
import DeleteGroup from '../DeleteGroup/DeleteGroup';
import OpenModalButton from '../../OpenModalButton/OpenModalButton';
// import { thunkGroupEventLoader, thunkGroupMemberLoader, thunkGroupInfo } from '../../../store/groups';
import { thunkGroupEventLoader, thunkGroupInfo, thunkGroupMemberLoader } from '../../../store/groups';
function ListGroupInfo() {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { groupId } = useParams()
    const groups = useSelector(state => state.groups)
    const group = groups[groupId]

    const user = useSelector(state => state.session.user)

    const eventsState = useSelector(state => state.events)
    let events = useSelector(state => state.groups[groupId]?.Events)
    const eventCount = Object.values(eventsState).filter(event => event.groupId == groupId).length
    const organizerId = group.organizerId;

    useEffect(() => {
        if (!group?.Organizer) dispatch(thunkGroupInfo(groupId));

        return () => null;
    }, [dispatch, groupId, group?.Organizer]);

    useEffect(() => {
        if (!group?.Members) dispatch(thunkGroupMemberLoader(groupId));

        return () => null;
    }, [dispatch, groupId, group?.Members, user]);

    useEffect(() => {
        if (!group?.Events) dispatch(thunkGroupEventLoader(groupId))

        return () => null;
    }, [dispatch, groupId, eventCount, group?.Events])
    if (!group) {
        return <p> Group not found!</p>
    }

    const organizer = group?.Members?.[organizerId];
    console.log(organizer)

    const upcomingEvents = []
    const pastEvents = []


    const currentTime = new Date()
    if (events) {
        events.sort((a, b) => new Date(a.startDate) - new Date(b.startDate))

        events.forEach(event => {
            if (new Date(event.startDate) < currentTime) {
                pastEvents.push(event);
            } else {
                upcomingEvents.push(event);
            }
        })
    }


    console.log('All events', events)
    console.log('New events', pastEvents)
    console.log('Past events', upcomingEvents)

    const ownerCheck = user?.id == group?.organizerId;


    // const ownerCheck = (group) => {
    //     return user && group.ownerId === user.id
    // }

    group?.GroupImages || []
    // const previewImage = groupImages.find(image => image.preview === true)
    // console.log(previewImage, 'our image')
    if (!group) {
        return <p> Group not found!</p>
    }


    return (
        <>
            <div className='return-to-groupsView'>
                <Link id='back-to-groups' to={'/groups'}>Back to Groups</Link>
            </div>
            <div>
                <img className='group-image' src={group.previewImage} alt="" />
            </div>


            <h2>This group</h2>
            <ul className="group-list">
                <li key={group.id}>
                    <p>This is details about our group :o</p>
                    <p>{group.name}</p>
                    <p>{group.city}</p>
                    <h4>{events?.length ? events?.length : 0} events · {group?.private ? "Private" : "Public"}</h4>
                    <h4>Organized by {organizer?.firstName} {organizer?.lastName}</h4>
                    <p>{group.state}</p>
                    <h3>What we&rsquo;re about</h3>
                    <p>{group.about}</p>


                    <div className="buttonDiv">
                        {(!ownerCheck) && <button id="join-group" onClick={() => alert('Feature Coming Soon...')}>Join this group</button>}
                    </div>
                    {(ownerCheck) && <div className="OwnersButtons">
                        <button onClick={() => navigate(`/groups/${group.id}/events/new`)}>
                            New Event
                        </button>
                        <button onClick={() => navigate(`/groups/${group.id}/edit`)}>
                            Update
                        </button>
                        <OpenModalButton
                            buttonText="Delete"
                            modalComponent={<DeleteGroup group={group} />}
                        />
                    </div>}
                    <div className="events-area">
                        <div className="upcoming-events" style={{ display: upcomingEvents.length > 0 ? 'block' : 'none' }}>
                            <h3>Upcoming Events({upcomingEvents.length})</h3>
                            {pastEvents.map(event => (
                                <div key={event.id} className="event">
                                    <img src={event.previewImage} alt="Event" />
                                    <p>Attendees: {event.numAttending}</p>
                                    <p>Start Date: {new Date(event.startDate).toLocaleDateString()}</p>
                                    <p>End Date: {new Date(event.endDate).toLocaleDateString()}</p>
                                </div>
                            ))}
                        </div>
                        <div className="past-events" style={{ display: pastEvents.length > 0 ? 'block' : 'none' }}>
                            <h3>Past Events ({pastEvents.length})</h3>
                            {pastEvents.map(event => (
                                <div key={event.id} className="event">
                                    <img src={event.previewImage} alt="Event" />
                                    <p>Attendees: {event.numAttending}</p>
                                    <p>Start Date: {new Date(event.startDate).toLocaleDateString()}</p>
                                    <p>End Date: {new Date(event.endDate).toLocaleDateString()}</p>
                                </div>
                            ))}
                        </div>


                    </div>
                </li>

            </ul>
        </>
    );
}

export default ListGroupInfo;
