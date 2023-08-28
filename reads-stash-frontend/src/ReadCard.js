import React from "react";
import { Link } from "react-router-dom";

const ReadCard = (props) => {
    return (
        <div>
            <h1>Title: {props.title}</h1>
            <p>ISBN: {props.isbn}</p>
            <p>Date Published: {props.publishedDate}</p>
            <p>Description: {props.description}</p>
            <p>Page Count: {props.pageCount}</p>
            <p>Print Type: {props.printType}</p>
            <Link to={`/read/${props.isbn}`} state={{ props: props }}>
                <img src={props.thumbnail} alt="book cover" />
            </Link>
            <p>Info URL: {props.infoLink}</p>
            <p>Authors: {props.authors}</p>
        </div>
    );
};

export default ReadCard;
