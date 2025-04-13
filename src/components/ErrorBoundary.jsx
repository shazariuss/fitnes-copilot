import { Component } from "react";
import { Link } from "react-router";

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({
            error: error,
            errorInfo: errorInfo,
        });

        // You could also log the error to an error reporting service
        console.error("Uncaught error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
                    <div className="sm:mx-auto sm:w-full sm:max-w-md">
                        <h1 className="text-center text-3xl font-bold text-gray-900">
                            Fitness Mentor
                        </h1>
                        <div className="mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                            <div className="text-center">
                                <h2 className="text-2xl font-bold text-red-600 mb-2">
                                    Something went wrong
                                </h2>
                                <p className="text-gray-600 mb-6">
                                    We're sorry, but an error occurred while
                                    loading this page.
                                </p>
                                <div className="mt-4">
                                    <Link
                                        to="/dashboard"
                                        className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
                                        onClick={() =>
                                            this.setState({ hasError: false })
                                        }
                                    >
                                        Try going back to dashboard
                                    </Link>
                                </div>

                                {this.state.error && (
                                    <div className="mt-6 p-4 bg-red-50 rounded-md text-left">
                                        <p className="text-sm font-medium text-red-800">
                                            Error details (for developers):
                                        </p>
                                        <pre className="mt-2 text-xs text-red-700 overflow-auto max-h-40">
                                            {this.state.error.toString()}
                                        </pre>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
