import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import DeleteGroup from '../DeleteGroup/DeleteGroup';
function ListGroupInfo() {
    const navigate = useNavigate()
    const { groupId } = useParams()
    console.log(groupId, 'this is our groupId')
    const groups = useSelector(state => state.groups)
    const group = groups[groupId]
    //Testing the edit feature using these
    // const currentUser = useSelector(state => state.currentUser)


    // const ownerCheck = (group) => {
    //     return group.ownerId === currentUser.id
    // }

    if (!group) {
        return <p> Group not found!</p>
    }

    return (
        <>
            <h2>This group</h2>
            <ul className="group-list">
                <li key={group.id}>
                    <p>{group.name}</p>
                    <p>This is details about our group :o</p>
                    <p>{group.city}</p>
                    <p>{group.state}</p>
                    <p>{group.about}</p>


                    <div>
                        <button onClick={() => navigate(`/groups/${group.id}/edit`)}>
                            Update
                        </button>
                    </div>
                    <div>
                        <DeleteGroup />
                    </div>
                </li>

            </ul>
        </>
    );
}

export default ListGroupInfo;
