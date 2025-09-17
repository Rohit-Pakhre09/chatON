import { Route, Routes } from "react-router-dom";
import SignIn from "../pages/SignIn"
import SignUp from "../pages/SignUp"
import MainPage from "../pages/MainPage";
import ErrorPage from "../pages/ErrorPage";

// Paths
const routes = [
    {
        path: "/signin",
        element: <SignIn />
    },
    {
        path: "/signup",
        element: <SignUp />
    },
    {
        path: "/",
        element: <MainPage />
    },
    {
        path: "*",
        element: <ErrorPage />
    },
];

const AllRoutes = () => {
    return (
        <Routes>
            {
                routes.map((route, index) => (
                    <Route key={index} path={route.path} element={route.element} />
                ))
            }
        </Routes>
    );
}

export default AllRoutes;