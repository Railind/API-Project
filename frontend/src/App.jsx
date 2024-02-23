import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
// import LoginFormPage from './components/LoginFormPage';
// import SignupFormModal from './components/signup/SignupFormModal';
import HomePage from './components/HomePage/HomePage';
import Navigation from './components/Navigation/Navigation';
import * as sessionActions from './store/session';
import { thunkingGroup } from './store/groups';
import ListGroups from './components/Groups/ListGroups/ListGroups';
import ListGroupInfo from './components/Groups/ListGroupInfo/ListGroupInfo';
import GroupCreationForm from './components/Groups/CreateGroup/CreateGroup';
import EditGroup from './components/Groups/EditGroup/EditGroup';
function Layout() {
  const dispatch = useDispatch();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    dispatch(sessionActions.restoreUser()).then(() => {
      setIsLoaded(true)
      dispatch(thunkingGroup())
    });
  }, [dispatch]);

  return (
    <>
      <Navigation isLoaded={isLoaded} />
      {isLoaded && <Outlet />}
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
      }
    ]
  }
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
