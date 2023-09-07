import { React, useState, useEffect, useContext } from "react";
import ReadCard from "../ReadCard";
import UserContext from "../UserContext";
import ReadsStashApi from "../api/api.js";

function ReadsStashSearchForm() {
    const [data, setData] = useState("");
    const [readCards, setReadCards] = useState("");
    const [disabledStatus, setDisabledStatus] = useState(false);
    const { user, errorLoadingMessage } = useContext(UserContext);

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
            let dataSent = {};
            if (formData.title.length) dataSent["title"] = formData.title;
            if (formData.author.length) dataSent["author"] = formData.author;
            let res = await new ReadsStashApi().constructor.getAllUserReads(
                user.username,
                dataSent
            );
            setData(res);
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
                        key={read.isbn}
                        isbn={read.isbn}
                        title={read.title}
                        publishedDate={read.publishedDate}
                        avgRating={read.avgRating}
                        description={read.description}
                        pageCount={read.pageCount}
                        printType={read.printType}
                        thumbnail={read.thumbnail}
                        infoLink={read.infoLink}
                        authors={read.authors}
                    />
                ))
            );
        } catch (error) {
            if (error.message !== "data.map is not a function")
                setReadCards(errorLoadingMessage);
        }
    }, [data, errorLoadingMessage]);
    return (
        <div>
            <h1>Search Stash</h1>
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

export default ReadsStashSearchForm;
