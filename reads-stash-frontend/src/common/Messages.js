import React from "react";

function Messages({ messages = [] }) {
    return (
        <div>
            {messages.map((message) => (
                <p>{message}</p>
            ))}
        </div>
    );
}
export default Messages;
