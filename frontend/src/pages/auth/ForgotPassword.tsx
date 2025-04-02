import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Input, Form } from "antd";
import { MailOutlined } from "@ant-design/icons";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import api from "../../config";

export default function ForgotPassword() {
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const handleSubmit = async (values: { email: string }) => {
    setLoading(true);
    try {
      const response = await api.post("/auth/forgot-password", {
        email: values.email,
      });

      if (!response.data.error) {
        setEmailSent(true);
        toast.success("Password reset instructions sent to your email", {
          theme: "dark",
        });
      } else {
        toast.error("An error occurred. Please try again.", {
          theme: "dark",
        });
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.", {
        theme: "dark",
      });
    } finally {
      setLoading(false);
    }
  };

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
              Reset your password
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {emailSent
                ? "Check your email for reset instructions"
                : "Enter your email to receive reset instructions"}
            </p>
          </div>

          {!emailSent ? (
            <Form
              form={form}
              onFinish={handleSubmit}
              layout="vertical"
              className="space-y-6"
            >
              <Form.Item
                name="email"
                rules={[
                  { required: true, message: "Please input your email!" },
                  { type: "email", message: "Please enter a valid email!" },
                ]}
              >
                <Input
                  prefix={<MailOutlined className="text-gray-400" />}
                  placeholder="Email address"
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
                    {loading ? "Sending..." : "Send Reset Instructions"}
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
          ) : (
            <div className="space-y-6">
              <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
                <p className="text-center text-sm text-blue-800 dark:text-blue-200">
                  We've sent you an email with instructions to reset your
                  password. Please check your inbox and spam folder.
                </p>
              </div>

              <motion.div
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <Button
                  type="default"
                  onClick={() => {
                    setEmailSent(false);
                    form.resetFields();
                  }}
                  className="h-11 w-full rounded-lg border border-gray-200 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Try Another Email
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
          )}

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Don't have an account?{" "}
              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href="/register"
                className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Create account
              </motion.a>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-xs text-gray-600 dark:text-gray-400">
          Need help?{" "}
          <a
            href="/contact"
            className="text-blue-600 hover:underline dark:text-blue-400"
          >
            Contact Support
          </a>
        </p>
      </motion.div>
    </div>
  );
}
