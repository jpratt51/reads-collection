import { React, useContext, useEffect, useState } from "react";
import ReadCard from "../ReadCard";
import { useLocation } from "react-router-dom";
import UserContext from "../UserContext";
import ReadsStashApi from "../api/api.js";
import Messages from "../common/Messages";

// Need to add button to add book to user's database which redirects to login page if no current user or is not visible if no current user
// Need to add button to take to Google page
// Backend has two separate routes to add a read: 1 to add the read to the database, and one to add that read to the user. The route to add the read to the user takes in the user id, read id and inputs for rating, reviewText and reviewDate. So on the readDetails page I need to include a form which accepts inputs for rating and reviewText.

function ReadDetails() {
    const location = useLocation();
    const { props } = location.state;
    const { user } = useContext(UserContext);
    const [read, setRead] = useState("");
    const [messages, setMessages] = useState("");
    const readData = {
        title: props.title,
        description: props.description,
        isbn: props.isbn,
        avgRating: props.avgRating,
        printType: props.printType,
        pages: props.pageCount,
        thumbnail: props.thumbnail,
        authors: props.authors,
    };

    useEffect(() => {
        const getReadByIsbn = async () => {
            let res;
            try {
                res = await new ReadsStashApi().constructor.getRead(props.isbn);
                setRead(res.rows[0]);
            } catch {
                setRead("");
            }
        };
        getReadByIsbn();
    }, [props.isbn]);

    const addReadToDb = async () => {
        try {
            await new ReadsStashApi().constructor.postRead(readData);
            await new ReadsStashApi().constructor.postUserRead({
                username: user.username,
                isbn: props.isbn,
            });
            setMessages([`Successfully added ${props.title} to stash!`]);
        } catch (errors) {
            if (typeof errors === "object") errors = errors.toString();
            setMessages([errors]);
        }
    };

    if (props) {
        return (
            <div>
                <ReadCard
                    isbn={props.isbn}
                    title={props.title}
                    publishedDate={props.publishedDate}
                    description={props.description}
                    pageCount={props.pageCount}
                    printType={props.printType}
                    thumbnail={props.thumbnail}
                    infoLink={props.infoLink}
                />
                {user && !read ? (
                    <button onClick={addReadToDb}>Add to Stash</button>
                ) : null}
                {messages.length ? <Messages messages={messages} /> : null}
            </div>
        );
    } else {
        return <p>Loading ...</p>;
    }
}

export default ReadDetails;
