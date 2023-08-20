import { React, useState } from "react";
import axios from "axios";
import ReadCard from "./ReadCard";
import { GOOGLE_BOOKS_BASE_URL, GOOGLE_BOOKS_API_KEY } from "./Config.js";

function GoogleBooksSearchForm() {
    const [data, setData] = useState("");
    const INITIAL_STATE = {
        username: "",
        fname: "",
        lname: "",
        email: "",
        password: "",
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
        if (formData.title) URL = URL + formData.title.trim();
        if (formData.author) URL = URL + "+inauthor:" + formData.author.trim();
        URL = URL + "&key=" + GOOGLE_BOOKS_API_KEY;
        console.log("URL:", URL);
        try {
            axios.get(URL).then((res) => {
                setData(res.data.items);
            });
        } catch (errors) {
            console.debug(errors);
        }
        setFormData(INITIAL_STATE);
    };
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
                />
                <label htmlFor="author">Author</label>
                <input
                    id="author"
                    type="text"
                    name="author"
                    placeholder="author"
                    value={formData.author}
                    onChange={handleChange}
                />
                <button onClick={handleSubmit}>Search</button>
            </form>
            {data
                ? data.map((read) => (
                      <ReadCard
                          key={
                              read.volumeInfo.industryIdentifiers[0].identifier
                          }
                          isbn={
                              read.volumeInfo.industryIdentifiers[0].identifier
                          }
                          title={read.volumeInfo.title}
                          publishedDate={read.volumeInfo.publishedDate}
                          description={read.volumeInfo.description}
                          pageCount={read.volumeInfo.pageCount}
                          printType={read.volumeInfo.printType}
                          thumbnail={
                              read.volumeInfo.imageLinks?.thumbnail ?? null
                          }
                          infoLink={read.volumeInfo.infoLink}
                      />
                  ))
                : null}
        </div>
    );
}

export default GoogleBooksSearchForm;
