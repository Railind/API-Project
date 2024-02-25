import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import { useEffect } from 'react';
import DeleteGroup from '../DeleteGroup/DeleteGroup';

import { thunkGroupEventLoader, thunkGroupMemberLoader, thunkGroupInfo } from '../../../store/groups';
function ListGroupInfo() {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { groupId } = useParams()
    // console.log(groupId, 'this is our groupId')
    const groups = useSelector(state => state.groups)
    const group = groups[groupId]
    const eventsState = useSelector(state => state.events)
    let events = useSelector(state => state.groups[groupId]?.Events)
    const user = useSelector(state => state.session.user)
    const eventCount = Object.values(eventsState).filter(event => event.groupId == groupId).length

    if (!group) {
        return <p> Group not found!</p>
    }
    useEffect(() => {
        if (!group.Organizer) dispatch(thunkGroupInfo(groupId))
    })

    if (!eventsState) return null

    // const isOwner = user?.id == group?.organizerId;
    // let isMember;
    // if (group?.Members) {
    //     const members = Object.values(group?.Members);

    //     isMember = members.filter(member => {
    //         return member.id == user.id
    //     }).length > 0
    // }

    // const ownerCheck = (group) => {
    //     return group.ownerId === currentUser.id
    // }



    // const groupImages = group?.GroupImages || []
    // const previewImage = groupImages.find(image => image.preview === true)
    // console.log(previewImage, 'our image')


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
                    <h4>Organized by {group?.Organizer?.firstName} {group?.Organizer?.lastName}</h4>
                    <p>{group.state}</p>
                    <h3>What we&rsquo;re about</h3>
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
