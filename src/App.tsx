import { FC } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import RenderRouter from "./routes";
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';

const App: FC = (): JSX.Element => {
 //to do: should check if user not login yet, could not change routes
  return (
    <>
      <Router>
        <RenderRouter />
      </Router>
      <ToastContainer autoClose={8000} />
    </>
  );
};
export default App;
