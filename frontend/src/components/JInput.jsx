import {useState} from "react";

export function JInput({type,label,value,onChange}) {


    return (
        <div className="mb-3">
            <label htmlFor={label} className="form-label">{label}</label>
            <input value={value} onChange={onChange}
                   type={type} className="form-control"/>

        </div>
    )
}