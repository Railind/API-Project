// import { useState } from "react";
import { useDispatch } from "react-redux";
// import { useNavigate } from "react-router-dom";
import { thunkGroupDeleter } from "../../../store/groups";
import { useNavigate } from "react-router-dom";


// export function ModalProvider({ children }) {
//     const modalRef = useRef();
//     const [modalContent, setModalContent] = useState(null);
//     // callback function that will be called when modal is closing
//     const [onModalClose, setOnModalClose] = useState(null);

//     const closeModal = () => {
//         setModalContent(null); // clear the modal contents
//         // If callback function is truthy, call the callback function and reset it
//         // to null:
//         if (typeof onModalClose === "function") {
//             setOnModalClose(null);
//             onModalClose();
//         }
//     };

//     const contextValue = {
//         modalRef, // reference to modal div
//         modalContent, // React component to render inside modal
//         setModalContent, // function to set the React component to render inside modal
//         setOnModalClose, // function to set the callback function called when modal is closing
//         closeModal // function to close the modal
//     };

//     return (
//         <>
//             <ModalContext.Provider value={contextValue}>
//                 {children}
//             </ModalContext.Provider>
//             <div ref={modalRef} />
//         </>
//     );
// }

// export function Modal() {
//     const { modalRef, modalContent, closeModal } = useContext(ModalContext);
//     // If there is no div referenced by the modalRef or modalContent is not a
//     // truthy value, render nothing:
//     if (!modalRef || !modalRef.current || !modalContent) return null;

//     // Render the following component to the div referenced by the modalRef
//     return ReactDOM.createPortal(
//         <div id="modal">
//             <div id="modal-background" onClick={closeModal} />
//             <div id="modal-content">{modalContent}</div>
//         </div>,
//         modalRef.current
//     );
// }



// -------------------------------------
const DeleteGroup = ({ group }) => {
    const dispatch = useDispatch()
    const navigate = useNavigate()

    console.log(group, 'This is our DELETED group ID')



    const deleteHandler = async (e) => {
        e.preventDefault()
        dispatch(thunkGroupDeleter(group))
        navigate('/groups')
    }


    return <div className='delete-group'>
        <p> Do you want to Delete this group?</p>
        <button onClick={deleteHandler}>Confirm</button>
    </div>
}

export default DeleteGroup
