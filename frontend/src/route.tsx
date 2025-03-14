import { createBrowserRouter } from "react-router-dom";
import { Suspense, lazy } from "react";
import LoadingSpinner from "./components/LoadingSpinner";

const SignInLazy = lazy(() => import("./pages/auth/SignIn"));
const SignUpLazy = lazy(() => import("./pages/auth/SignUp"));
const UserLayoutLazy = lazy(() => import("./layouts/UserLayout"));
const DashboardLazy = lazy(() => import("./pages/home/Dashboard"));
const StudentsLazy = lazy(() => import("./pages/users/Students"));
const TeachersLazy = lazy(() => import("./pages/users/Teachers"));
const ClassTypeLazy = lazy(() => import("./pages/class/ClassType"));
const ClassManageLazy = lazy(() => import("./pages/class/ClassManage"));
const PaymentStLazy = lazy(() => import("./pages/pay/PaymentSt"));
const ManageLazy = lazy(() => import("./pages/users/Manage"));
const ForgotPasswordLazy = lazy(() => import("./pages/auth/ForgotPassword"));
const ResetPasswordLazy = lazy(() => import("./pages/auth/ResetPassword"));
const CalendarLazy = lazy(() => import("./pages/calendar/Calendar"));

const routes = createBrowserRouter([
  {
    element: <UserLayoutLazy />,
    children: [
      {
        path: "/dashboard",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <DashboardLazy />
          </Suspense>
        ),
      },
      {
        path: "/users/students",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <StudentsLazy />
          </Suspense>
        ),
      },
      {
        path: "/users/teachers",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <TeachersLazy />
          </Suspense>
        ),
      },
      {
        path: "/users/manage",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <ManageLazy />
          </Suspense>
        ),
      },
      {
        path: "/class/manage",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <ClassManageLazy />
          </Suspense>
        ),
      },
      {
        path: "/class/type",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <ClassTypeLazy />
          </Suspense>
        ),
      },
      {
        path: "/payments",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <PaymentStLazy />
          </Suspense>
        ),
      },
      {
        path: "/calendar",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <CalendarLazy />
          </Suspense>
        ),
      },
    ],
  },
  {
    path: "/",
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        <SignInLazy />
      </Suspense>
    ),
  },
  {
    path: "/register",
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        <SignUpLazy />
      </Suspense>
    ),
  },
  {
    path: "/forgot-password",
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        <ForgotPasswordLazy />
      </Suspense>
    ),
  },
  {
    path: "/reset-password",
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        <ResetPasswordLazy />
      </Suspense>
    ),
  },
]);

export default routes;
