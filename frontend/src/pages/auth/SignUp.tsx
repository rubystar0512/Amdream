import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { Button, Input, Form, Select } from "antd";
import { LockOutlined, MailOutlined, IdcardOutlined } from "@ant-design/icons";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import api from "../../config";

interface Role {
  id: number;
  role_name: string;
}

export default function SignUp() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);
  const [form] = Form.useForm();
  const auth = useAuth();

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const res = await api.get("/roles");
      const filteredRoles = (res.data.data || []).filter(
        (role: Role) => role.role_name.toLowerCase() !== "admin",
      );
      setRoles(filteredRoles);
    } catch (error) {
      toast.error("Error fetching roles", { theme: "dark" });
    }
  };

  const handleSubmit = async (values: {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    confirm_password: string;
    role: string;
  }) => {
    if (values.password !== values.confirm_password) {
      toast.error("Passwords do not match", { theme: "dark" });
      return;
    }

    setLoading(true);
    try {
      await auth.register(
        values.email,
        values.password,
        values.first_name,
        values.last_name,
        values.role,
      );
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-[100vw] items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 px-4 py-8 dark:from-gray-900 dark:to-gray-800">
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
              Create your account
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Join us today and start your journey
            </p>
          </div>

          <Form
            form={form}
            onFinish={handleSubmit}
            layout="vertical"
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <Form.Item
                name="first_name"
                rules={[
                  { required: true, message: "Please input your first name!" },
                ]}
              >
                <Input
                  prefix={<IdcardOutlined className="text-gray-400" />}
                  placeholder="First Name"
                  size="large"
                  className="rounded-lg"
                />
              </Form.Item>

              <Form.Item
                name="last_name"
                rules={[
                  { required: true, message: "Please input your last name!" },
                ]}
              >
                <Input
                  prefix={<IdcardOutlined className="text-gray-400" />}
                  placeholder="Last Name"
                  size="large"
                  className="rounded-lg"
                />
              </Form.Item>
            </div>

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
                className="rounded-lg"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[
                { required: true, message: "Please input your password!" },
                { min: 6, message: "Password must be at least 6 characters!" },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined className="text-gray-400" />}
                placeholder="Password"
                size="large"
                className="rounded-lg"
              />
            </Form.Item>

            <Form.Item
              name="confirm_password"
              rules={[
                { required: true, message: "Please confirm your password!" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value) {
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
                className="rounded-lg"
              />
            </Form.Item>

            <Form.Item
              name="role"
              rules={[{ required: true, message: "Please select a role!" }]}
            >
              <Select
                size="large"
                placeholder="Select your role"
                className="rounded-lg"
              >
                {roles.map((role) => (
                  <Select.Option key={role.id} value={role.id}>
                    {role.role_name.charAt(0).toUpperCase() +
                      role.role_name.slice(1)}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <motion.div
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="mt-6"
            >
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                className="h-11 w-full rounded-lg bg-blue-600 text-base font-medium hover:bg-blue-500"
              >
                Create Account
              </Button>
            </motion.div>
          </Form>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Already have an account?{" "}
              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href="/"
                className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Sign in
              </motion.a>
            </p>
          </div>

          {/* Social Signup Options */}
          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                  Or sign up with
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center justify-center rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <img className="mr-2 h-5 w-5" src="/google.svg" alt="Google" />
                Google
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center justify-center rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <img
                  className="mr-2 h-5 w-5"
                  src="/facebook.svg"
                  alt="Facebook"
                />
                Facebook
              </motion.button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-xs text-gray-600 dark:text-gray-400">
          By signing up, you agree to our{" "}
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
