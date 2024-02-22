import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';


function ListGroups() {
    const navigate = useNavigate()
    const groupsObj = useSelector(state => state.groups)
    const groups = Object.values(groupsObj)


    //Testing the edit feature using these
    // const currentUser = useSelector(state => state.currentUser)


    // const ownerCheck = (group) => {
    //     return group.ownerId === currentUser.id
    // }

    return (
        <>
            <h2>All Groups</h2>
            <ul className="group-list">
                {groups.map((group) => (
                    <li key={group.id}>
                        <p>{group.name}</p>
                        <div>
                            <button onClick={() => navigate(`/groups/${group.id}/edit`)}>
                                Update
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
        </>
    );
}

export default ListGroups;
