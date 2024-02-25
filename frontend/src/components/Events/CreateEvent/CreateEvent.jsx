import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
// import { useNavigate } from "react-router-dom";
import { thunkEventCreator } from "../../../store/events";
import { useParams } from "react-router-dom";

const EventCreationForm = () => {
    const dispatch = useDispatch()
    // const navigate = useNavigate()

    const { groupId } = useParams()
    const [name, setName] = useState("")
    const [type, setType] = useState("In person")
    // const [capacity, setCapacity] = useState("")
    const [price, setPrice] = useState("")
    const [startDate, setStartDate] = useState("")
    const [endDate, setEndDate] = useState("")
    const [description, setDescription] = useState("")
    // const [images, setImages] = useState(null)
    const [previewImage, setPreviewImage] = useState(null)

    const group = useSelector((state) => state.groups[groupId])

    // const [previewImg, setPreviewImg] = useState("")
    // const [images, setImages] = useState("")


    // const [validationErrors, setValidationErrors] = useState({})

    const newEventBody = {
        name,
        type,
        capacity: 50,
        price,
        startDate,
        endDate,
        previewImage,
        description,
    }

    const submitForm = async (e) => {
        e.preventDefault()
        console.log(newEventBody)
        console.log('newDate', new Date())
        console.log(groupId)
        await dispatch(thunkEventCreator(newEventBody))
    }

    return (
        <section className="new-group">
            <form onSubmit={submitForm}>
                <h1>Create a new event for {group?.name}</h1>
                <input
                    type="text"
                    name="event-name"
                    id="event-name"
                    placeholder="Event Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
                <select
                    name="type"
                    id="event-type"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                >
                    <option value="In person">In person</option>
                    <option value="Online">Online</option>
                </select>
                <input
                    type="text"
                    name="price"
                    id="event-price"
                    placeholder="0.00"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                />
                <input
                    type="datetime-local"
                    value={startDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setStartDate(e.target.value)}
                />
                {/* {"startDate" in validationErrors && (
                    <p className="errors">{validationErrors.startDate}</p>
                )} */}
                <label htmlFor="">
                    <p>When does your event end?</p>
                </label>
                <input
                    type="datetime-local"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                />
                <input
                    type="url"
                    id='event-imageUrl'
                    name='imageUrl'
                    placeholder='Image URL'
                    value={previewImage}
                    onChange={e => setPreviewImage(e.target.value)}
                />
                <p>Please describe your event: </p>
                <textarea
                    type="text"
                    name="description"
                    id="event-description"
                    placeholder="Please include at least 30 characters"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}


                ></textarea>
                <div>
                    <button type="submit">Submit Event</button>
                </div>
            </form>
        </section>

    )
}


export default EventCreationForm
