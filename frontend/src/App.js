import { useState } from "react";
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";
import Authentication from "./Components/Authentication";
import Navbar from "./Components/Navbar";
import Search from "./Components/Search";

const App = () => {
  const [auth, setAuth] = useState(false);
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });

  return (
    <Router>
      <Navbar auth={auth} setAuth={setAuth} />
      <Routes>
        <Route
          path="/authentication"
          element={
            <Authentication setAuth={setAuth} setCredentials={setCredentials} />
          }
        />
        <Route
          path="/search"
          element={
            auth ? (
              <Search credentials={credentials} />
            ) : (
              <Navigate to="/authentication" />
            )
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
