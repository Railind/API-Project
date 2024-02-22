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
    ]
  }
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
