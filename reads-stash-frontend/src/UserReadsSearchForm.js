import { React, useState, useEffect, useContext } from "react";
import ReadCard from "./ReadCard";
import UserContext from "./UserContext";
import ReadsStashApi from "../api/api.js";

function UserReadsSearchForm() {
    const [data, setData] = useState("");
    const [readCards, setReadCards] = useState("");
    const [disabledStatus, setDisabledStatus] = useState(false);
    const { errorLoadingMessage } = useContext(UserContext);

    const INITIAL_STATE = {
        title: "",
        author: "",
    };
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
            res = await new ReadsStashApi().constructor.register(formData);
        } catch (errors) {
            console.debug(errors);
            setReadCards(errorLoadingMessage);
        }
        setDisabledStatus(true);
        setFormData(INITIAL_STATE);
        setTimeout(() => setDisabledStatus(false), 2000);
    };

    useEffect(() => {
        try {
            setReadCards(
                data.map((read) => (
                    <ReadCard
                        key={read.id}
                        isbn={read.isbn}
                        title={read.title}
                        publishedDate={read.publishedDate}
                        description={read.description}
                        pageCount={read.pages}
                        printType={read.printType}
                        thumbnail={read.thumbnail}
                        authors={read.authors}
                        avgRating={read.avgRating}
                        rating={read.rating}
                        reviewText={read.reviewText}
                        reviewDate={read.reviewDate}
                    />
                ))
            );
        } catch {
            setReadCards(errorLoadingMessage);
        }
    }, [data, errorLoadingMessage]);
    return (
        <div>
            <h1>Read Search</h1>
            <form>
                <label htmlFor="title">Title</label>
                <input
                    id="title"
                    type="text"
                    name="title"
                    placeholder="title"
                    value={formData.title}
                    onChange={handleChange}
                    disabled={disabledStatus}
                />
                <label htmlFor="author">Author</label>
                <input
                    id="author"
                    type="text"
                    name="author"
                    placeholder="author"
                    value={formData.author}
                    onChange={handleChange}
                    disabled={disabledStatus}
                />
                <button onClick={handleSubmit}>Search</button>
            </form>
            {readCards}
        </div>
    );
}

export default UserReadsSearchForm;
