import { useEffect } from "react";

const Login = () => {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (token) {
      localStorage.setItem("token", token);
      window.location.href = "/dashboard";
    }
  }, []);

  const handleGoogleLogin = () => {
    const backendURL = process.env.REACT_APP_API_URL;
    window.location.href = `${backendURL}/auth/google`;
  };

  return (
    <div className="h-screen flex justify-center items-center bg-gray-100">
      <button
        onClick={handleGoogleLogin}
        className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700"
      >
        Sign in with Google
      </button>
    </div>
  );
};

export default Login;
