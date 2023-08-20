import React from "react";

const ReadCard = (props) => {
    return (
        <div>
            <h1>Title: {props.title}</h1>
            <p>ISBN: {props.isbn}</p>
            <p>Date Published: {props.publishedDate}</p>
            <p>Description: {props.description}</p>
            <p>Page Count: {props.pageCount}</p>
            <p>Print Type: {props.printType}</p>
            <p>Thumbnail URL: {props.thumbNail}</p>
            <p>Info URL: {props.infoLink}</p>
        </div>
    );
};

export default ReadCard;
