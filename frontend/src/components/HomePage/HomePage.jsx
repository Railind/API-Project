//
import './HomePage.css'
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import EventImage from './HomeImages/GroupsImage.png'
import GroupImage from './HomeImages/GroupsImageTwo.png'
import GroupTwoImage from './HomeImages/EventImage.png'
import Legends from './HomeImages/Legends.png'


import OpenModalButton from "../OpenModalButton/OpenModalButton";//
import SignupFormModal from "../signup/SignupFormModal";
export default function HomePage() {

    const sessionUser = useSelector((state) => state.session.user)

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
            {/* <h1 className="title">APEX CONNECT</h1> */}
            <div className="header-container">
                <div className="header-info">
                    <h1>The platform where Apex Legends meet their new squad</h1>
                    <h3>Apex Connect aims to allow you to find new groups with similar passions in the outlands to connect with, bond, and create wonderful memories with.</h3>
                </div>
                <img className="big-image" src={Legends}></img>
            </div>
            <div className="how-works">
                <h2>How ApexConnect Works</h2>
                <h3>Find or make a group for similar passions. Signup or create events for that group.</h3>
            </div>
            <div className="columns-container">
                <div className="column" onClick={allGroups}>
                    <img className="icon" src={EventImage}></img>
                    <h3 className="see-all-groups-btn">See All Groups</h3>
                </div>
                <div className="column" onClick={allEvents}>
                    <img className="icon" src={GroupTwoImage}></img>
                    <h3 className="find-event-btn">Find an Event</h3>
                </div>
                <div className={`columnTwo ${sessionUser ? 'enabled' : 'disabled'}`} onClick={createGroup}>
                    <img className="icon" src={GroupImage}></img>
                    <h3 className={`create-new-group-btn ${sessionUser ? 'teal' : 'grey'}`} >Create a New Group</h3>
                </div>
            </div>
            <div className="join-meetup-btn-container">
                <OpenModalButton className="join-meetup"
                    buttonText="Join Meetup"
                    modalComponent={<SignupFormModal />}
                />
            </div>
        </div >
    );
}
