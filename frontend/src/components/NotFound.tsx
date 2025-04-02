import { Button } from "antd";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { HomeOutlined } from "@ant-design/icons";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen w-[100vw] flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 px-4 dark:from-gray-900 dark:to-gray-800">
      <div className="text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="relative mb-4 text-[150px] font-bold leading-none tracking-tight text-gray-900 dark:text-white md:text-[200px]">
            <span className="relative bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              404
            </span>
            <motion.div
              className="absolute -right-4 top-0 h-24 w-24 md:-right-6 md:h-32 md:w-32"
              initial={{ rotate: 0 }}
              animate={{ rotate: 360 }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "linear",
              }}
            >
              <img
                src="https://flowbite.com/docs/images/logo.svg"
                alt="Asteroid"
                className="h-full w-full object-contain"
              />
            </motion.div>
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <p className="mb-8 text-3xl font-semibold text-gray-700 dark:text-gray-300">
            Page Not Found
          </p>
          <div className="mb-6 max-w-screen-sm text-lg text-gray-500 dark:text-gray-400">
            Oops! Looks like you've ventured into unknown territory. The page
            you're looking for has drifted off into space.
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              type="primary"
              size="large"
              icon={<HomeOutlined />}
              onClick={() => navigate("/")}
              className="flex min-w-[200px] items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-3 text-base font-semibold text-white shadow-lg transition-all hover:from-blue-700 hover:to-indigo-700"
            >
              Back to Home
            </Button>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              size="large"
              onClick={() => navigate(-1)}
              className="flex min-w-[200px] items-center justify-center rounded-lg border border-gray-200 bg-white px-8 py-3 text-base font-semibold text-gray-600 shadow-lg transition-all hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Go Back
            </Button>
          </motion.div>
        </motion.div>

        {/* Floating Elements */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute left-1/4 top-1/4 h-16 w-16 rounded-full bg-blue-500/10"
            animate={{
              y: [0, -20, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute right-1/4 top-1/3 h-24 w-24 rounded-full bg-indigo-500/10"
            animate={{
              y: [0, 20, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 7,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute bottom-1/4 left-1/3 h-20 w-20 rounded-full bg-purple-500/10"
            animate={{
              y: [0, -15, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>
      </div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="absolute bottom-8 text-center text-sm text-gray-500 dark:text-gray-400"
      >
        <p>
          Need help? Contact our{" "}
          <a
            href="/support"
            className="text-blue-600 hover:underline dark:text-blue-400"
          >
            support team
          </a>
        </p>
      </motion.div>
    </div>
  );
}
