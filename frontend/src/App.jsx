import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
// import LoginFormPage from './components/LoginFormPage';
// import SignupFormModal from './components/signup/SignupFormModal';
import HomePage from './components/HomePage/HomePage';
import Navigation from './components/Navigation/Navigation';
import * as sessionActions from './store/session';
import { thunkingGroup } from './store/groups';
import { thunkingEvents } from './store/events';
import ListGroups from './components/Groups/ListGroups/ListGroups';
import ListGroupInfo from './components/Groups/ListGroupInfo/ListGroupInfo';
import GroupCreationForm from './components/Groups/CreateGroup/CreateGroup';
import EditGroup from './components/Groups/EditGroup/EditGroup';
import ListEvents from './components/Events/ListEvents/ListEvents';
import ListEventInfo from './components/Events/ListEventInfo/ListEventInfo';
import EventCreationForm from './components/Events/CreateEvent/CreateEvent';
import { Modal } from './context/Modal';
import { ModalProvider } from './context/Modal';
function Layout() {
  const dispatch = useDispatch();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    dispatch(sessionActions.restoreUser()).then(() => {
      setIsLoaded(true)
      dispatch(thunkingGroup())
      dispatch(thunkingEvents())
    });
  }, [dispatch]);

  return (
    <>
      <ModalProvider>
        <Navigation isLoaded={isLoaded} />
        {isLoaded && <Outlet />}
        <Modal />
      </ModalProvider>
    </>
  );
}

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        path: '/',
        element: <HomePage />
      },
      {
        path: '/groups',
        element: <ListGroups />
      }
      ,
      {
        path: '/groups/new',
        element: <GroupCreationForm />
      },
      {
        path: 'groups/:groupId',
        element: <ListGroupInfo />,

      },
      {
        path: '/groups/:groupId/edit',
        element: <EditGroup />
      },
      {
        path: 'groups/:groupId/events/new',
        element: <EventCreationForm />
      },
      {
        path: '/events',
        element: <ListEvents />
      },
      {
        path: '/events/:eventId',
        element: <ListEventInfo />
      },
      {
        path: '*',
        element: <h1>Not Found</h1>
      }
    ]
  }
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
