import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
// import { useNavigate } from 'react-router-dom';

function ListEvents() {
    // const navigate = useNavigate()
    // const eventsState = useSelector(state => state.events);
    const eventsObj = useSelector(state => state.events)
    const events = Object.values(eventsObj)

    console.log(events, 'our events :3')

    events.map((event) => {
        console.log(event.previewImage)
    })
    //Testing the edit feature using these
    // const currentUser = useSelector(state => state.currentUser)


    // const ownerCheck = (group) => {
    //     return group.ownerId === currentUser.id
    // }
    return (
        <>
            <div>
                <h1>Events</h1>
                <h1>Groups</h1>
            </div>
            <h2>Events in Meetup</h2>

            <ul className="group-list">
                {events.map((event) => {
                    <li key={event.id}>
                        <Link to={`/events/${event.id}`}>
                            <img className='event-image' src={event.previewImage} alt="" />
                            <p>{event.name}</p>
                            <p>{event.startDate}</p>
                            <p>{event.endDate}</p>
                            <p>{event.previewImage}</p>
                        </Link>
                    </li>
                })}
            </ul>
            <ul className="event-list">
                {events.map((event) => (
                    <li key={event.id}>
                        <Link to={`/events/${event.id}`}>
                            <img className='event-image' src={event.previewImage} alt="" />
                            <p>{event.name}</p>
                            <p>{event.startDate}</p>
                            <p>{event.endDate}</p>
                        </Link>
                    </li>
                ))}
            </ul>
        </>
    );
}

export default ListEvents;
