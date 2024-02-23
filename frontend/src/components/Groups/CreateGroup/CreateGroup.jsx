import { useState } from "react";
import { useDispatch } from "react-redux";
// import { useNavigate } from "react-router-dom";
import { thunkGroupCreator } from "../../../store/groups";

const GroupCreationForm = () => {
    // const navigate = useNavigate()
    const dispatch = useDispatch()

    const [name, setName] = useState("")
    const [about, setAbout] = useState("")
    const [type, setType] = useState("")
    const [city, setCity] = useState("")
    const [state, setState] = useState("")
    // const [previewImg, setPreviewImg] = useState("")
    // const [images, setImages] = useState("")
    const [privacy, setPrivacy] = useState("temp")


    // const [validationErrors, setValidationErrors] = useState({})

    const newGroupBody = {
        name,
        about,
        type,
        city,
        state: state.toUpperCase(),
        private: privacy
    }

    const submitForm = async () => {
        console.log(newGroupBody)
        await dispatch(thunkGroupCreator(newGroupBody))
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
                    <option value="WE">Olypmus</option>
                    <option value="KC">Kings Canyon</option>
                    <option value="OL">Storm Point</option>
                    <option value="BM">Broken Moon</option>
                </select>

                <select
                    name="state"
                    id="group-state"
                    value={privacy}
                    onChange={(e) => setPrivacy(e.target.value)}
                >
                    <option value={"false"}>False</option>
                    <option value={"true"}>True</option>

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
                    name="state"
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


export default GroupCreationForm
