
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

const ListGroupInfo = ({ groupId }) => {
    const group = useSelector(state => state.groups[groupId])

    if (!group) return null;
    let previewImage;
    if (group.previewImage) previewImage = group.previewImage
    if (!group.previewImage && group.GroupImages) previewImage = group.GroupImages.find(image => image.preview == true).url
    // if (group.GroupImages) previewImage = group.GroupImages.find(image => image.preview === true)

    return (
        <li>
            <Link to={`/groups/${group.id}`}>
                <div className="group-list-item">
                    <div className='group-list-image-div'>
                        <img className='group-list-image' src={previewImage} alt="" />
                    </div>
                    <div className="group-list-info">
                        <h2>{group.name}</h2>
                        <h4>{group.city}, {group.state}</h4>
                        <p>{group.about}</p>
                        <div className="group-list-item-lowest-container">
                            <div className="group-events-type-container">
                                <span> · </span>
                                <span>{group.private ? "Private" : "Public"}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </Link>
        </li>
    );
}

export default ListGroupInfo;
