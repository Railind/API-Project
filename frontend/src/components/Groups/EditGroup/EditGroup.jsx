import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom"
// import { useSelector } from "react-redux";
import { thunkGroupEditor } from "../../../store/groups";

const EditGroup = () => {

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
        <section className="new-group">
            <p>new group :D</p>
            <form onSubmit={submitForm}>
                <input
                    type="text"
                    name="name"
                    id="group-name"
                    placeholder="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
                <input
                    type="text"
                    name="city"
                    id="group-city"
                    placeholder="City-Name"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                />

                <select
                    name="state"
                    id="group-state"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                >
                    <option value="WE">Worlds Edge</option>
                    <option value="OL">Olypmus</option>
                    <option value="KC">Kings Canyon</option>
                    <option value="SP">Storm Point</option>
                    <option value="BM">Broken Moon</option>
                </select>

                <select
                    name="privacy"
                    id="group-privacy"
                    value={privacy}
                    onChange={(e) => setPrivacy(e.target.value)}
                >
                    <option value={false}>False</option>
                    <option value={true}>True</option>

                </select>


                <textarea
                    type="text"
                    name="name"
                    id="group-name"
                    placeholder="Description"
                    value={about}
                    onChange={(e) => setAbout(e.target.value)}


                ></textarea>
                <p>In-Person or Online?</p>


                <select
                    name="type"
                    id="group-type"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                >
                    <option value="In person">In person</option>
                    <option value="Online">Online</option>
                </select>


                <div>
                    <button type="submit">Submit Group</button>
                </div>
            </form>
        </section>

    )
}


export default EditGroup
