import './ListGroupInfo.css';
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
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { groupId } = useParams();
    const groups = useSelector(state => state.groups);
    const group = groups[groupId];

    const user = useSelector(state => state.session.user);

    useEffect(() => {
        if (!group?.Organizer) dispatch(thunkGroupInfo(groupId));
    }, [dispatch, groupId, group?.Organizer]);

    useEffect(() => {
        if (!group?.Members) dispatch(thunkGroupMemberLoader(groupId));
    }, [dispatch, groupId, group?.Members, user]);

    useEffect(() => {
        dispatch(thunkGroupEventLoader(groupId));
    }, [dispatch, groupId]);

    if (!group) {
        return <p> Group not found!</p>
    }

    const organizerId = group.organizerId;
    const organizer = group.Members?.[organizerId] || {};

    const events = group.Events || [];
    console.log(events, 'events')
    const currentTime = new Date();
    const upcomingEvents = events.filter(event => new Date(event.startDate) >= currentTime);
    const pastEvents = events.filter(event => new Date(event.startDate) < currentTime);

    const ownerCheck = user?.id === group.organizerId;

    return <>
        <div className="group-info-container">
            <div className="group-info-content">
                <div className="groupOrganizer">
                    <div className='return-to-groupsView'>
                        <Link id='back-to-groups' to={'/groups'}>Back to Groups</Link>
                    </div>
                    <div className="groupPanel">
                        <img className='group-image' src={group.previewImage} alt="" />
                        <div className='infoandbuttons'>
                            <h2>{group.name}</h2>
                            <h3>{group.city}</h3>
                            <h3>{group.state}</h3>
                            <h4>{events?.length ? events?.length : 0} events · {group?.private ? "Private" : "Public"}</h4>
                            <h4>Organized by {organizer?.firstName} {organizer?.lastName}</h4>
                            <h3>What we&rsquo;re about</h3>
                            <p>{group.about}</p>
                            <div className="buttonsDiv">
                                <div className="buttonDiv">
                                    {(!ownerCheck) && (user) && <button id="join-group" onClick={() => alert('Feature Coming Soon...')}>Join this group</button>}
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
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div className="events-info-container">
            <div className="events-area">
                <div className="upcoming-events" style={{ display: upcomingEvents.length > 0 ? 'block' : 'none' }}>
                    <h3 className="eventTitle">Upcoming Events({upcomingEvents.length})</h3>
                    {upcomingEvents.map(event => (
                        <div key={event.id} className="event">
                            <h3>{event.name}</h3>
                            <img className="event-img" src={event.previewImage} alt="Event" />
                            <p>Attendees: {event.numAttending}</p>
                            <p>Start Date: {new Date(event.startDate).toLocaleDateString()}</p>
                            <p>End Date: {new Date(event.endDate).toLocaleDateString()}</p>
                        </div>
                    ))}
                </div>
                <div className="past-events" style={{ display: pastEvents.length > 0 ? 'block' : 'none' }}>
                    <h3 className="eventTitle">Past Events ({pastEvents.length})</h3>
                    {pastEvents.map(event => (
                        <div key={event.id} className="event">
                            <h2>{event.name}</h2>
                            <img className="event-img" src={event.previewImage} alt="Event" />
                            <p>Attendees: {event.numAttending}</p>
                            <p>Start Date: {new Date(event.startDate).toLocaleDateString()}</p>
                            <p>End Date: {new Date(event.endDate).toLocaleDateString()}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </>
}

export default ListGroupInfo;
