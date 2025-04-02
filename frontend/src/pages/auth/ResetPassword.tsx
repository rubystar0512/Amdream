import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button, Input, Form } from "antd";
import { LockOutlined } from "@ant-design/icons";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import api from "../../config";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const handleSubmit = async (values: {
    newPassword: string;
    confirmPassword: string;
  }) => {
    if (values.newPassword !== values.confirmPassword) {
      toast.error("Passwords do not match", { theme: "dark" });
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/auth/reset-password", {
        token,
        newPassword: values.newPassword,
      });

      if (!response.data.error) {
        toast.success("Password reset successful. Redirecting to login...", {
          theme: "dark",
        });
        setTimeout(() => navigate("/"), 2000);
      } else {
        toast.error(response.data.message, { theme: "dark" });
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.error || "An error occurred", {
        theme: "dark",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="flex min-h-screen w-[100vw] items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 px-4 dark:from-gray-900 dark:to-gray-800">
        <div className="rounded-2xl bg-white px-8 py-10 shadow-xl dark:bg-gray-800">
          <div className="text-center">
            <h1 className="mb-4 text-2xl font-bold text-red-600 dark:text-red-400">
              Invalid Reset Link
            </h1>
            <p className="mb-6 text-gray-600 dark:text-gray-400">
              This password reset link is invalid or has expired.
            </p>
            <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
              <Button
                type="primary"
                onClick={() => navigate("/forgot-password")}
                className="h-11 w-full rounded-lg bg-blue-600 text-base font-medium hover:bg-blue-500"
              >
                Request New Reset Link
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-[100vw] items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 px-4 dark:from-gray-900 dark:to-gray-800">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="rounded-2xl bg-white px-8 py-10 shadow-xl dark:bg-gray-800">
          <div className="mb-8 text-center">
            <motion.img
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
              src="https://flowbite.com/docs/images/logo.svg"
              alt="Logo"
              className="mx-auto mb-4 h-12 w-auto"
            />
            <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
              Set New Password
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Please enter your new password below
            </p>
          </div>

          <Form
            form={form}
            onFinish={handleSubmit}
            layout="vertical"
            className="space-y-6"
          >
            <Form.Item
              name="newPassword"
              rules={[
                { required: true, message: "Please input your new password!" },
                { min: 6, message: "Password must be at least 6 characters!" },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined className="text-gray-400" />}
                placeholder="New Password"
                size="large"
                className="rounded-lg placeholder:text-gray-500 dark:placeholder:text-gray-400"
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              rules={[
                { required: true, message: "Please confirm your password!" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("newPassword") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error("Passwords do not match!"));
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined className="text-gray-400" />}
                placeholder="Confirm Password"
                size="large"
                className="rounded-lg placeholder:text-gray-500 dark:placeholder:text-gray-400"
              />
            </Form.Item>

            <div className="flex flex-col space-y-4">
              <motion.div
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  className="h-11 w-full rounded-lg bg-blue-600 text-base font-medium hover:bg-blue-500"
                >
                  {loading ? "Resetting..." : "Reset Password"}
                </Button>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <Button
                  type="default"
                  onClick={() => navigate("/")}
                  className="h-11 w-full rounded-lg border border-gray-200 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Back to Sign In
                </Button>
              </motion.div>
            </div>
          </Form>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Need help?{" "}
              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href="/contact"
                className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Contact Support
              </motion.a>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-xs text-gray-600 dark:text-gray-400">
          By resetting your password, you agree to our{" "}
          <a
            href="/terms"
            className="text-blue-600 hover:underline dark:text-blue-400"
          >
            Terms of Service
          </a>{" "}
          and{" "}
          <a
            href="/privacy"
            className="text-blue-600 hover:underline dark:text-blue-400"
          >
            Privacy Policy
          </a>
        </p>
      </motion.div>
    </div>
  );
}
