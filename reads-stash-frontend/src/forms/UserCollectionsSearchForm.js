import { React, useState, useEffect, useContext } from "react";
import CollectionCard from "../cards/CollectionCard";
import UserContext from "../UserContext";
import ReadsStashApi from "../api/api.js";
import Messages from "../common/Messages";

function UserCollectionsSearchForm() {
    const [data, setData] = useState("");
    const [collectionCards, setCollectionCards] = useState("");
    const [disabledStatus, setDisabledStatus] = useState(false);
    const { user, errorLoadingMessage } = useContext(UserContext);

    const INITIAL_STATE = { name: "" };
    const [formData, setFormData] = useState(INITIAL_STATE);
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((formData) => ({
            ...formData,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (formData.name.length) {
                let res =
                    await new ReadsStashApi().constructor.postUserCollection(
                        user.username,
                        formData
                    );
                setData(res);
                setFormData();
                setTimeout(() => setData(""), 2000);
            }
        } catch (errors) {}
        setDisabledStatus(true);
        setFormData(INITIAL_STATE);
        setTimeout(() => setDisabledStatus(false), 2000);
    };

    useEffect(() => {
        const getUserCollections = async () => {
            if (user.username) {
                try {
                    let res =
                        await new ReadsStashApi().constructor.getAllUserCollections(
                            user.username
                        );
                    setCollectionCards(
                        res.map((collection) => (
                            <CollectionCard
                                key={collection.id}
                                id={collection.id}
                                name={collection.name}
                                username={user.username}
                            />
                        ))
                    );
                } catch (errors) {
                    console.debug(errors);
                    setCollectionCards(errorLoadingMessage);
                    setTimeout(() => setCollectionCards(""), 2000);
                }
            }
        };
        getUserCollections();
    }, [errorLoadingMessage, user.username, collectionCards]);

    return (
        <div>
            <h2>Add User Collection</h2>
            <form>
                <label htmlFor="name">Collection Name</label>
                <input
                    id="name"
                    type="text"
                    name="name"
                    placeholder="collection name"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={disabledStatus}
                />
                <button onClick={handleSubmit}>Add</button>
            </form>
            {collectionCards}
            {data ? <Messages>{data}</Messages> : null}
        </div>
    );
}

export default UserCollectionsSearchForm;
