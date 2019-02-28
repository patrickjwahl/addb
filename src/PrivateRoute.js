import React from 'react';
import {Route, Redirect} from 'react-router-dom';
import API from './API';

const PrivateRoute = ({ component: Component, req: req, ...rest }) => (
  <Route {...rest} render={(props) => (
    ((req === 'edit' && API.canEdit()) || (API.accessLevel() >= req))
      ? <Component {...props} />
      : <Redirect to={{
        pathname: '/login',
        state: {from: props.location}
        }} />
  )} />
);

export default PrivateRoute;