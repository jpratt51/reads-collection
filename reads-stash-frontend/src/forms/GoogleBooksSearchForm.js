import { React, useState, useEffect, useContext } from "react";
import axios from "axios";
import ReadCard from "../ReadCard";
import { GOOGLE_BOOKS_BASE_URL, GOOGLE_BOOKS_API_KEY } from "../Config";
import UserContext from "../UserContext";

function GoogleBooksSearchForm() {
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
        let URL = GOOGLE_BOOKS_BASE_URL;
        if (formData.title || formData.author) {
            if (formData.title) URL = URL + formData.title.trim();
            if (formData.author)
                URL = URL + "+inauthor:" + formData.author.trim();
            URL = URL + "&key=" + GOOGLE_BOOKS_API_KEY;
            try {
                axios.get(URL).then((res) => {
                    setData(res.data.items);
                });
            } catch (errors) {
                console.debug(errors);
                setReadCards(errorLoadingMessage);
            }
            setDisabledStatus(true);
            setFormData(INITIAL_STATE);
            setTimeout(() => setDisabledStatus(false), 2000);
        }
    };

    useEffect(() => {
        try {
            setReadCards(
                data.map((read) => (
                    <ReadCard
                        key={
                            read.volumeInfo.industryIdentifiers[0].identifier ||
                            null
                        }
                        isbn={
                            read.volumeInfo.industryIdentifiers[0].identifier ||
                            null
                        }
                        title={read.volumeInfo.title || null}
                        publishedDate={read.volumeInfo.publishedDate || null}
                        description={read.volumeInfo.description || null}
                        pageCount={read.volumeInfo.pageCount || null}
                        printType={read.volumeInfo.printType || null}
                        thumbnail={
                            read.volumeInfo.hasOwnProperty("imageLinks")
                                ? read.volumeInfo.imageLinks.thumbnail
                                : "https://t4.ftcdn.net/jpg/04/99/93/31/360_F_499933117_ZAUBfv3P1HEOsZDrnkbNCt4jc3AodArl.jpg"
                        }
                        infoLink={read.volumeInfo.infoLink || null}
                        authors={read.volumeInfo.authors}
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

export default GoogleBooksSearchForm;
