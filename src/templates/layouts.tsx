// templates/layouts.tsx
import { FC } from 'react';
import { Outlet } from 'react-router-dom';
import ResponsiveAppBar from '../components/appBar/appBar';

const Layout: FC = (): JSX.Element => {
  return (
    <div>
      <ResponsiveAppBar />
      <Outlet />
    </div>
  );
};

export default Layout;
