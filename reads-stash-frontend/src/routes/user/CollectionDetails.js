import { React, useState } from "react";
import CollectionCard from "../../cards/CollectionCard";
import { useLocation } from "react-router-dom";
// import UserContext from "../UserContext";
import ReadsStashApi from "../../api/api.js";
import Messages from "../../common/Messages";

function CollectionDetails() {
    const location = useLocation();
    const { name, id, username } = location.state;
    // const { user } = useContext(UserContext);
    // const [userCollection, setUserRead] = useState("");
    const [messages, setMessages] = useState("");

    // useEffect(() => {
    //     const getUserReadByIsbn = async () => {
    //         let res;
    //         try {
    //             if (user.username && props.isbn) {
    //                 res = await new ReadsStashApi().constructor.getUserRead(
    //                     user.username,
    //                     props.isbn
    //                 );
    //                 setUserRead(res);
    //             }
    //         } catch (error) {
    //             console.debug(error);
    //             setUserRead("");
    //         }
    //     };
    //     getUserReadByIsbn();
    // }, [user.username, props.isbn]);

    // const addUserRead = async () => {
    //     try {
    //         await new ReadsStashApi().constructor.postRead(props);
    //         await new ReadsStashApi().constructor.postUserRead({
    //             username: user.username,
    //             isbn: props.isbn,
    //         });
    //         setMessages(`Successfully added ${props.title} to stash!`);
    //     } catch (errors) {
    //         setMessages(errors.toString());
    //     }
    // };

    // const removeUserCollection = async () => {
    //     try {
    //         await new ReadsStashApi().constructor.deleteUserCollection({
    //             username: user.username,
    //             isbn: props.isbn,
    //         });
    //         setMessages(`Successfully removed ${props.title} from stash`);
    //     } catch (errors) {
    //         setMessages(errors.toString());
    //     }
    // };

    // if (props) {

    const removeCollection = async () => {
        if (username && id) {
            try {
                let res =
                    await new ReadsStashApi().constructor.deleteUserCollection(
                        username,
                        id
                    );
                setMessages(`Removed User Collection ${name}`);
                setTimeout(() => setMessages(""), 2000);
                return res;
            } catch (errors) {
                console.debug(errors);
                setMessages(errors);
            }
        }
    };

    return (
        <div>
            <h1>Welcome to the collection details page</h1>
            <CollectionCard name={name} />
            <button onClick={removeCollection}>Remove Collection</button>
            {/* {!userRead ? (
                    <button onClick={addUserRead}>Add to Stash</button>
                ) : (
                    <div>
                        <button onClick={removeUserRead}>
                            Remove from stash
                        </button>
                    </div>
                )} */}
            {messages ? <Messages messages={messages} /> : null}
        </div>
    );
    // } else {
    //     return <p>Loading ...</p>;
    // }
}

export default CollectionDetails;
