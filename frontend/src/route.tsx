import { createBrowserRouter, Navigate } from "react-router-dom";
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
const NotFoundLazy = lazy(() => import("./components/NotFound"));
const ClassInfoLazy = lazy(() => import("./pages/class/ClassInfo"));
const WordsLazy = lazy(() => import("./pages/class/Words"));
const ErrorPageLazy = lazy(() => import("./components/ErrorPage"));

const routes = createBrowserRouter([
  {
    element: <UserLayoutLazy />,
    errorElement: <ErrorPageLazy />,
    children: [
      {
        path: "/dashboard",
        errorElement: <ErrorPageLazy />,
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <DashboardLazy />
          </Suspense>
        ),
      },
      {
        path: "/users/students",
        errorElement: <ErrorPageLazy />,
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <StudentsLazy />
          </Suspense>
        ),
      },
      {
        path: "/users/teachers",
        errorElement: <ErrorPageLazy />,
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <TeachersLazy />
          </Suspense>
        ),
      },
      {
        path: "/users/manage",
        errorElement: <ErrorPageLazy />,
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <ManageLazy />
          </Suspense>
        ),
      },
      {
        path: "/class/manage",
        errorElement: <ErrorPageLazy />,
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <ClassManageLazy />
          </Suspense>
        ),
      },
      {
        path: "/class/type",
        errorElement: <ErrorPageLazy />,
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <ClassTypeLazy />
          </Suspense>
        ),
      },
      {
        path: "/payments",
        errorElement: <ErrorPageLazy />,
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <PaymentStLazy />
          </Suspense>
        ),
      },
      {
        path: "/calendar",
        errorElement: <ErrorPageLazy />,
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <CalendarLazy />
          </Suspense>
        ),
      },
      {
        path: "/class/info",
        errorElement: <ErrorPageLazy />,
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <ClassInfoLazy studentId={""} studentName={""} />
          </Suspense>
        ),
      },
      {
        path: "/class/words",
        errorElement: <ErrorPageLazy />,
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <WordsLazy studentId={""} studentName={""} />
          </Suspense>
        ),
      },
    ],
  },
  {
    path: "/login",
    errorElement: <ErrorPageLazy />,
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        <SignInLazy />
      </Suspense>
    ),
  },
  {
    path: "/register",
    errorElement: <ErrorPageLazy />,
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        <SignUpLazy />
      </Suspense>
    ),
  },
  {
    path: "/forgot-password",
    errorElement: <ErrorPageLazy />,
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        <ForgotPasswordLazy />
      </Suspense>
    ),
  },
  {
    path: "/reset-password",
    errorElement: <ErrorPageLazy />,
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        <ResetPasswordLazy />
      </Suspense>
    ),
  },
  {
    path: "/",
    errorElement: <ErrorPageLazy />,
    element: <Navigate to="/login" replace />,
  },
  {
    path: "*",
    errorElement: <ErrorPageLazy />,
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        <NotFoundLazy />
      </Suspense>
    ),
  },
]);

export default routes;
