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


    return (
        < div className="homePage" >


            <h1>Finding friends in the Outlands</h1>
            <div className="Apex buttons">
                <div className="group-finder" onClick={allGroups}>
                    <p>Click to see all groups</p>
                </div>

            </div >
        </div >
    );
}
