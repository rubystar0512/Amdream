import {
  createContext,
  useReducer,
  ReactNode,
  Dispatch,
  useEffect,
} from "react";
import api from "../config";
import { toast } from "react-toastify";

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  menus: any;
}

// Define action types
type AuthAction =
  | { type: "LOGIN"; payload: { user: User; authState: boolean } }
  | { type: "LOGOUT" }
  | { type: "MENU"; payload: { menu: any } };

// Initial state
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  menus: [],
};

// Create context with type definitions
interface AuthContextType extends AuthState {
  setAuth: Dispatch<AuthAction>;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    first_name: string,
    last_name: string,
    role: string
  ) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Reducer function
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case "LOGIN": {
      const { user, authState } = action.payload;
      return { ...state, isAuthenticated: authState, user };
    }

    case "LOGOUT": {
      return { ...state, isAuthenticated: false, user: null };
    }

    case "MENU": {
      const { menu } = action.payload;
      return { ...state, menus: menu };
    }

    default:
      return state;
  }
};

// AuthProvider component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [auth, setAuth] = useReducer(authReducer, initialState);
  const login = async (email: string, password: string) => {
    api
      .post("/auth/login", { email, password })
      .then((res) => {
        if (!res.data.error) {
          localStorage.setItem("token", res.data.token);
          const user = {
            role: res.data?.user?.role?.role_name,
            email: res.data.user.email,
            first_name: res.data.user.first_name,
            last_name: res.data.user.last_name,
            id: res.data.user.id,
          };
          localStorage.setItem("user", JSON.stringify(user));
          setAuth({ type: "LOGIN", payload: { user, authState: true } });
        } else {
          toast.error("Wrong user information", { theme: "dark" });
        }
      })
      .catch((error) => {
        toast.error(`${error.response.data.msg}`, { theme: "dark" });
        console.log(error);
      });
  };

  const register = async (
    email: string,
    password: string,
    first_name: string,
    last_name: string,
    role: string  
  ) => {
    api
      .post("/auth/signup", { email, password, first_name, last_name, role })
      .then((res) => {
        if (!res.data.error) {
          toast.success("You have registered successfully.Please wait for approval", { theme: "dark" });
        }
      })
      .catch((error) => {
        toast.error("Please try again!!!", { theme: "dark" });
        console.log(error);
      });
  };

  const logout = async () => {
    // Add logout logic
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");

    if (token && userStr) {
      const user = JSON.parse(userStr) as User;
      setAuth({ type: "LOGIN", payload: { user, authState: true } });
    }
  }, []);

  return (
    <AuthContext.Provider value={{ ...auth, setAuth, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
