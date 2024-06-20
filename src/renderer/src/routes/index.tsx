// Router.js
import { Navigate, useRoutes } from 'react-router-dom'
import Home from '@renderer/pages/home'


const Router = () => {
  // const navigate = useNavigate()E

  const routeResult = useRoutes([
    {
      path: '/',
      element: <Navigate to="/home" replace />,
    },
    {
      path: '/home',
      element: <Home />,
    },
  ])

  return <>{routeResult}</> // 不再包裹在 <Routes> 中
}

export default Router
