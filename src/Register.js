import React from 'react';
import howdyImg from './assets/img/howdy.jpg';
import { Helmet } from 'react-helmet';

let Register = (props) => {
    return (
        <div className='form-container'>
            <Helmet><title>Register | AcDecDB</title></Helmet>
            <img src={howdyImg} width={200} />
            <div style={{textAlign:'left'}}>
                <p>Well, howdy! Looks like y'all're here to open up a tab at the ol' Saloon.</p>
                <p>Improptitiously for your hankerin' hide, we don't let just anyone in.</p>
                <p>Why don't you mosey on over to the telegram office and wire a message to Sheriff Garza, care of</p>
                <p style={{textAlign: 'center'}}>sebastian.j.garza@gmail.com</p> <p> Maybe he'll take pity on your varmint soul.</p>
            </div>
        </div>
    );
}

export default Register;