import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom"
// import { useSelector } from "react-redux";
import { thunkGroupEditor } from "../../../store/groups"
// import { UseSelector } from "react-redux";;

const EditGroup = () => {

    // const sessionUser = useSelector((state) => state.session.user);
    // const groupObj = useSelector((state) => state)
    // const group = Object.values(groupObj);

    const navigate = useNavigate()
    const dispatch = useDispatch()
    const [name, setName] = useState("")
    const [about, setAbout] = useState("")
    const [type, setType] = useState("Online")
    const [city, setCity] = useState("")
    const [state, setState] = useState("WE")
    const [privacy, setPrivacy] = useState(false)
    const { groupId } = useParams()
    // console.log(groupId)
    // const group = useSelector(state => state.groups[groupId])
    // const user = useSelector(state => state.session.user)

    // const [previewImg, setPreviewImg] = useState("")
    // const [images, setImages] = useState("")


    // const [validationErrors, setValidationErrors] = useState({})


    // const ownerCheck = group?.organizerId === user?.id
    // if (!ownerCheck) navigate('/')




    const updatedGroupBody = {
        groupId,
        name,
        about,
        type,
        city,
        state: state.toUpperCase(),
        private: privacy
    }



    const submitForm = async (e) => {
        e.preventDefault()
        // console.log(updatedGroupBody)
        await dispatch(thunkGroupEditor(groupId, updatedGroupBody))
        setTimeout(() => {
            navigate('/groups')
        },
            500)
    }

    return (
        <section className="updated-group">
            <h1>Update Your Group</h1>
            <h3>Set your group&apos;s location</h3>
            <h4>Meetup groups meet locally, in person, and online. Wel&apos;ll connect you with the people in your area</h4>
            <form onSubmit={submitForm}>
                <input
                    type="text"
                    name="city"
                    id="group-city"
                    placeholder={city}
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                />

                <select
                    name="state"
                    id="group-state"
                    placeholder="STATE"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                >
                    <option value="WE">Worlds Edge</option>
                    <option value="OL">Olypmus</option>
                    <option value="KC">Kings Canyon</option>
                    <option value="SP">Storm Point</option>
                    <option value="BM">Broken Moon</option>
                </select>
                <h4>What will your group&apos;s name be?</h4>
                <p>Choose a name that will give people a clear idea of what the group is about. Feel free to get creative! You can edit this later if you change your mind</p>
                <input
                    type="text"
                    name="name"
                    id="group-name"
                    placeholder="What is your group name?"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
                <h4>Describe the purpose of your group.</h4>


                <p>People will see this when we promote your group, but you&apos;ll be able to add to it later, too</p>

                <p>1. What&apos;s the purpose of the group?</p>
                <p>2. Who should join?</p>
                <p>3. What will you do at your events?</p>

                <textarea
                    type="text"
                    name="description"
                    id="group-name"
                    placeholder="Please write at least 30 characters"
                    value={about}
                    onChange={(e) => setAbout(e.target.value)}


                ></textarea>
                <h4>Final Steps...</h4>
                <p>Is this an in person or an online group?</p>
                <select
                    name="type"
                    id="group-type"
                    placeholder="(select one)"

                    value={type}
                    onChange={(e) => setType(e.target.value)}
                >
                    <option value="In person">In person</option>
                    <option value="Online">Online</option>
                </select>

                <p>Is this group private or pbulic?</p>
                <select
                    name="privacy"
                    id="group-privacy"
                    placeholder="(select one)"

                    value={privacy}
                    onChange={(e) => setPrivacy(e.target.value)}
                >
                    <option value={false}>False</option>
                    <option value={true}>True</option>

                </select>


                <div>
                    <button type="submit">Create Group</button>
                </div>
            </form>
        </section>

    )
}


export default EditGroup
