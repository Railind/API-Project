import './ListGroups.css'
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
// import { useNavigate } from 'react-router-dom';
// import { useEffect } from 'react';
// import { thunkingGroup } from '../../../store/groups';
// import { thunkingEvents } from '../../../store/events';
// import { UseDispatch } from 'react-redux';
function ListGroups() {
    // const navigate = useNavigate()
    const groupsObj = useSelector(state => state.groups)
    const eventsState = useSelector(state => state.events);
    const groups = Object.values(groupsObj)


    //Testing the edit feature using these
    // const currentUser = useSelector(state => state.currentUser)


    // const ownerCheck = (group) => {
    //     return group.ownerId === currentUser.id
    // }
    return (
        <>
            <div className="groups">
                <div className="NavigateButtons">
                    <Link className="eventBttn" to={`/events`} style={{
                        color: 'black',
                        textDecoration: 'none',
                        cursor: 'pointer',
                    }}>
                        <h1 className='eventBttnInterior' >Events</h1>
                    </Link>
                    <h1 style={{
                        color: 'teal',
                        textDecoration: 'underline',
                    }}>Groups</h1>
                </div>
                <h2>Groups in Meetup</h2>
                <div className="group-list">
                    {groups.map((group) => {
                        const groupEvents = Object.values(eventsState).filter(event => event.groupId === group.id);
                        return (
                            <li key={group.id} className='singleGroup'>
                                <Link to={`/groups/${group.id}`}>
                                    <div className='group-info'>
                                        <p>{group.name}</p>
                                        <p>{group.city}, {group.state}</p>
                                        <p>{group.about}</p>
                                        <h4>{groupEvents.length} events · {group.private ? "Private" : "Public"}</h4>
                                    </div>
                                    <img className='group-image' src={group.previewImage} alt="" />
                                </Link>
                            </li>
                        );
                    })}
                </div>
            </div>
        </>
    );
}

export default ListGroups;
