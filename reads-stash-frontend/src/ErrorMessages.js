import React from "react";

function ErrorMessages({ errors = [] }) {
    console.debug("Error", "errors=", errors);

    return (
        <div>
            <p>Inputs Error</p>
            {errors.map((error) => (
                <p>{error}</p>
            ))}
        </div>
    );
}
export default ErrorMessages;
