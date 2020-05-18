import React from 'react';
import howdyImg from './assets/img/howdy.jpg';

let Register = (props) => {
    return (
        <div className='form-container'>
            <img src={howdyImg} width={200} />
            <div style={{textAlign:'left'}}>
                <p>Well, howdy! Looks like y'all're here to open up a tab at the ol' Saloon.</p>
                <p>Unfortunately for y'all, we don't take too kindly to strangers 'round these parts, so we don't let just anybody in.</p>
                <p>Why don't you mosey on over to the telegram office and wire a message to Sheriff Garza, care of</p>
                <p style={{textAlign: 'center'}}>sebastian.j.garza@gmail.com</p> <p> Maybe he'll take pity on your varmint soul.</p>
                <p>Make sure to send him your "outlaw" name (that is, the one ya go by in the "Wild West" of the Internet!) 
                and a "secret code" (but since he's the <i>law</i>, don't let him have your <i>real</i> secret code!)</p>
                <p style={{textAlign: 'center'}}>○</p>
                <p>In case you don't speak cowboy (in which case, reevaluate your life), just send the username and password 
                you want to use to the email above. Obviously don't use your normal password because Sebastian is a known identity thief.</p>
            </div>
        </div>
    );
}

export default Register;