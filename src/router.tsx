import {
  BrowserRouter,
  Routes,
  Route,
  // Link,
  // useRouteMatch,
} from "react-router-dom";

export const routes = () => {
  return (
    <BrowserRouter>
    <Routes>
      {/* @ts-expect-error */}
      <Route exact path="/">
        {/* <Home /> */}
      </Route>
      <Route path="/users">
        {/* <Users /> */}
      </Route>
    </Routes>
  </BrowserRouter>
  );
};
