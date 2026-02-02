// templates/layouts.tsx
import React, { FC } from 'react';
import { Outlet } from 'react-router-dom';
import ResponsiveAppBar from '../components/appBar/appBar';

const Layout: FC = (): React.ReactElement => {
  return (
    <div>
      <ResponsiveAppBar />
      <Outlet />
    </div>
  );
};

export default Layout;
