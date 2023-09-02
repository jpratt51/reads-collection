import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const ReadCard = (props) => {
    const [readDescription, setReadDescription] = useState("");

    function truncate(text, maxLength) {
        if (text.length > maxLength) {
            text = text.substring(0, maxLength) + " ...";
        }
        return text;
    }

    useEffect(() => {
        if (props.description.length > 200) {
            setReadDescription({
                descriptionText: truncate(props.description, 200),
                buttonText: "show more",
            });
        } else {
            setReadDescription({
                descriptionText: truncate(props.description, 200),
                buttonText: "",
            });
        }
    }, [props.description]);

    const toggleDescriptionLength = () => {
        if (readDescription.descriptionText.length === 204) {
            setReadDescription({
                descriptionText: truncate(props.description, 2000),
                buttonText: "show less",
            });
        } else {
            setReadDescription({
                descriptionText: truncate(props.description, 200),
                buttonText: "show more",
            });
        }
    };

    return (
        <div>
            <h1>{props.title}</h1>
            <p>By {props.authors}</p>
            <Link to={`/read/${props.isbn}`} state={{ props: props }}>
                <img src={props.thumbnail} alt="book cover" />
            </Link>
            <p>
                Description: {readDescription.descriptionText}
                {props.description.length > 200 ? (
                    <button onClick={toggleDescriptionLength}>
                        {readDescription.buttonText}
                    </button>
                ) : null}
            </p>
            <p>Date Published: {props.publishedDate}</p>
            <p>Page Count: {props.pageCount}</p>
            <p>Print Type: {props.printType}</p>
            <Link to={props.infoLink} target="_blank" rel="noopener noreferrer">
                <p>Google Books link</p>
            </Link>
            <p>ISBN: {props.isbn}</p>
        </div>
    );
};

export default ReadCard;
