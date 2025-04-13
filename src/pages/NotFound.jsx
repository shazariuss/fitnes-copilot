import { Link } from "react-router";

function NotFound() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h1 className="text-center text-3xl font-bold text-gray-900">
                    Fitness Mentor
                </h1>
                <div className="text-center mt-6">
                    <h2 className="text-6xl font-bold text-primary-600">404</h2>
                    <h3 className="mt-2 text-2xl font-bold text-gray-900">
                        Page not found
                    </h3>
                    <p className="mt-4 text-gray-600">
                        Sorry, we couldn't find the page you're looking for.
                    </p>
                    <div className="mt-6">
                        <Link
                            to="/dashboard"
                            className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
                        >
                            Go back to dashboard
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default NotFound;
