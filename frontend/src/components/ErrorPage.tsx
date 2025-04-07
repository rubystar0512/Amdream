import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const ErrorPage = () => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-gray-900 to-gray-800 p-4 text-center"
    >
      <div className="rounded-xl bg-white/10 p-8 backdrop-blur-sm">
        <h1 className="mb-4 text-4xl font-bold text-white">Oops!</h1>
        <p className="mb-8 text-xl text-gray-300">
          Something went wrong. Please try again later.
        </p>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate(-1)}
          className="rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-medium text-white hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Go Back
        </motion.button>
      </div>
    </motion.div>
  );
};

export default ErrorPage;
