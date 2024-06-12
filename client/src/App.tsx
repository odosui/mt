import * as React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import DesktopApp from "./DesktopApp";
import { StateProvider } from "./state/StateProvider";

const App: React.FC = () => {
  return (
    <Router>
      <StateProvider>
        <DesktopApp />
      </StateProvider>
    </Router>
  );
};

export default App;
