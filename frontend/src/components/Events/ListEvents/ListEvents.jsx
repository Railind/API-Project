import { useSelector } from 'react-redux';
// import { Link } from 'react-router-dom';
// import { useNavigate } from 'react-router-dom';

function ListEvents() {
    // const navigate = useNavigate()
    const eventsObj = useSelector(state => state.events)
    const events = Object.values(eventsObj)


    //Testing the edit feature using these
    // const currentUser = useSelector(state => state.currentUser)


    // const ownerCheck = (group) => {
    //     return group.ownerId === currentUser.id
    // }
    return (
        <>
            <h2>All Events</h2>
            <ul className="event-list">
                {events.map((event) => (
                    <li key={event.id}>
                        <p>{event.name}</p>
                    </li>
                ))}
            </ul>
        </>
    );
}

export default ListEvents;
