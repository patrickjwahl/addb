import React from 'react';
import ReactDOM from 'react-dom';
import {BrowserRouter, Route} from 'react-router-dom';
import {Page} from './Page';

ReactDOM.render(
	(
		<BrowserRouter>
			<Route component={Page} />
		</BrowserRouter>
	), document.getElementById('root'));
