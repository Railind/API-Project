import { useSelector } from 'react-redux';

function ListGroups() {
    const groupsObj = useSelector(state => state.groups)
    console.log(groupsObj)
    const groups = Object.values(groupsObj)
    console.log(groups)
    return (
        <>
            <h2>All Groups</h2>
            <ul className="group-list">
                {console.log(groups)}
                {groups.map((group) => (
                    <p key={group.id}>{group.name}</p>
                ))}
            </ul>
        </>
    );
}

export default ListGroups;
