import React from "react";

function ErrorMessages({ errors = [] }) {
    console.debug("Error", "errors=", errors);

    return (
        <div>
            {errors.map((error) => (
                <p>{error}</p>
            ))}
        </div>
    );
}
export default ErrorMessages;
