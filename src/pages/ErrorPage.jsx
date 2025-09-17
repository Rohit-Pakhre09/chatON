import { useNavigate } from "react-router-dom";
import ErrorPng from "../assets/fallbacks PNG/ErroPage.png";

const ErrorPage = () => {
    const navigate = useNavigate();

    return (
        <section className="min-h-screen flex flex-col gap-5 items-center justify-center bg-white w-full">
            <img src={ErrorPng} className="h-[30vh] pointer-events-none select-none" alt="404 Error" />
            <p className="font-bold text-gray-400 text-4xl pointer-events-none select-none">404 ERROR</p>

            <button
                onClick={() => navigate("/", { replace: true })} 
                className="flex items-center gap-2 bg-blue-100 px-5 py-3 rounded-xl cursor-pointer hover:bg-blue-200 transition select-none"
            >
                <svg
                    fill="none"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                    className="w-5 h-5"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                </svg>
                Return to Main Page
            </button>
        </section>
    );
};

export default ErrorPage;
