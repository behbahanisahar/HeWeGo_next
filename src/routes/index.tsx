import { FC } from 'react';
import { useRoutes, RouteObject } from 'react-router-dom';
import Layout from '../templates/layouts';

const routeList: RouteObject[] = [
  {
    path: '/',
    element: <Layout />,
    children: [
    ],
  },
];

const RenderRouter: FC = () => {
  const element = useRoutes(routeList);
  return element;
};

export default RenderRouter;
