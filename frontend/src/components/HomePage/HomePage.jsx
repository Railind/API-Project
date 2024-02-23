//
import { useNavigate } from "react-router-dom";
// import { useSelector } from "react-redux";
//
//
//
// import { useModal } from "../../context/Modal";

export default function HomePage() {

    // const user = useSelector((state) => state.session.user)

    const navigate = useNavigate()

    const allGroups = () => {
        navigate('/groups')
    }


    const allEvents = () => {
        navigate('/events')
    }

    const createGroup = () => {
        navigate('/groups/new')
    }


    return (
        < div className="homePage" >


            <h1>Groups in the Outlands</h1>
            <div className="Apex buttons">
                <div className="group-finder" onClick={allGroups}>
                    <p>Click to see all events</p>
                </div>
            </div >


            <h1>Events in the Outlands</h1>
            <div className="Apex buttons">
                <div className="group-finder" onClick={allEvents}>
                    <p>Click to see all groups</p>
                </div>
            </div >


            <h1>Create a new Group</h1>
            <div className="Group Maker">
                <div className="group-creator" onClick={createGroup}>
                    <p>Click to see all groups</p>
                </div>
            </div >
        </div >
    );
}
