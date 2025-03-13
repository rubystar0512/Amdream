import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useAuth } from "../../hooks/useAuth";
import api from "../../config";

export default function SignUp() {
  const [first_name, setFirstName] = useState("");
  const [last_name, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassowrd] = useState("");
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState("");
  const [confirmPassword, setconfirmPassword] = useState("");
  const auth = useAuth();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await api.get("/roles");
      const filteredRoles = (res.data.data || []).filter(
        (role:any) => role.role_name.toLowerCase() !== 'admin'
      );
      setRoles(filteredRoles);
    } catch (error) {
      toast.error("Error fetching roles", { theme: "dark" });
    }
  };

  const register = () => {
    if (email != "") {
      if (
        password != "" &&
        confirmPassword != "" &&
        password == confirmPassword &&
        first_name != "" &&
        last_name != "" &&
        selectedRole != ""
      ) {
        auth.register(email, password, first_name, last_name, selectedRole);
      } else {
        toast.error("Please fill all fields correctly", { theme: "dark" });
      }
    } else {
      toast.error("Please input email address correctly", { theme: "dark" });
    }
  };

  return (
    <div className="w-full max-w-sm rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:p-6 md:p-8">
      <form className="space-y-6" action="#">
        <h5 className="text-xl font-medium text-gray-900 dark:text-white">
          Sign Up to Amdream
        </h5>

        <div>
          <label
            htmlFor="first_name"
            className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
          >
            First Name
          </label>
          <input
            type="text"
            name="first_name"
            id="first_name"
            className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-500 dark:bg-gray-600 dark:text-white dark:placeholder-gray-400"
            placeholder="First Name"
            required
            value={first_name}
            onChange={(e) => {
              setFirstName(e.target.value);
            }}
          />
        </div>


        <div>
          <label
            htmlFor="last_name"
            className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
          >
            Last Name
          </label>
          <input
            type="text"
            name="last_name"
            id="last_name"
            className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-500 dark:bg-gray-600 dark:text-white dark:placeholder-gray-400"
            placeholder="Last Name"
            required
            value={last_name}
            onChange={(e) => {
              setLastName(e.target.value);
            }}
          />
        </div>


        <div>
          <label
            htmlFor="email"
            className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
          >
            Your email
          </label>
          <input
            type="email"
            name="email"
            id="email"
            className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-500 dark:bg-gray-600 dark:text-white dark:placeholder-gray-400"
            placeholder="name@company.com"
            required
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
            }}
          />
        </div>
        <div>
          <label
            htmlFor="password"
            className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
          >
            Your password
          </label>
          <input
            type="password"
            name="password"
            id="password"
            placeholder="••••••••"
            className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-500 dark:bg-gray-600 dark:text-white dark:placeholder-gray-400"
            required
            value={password}
            onChange={(e) => {
              setPassowrd(e.target.value);
            }}
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
          >
            Confirm password
          </label>
          <input
            type="password"
            name="confirm_password"
            id="confirm_password"
            placeholder="••••••••"
            className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-500 dark:bg-gray-600 dark:text-white dark:placeholder-gray-400"
            required
            value={confirmPassword}
            onChange={(e) => {
              setconfirmPassword(e.target.value);
            }}
          />
        </div>

        <div>
          <label
            htmlFor="role"
            className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
          >
            Select Role
          </label>
          <select
            id="role"
            className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-500 dark:bg-gray-600 dark:text-white dark:placeholder-gray-400"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            required
          >
            <option value="">Select a role</option>
            {roles.map((role: any) => (
              <option key={role.id} value={role.id}>
                {role.role_name.charAt(0).toUpperCase() + role.role_name.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="button"
            className="mb-2 flex-1 rounded-lg bg-blue-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            onClick={register}
          >
            Register your account
          </button>

          <a
            href="/"
            className="mb-2 flex-none cursor-pointer rounded-lg bg-gray-100 px-5 py-2.5 text-center text-sm font-medium text-gray-900 hover:bg-gray-200 focus:outline-none focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-500"
          >
            Back
          </a>
        </div>
      </form>
    </div>
  );
}
