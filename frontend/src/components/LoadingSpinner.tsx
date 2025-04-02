import { motion } from "framer-motion";

export default function LoadingSpinner() {
  return (
    <div className="flex min-h-[200px] items-center justify-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="relative"
      >
        {/* Outer ring */}
        <motion.div
          className="absolute h-16 w-16 rounded-full border-4 border-blue-100 dark:border-gray-700"
          animate={{ rotate: 360 }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear",
          }}
        />

        {/* Inner spinner */}
        <motion.div
          className="h-16 w-16 rounded-full border-4 border-transparent border-t-blue-600 dark:border-t-blue-400"
          animate={{ rotate: 360 }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "linear",
          }}
        />

        {/* Center dot */}
        <motion.div
          className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600 dark:bg-blue-400"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Decorative particles */}
        <div className="absolute left-1/2 top-1/2">
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute h-2 w-2 rounded-full bg-blue-400/30 dark:bg-blue-500/30"
              initial={{
                x: 0,
                y: 0,
              }}
              animate={{
                x: [0, Math.cos((i * Math.PI) / 2) * 30],
                y: [0, Math.sin((i * Math.PI) / 2) * 30],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}
