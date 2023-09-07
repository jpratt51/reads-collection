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
    const [userRead, setUserRead] = useState("");
    const [messages, setMessages] = useState("");

    useEffect(() => {
        const getUserReadByIsbn = async () => {
            let res;
            try {
                if (user.username && props.isbn) {
                    res = await new ReadsStashApi().constructor.getUserRead(
                        user.username,
                        props.isbn
                    );
                    setUserRead(res);
                }
            } catch (error) {
                console.debug(error);
                setUserRead("");
            }
        };
        getUserReadByIsbn();
    }, [user.username, props.isbn]);

    const addUserRead = async () => {
        try {
            await new ReadsStashApi().constructor.postRead(props);
            await new ReadsStashApi().constructor.postUserRead({
                username: user.username,
                isbn: props.isbn,
            });
            setMessages(`Successfully added ${props.title} to stash!`);
        } catch (errors) {
            setMessages(errors.toString());
        }
    };

    const removeUserRead = async () => {
        try {
            await new ReadsStashApi().constructor.deleteUserRead({
                username: user.username,
                isbn: props.isbn,
            });
            setMessages(`Successfully removed ${props.title} from stash`);
        } catch (errors) {
            setMessages(errors.toString());
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
                    avgRating={props.avgRating}
                    pageCount={props.pageCount}
                    printType={props.printType}
                    thumbnail={props.thumbnail}
                    infoLink={props.infoLink}
                    authors={props.authors}
                />
                {!userRead ? (
                    <button onClick={addUserRead}>Add to Stash</button>
                ) : (
                    <div>
                        <button onClick={removeUserRead}>
                            Remove from stash
                        </button>
                    </div>
                )}
                <form action="#">
                    <label for="lang">Add read to collection</label>
                    <select name="languages" id="lang">
                        <option value="javascript">JavaScript</option>
                        <option value="php">PHP</option>
                        <option value="java">Java</option>
                        <option value="golang">Golang</option>
                        <option value="python">Python</option>
                        <option value="c#">C#</option>
                        <option value="C++">C++</option>
                        <option value="erlang">Erlang</option>
                    </select>
                    <input type="submit" value="Submit" />
                </form>
                ;{messages ? <Messages messages={messages} /> : null}
            </div>
        );
    } else {
        return <p>Loading ...</p>;
    }
}

export default ReadDetails;
