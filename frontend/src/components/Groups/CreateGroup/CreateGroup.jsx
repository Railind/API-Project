import { useState } from "react";
import { useDispatch } from "react-redux";
// import { useNavigate } from "react-router-dom";
import { thunkGroupCreator } from "../../../store/groups";

const GroupCreationForm = () => {
    // const navigate = useNavigate()
    const dispatch = useDispatch()

    const [name, setName] = useState("")
    // const [about, setabout] = useState("")
    // const [type, setType] = useState("")
    // const [city, setCity] = useState("")
    // const [state, setState] = useState("")
    // const [previewImg, setPreviewImg] = useState("")
    // const [images, setImages] = useState("")


    // const [validationErrors, setValidationErrors] = useState({})



    const submit = async (e) => {
        await dispatch(thunkGroupCreator(newGroup))
    }

    return (
        <section className="new-group">
            <p>new group :D</p>
            <form onSubmit={submit}>
                <input
                    type="text"
                    name="name"
                    id="group-name"
                    placeholder="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
            </form>
        </section>

    )
}


export default GroupCreationForm
