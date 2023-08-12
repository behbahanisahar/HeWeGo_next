import { FC } from 'react';
import { useRoutes, RouteObject } from 'react-router-dom';
import Layout from '../templates/layouts';
import LogIn from '../pages/login/login';



const routeList: RouteObject[] = [
  {
    path: '/',
    element: <Layout />,
    children: [
        {
            path: '/login',
            element: <LogIn />,
          },
    ],
  },
];

const RenderRouter: FC = () => {
  const element = useRoutes(routeList);
  return element;
};

export default RenderRouter;
