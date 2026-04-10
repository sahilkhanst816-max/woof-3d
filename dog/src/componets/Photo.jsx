import React from 'react'


const Photo = ({ img, text }) => {
    return (
        <div className="row4-3">
            <div className="row4-3-img">
                <img src={img} alt="" />
            </div>

            <div className="row4-3-h1">
                <h1>{text}</h1>
            </div>
        </div>
    );
};



export default Photo