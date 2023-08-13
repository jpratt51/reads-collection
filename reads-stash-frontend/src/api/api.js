import axios from "axios";

const BASE_URL = process.env.REACT_APP_BASE_URL || "http://localhost:3001";

class ReadsStashApi {
    static token;

    static async request(endpoint, data = {}, method = "get") {
        console.debug("API Call:", endpoint, data, method);
        let token;
        try {
            token = JSON.parse(localStorage.getItem("user")) || "";
        } catch {
            token = "";
        }

        const url = `${BASE_URL}/${endpoint}`;
        const headers = { _token: `${token}` };
        const params = method === "get" ? data : {};

        try {
            return (await axios({ url, method, data, params, headers })).data;
        } catch (err) {
            console.error("API Error:", err.response);
            let message = err.response.data.error.message;
            throw Array.isArray(message) ? message : [message];
        }
    }

    static async register(data) {
        let res = await this.request(`api/auth/register`, data, "post");
        return res.token;
    }

    static async login(data) {
        let res = await this.request(`api/auth/login`, data, "post");
        return res.token;
    }

    // static async getAllCompanies() {
    //     let res = await this.request(`companies`);
    //     return res.companies;
    // }

    // static async getCompany(handle) {
    //     let res = await this.request(`companies/${handle}`);
    //     return res.company;
    // }

    // static async findAllCompanies(name = "", minEmployees, maxEmployees) {
    //     let data;
    //     name === ""
    //         ? (data = { minEmployees, maxEmployees })
    //         : (data = { name, minEmployees, maxEmployees });
    //     let res = await this.request(data);
    //     return res.companies;
    // }

    // static async findAllJobs(title = "", minSalary = 0, hasEquity = false) {
    //     let data;
    //     title === ""
    //         ? (data = { minSalary, hasEquity })
    //         : (data = { title, minSalary, hasEquity });
    //     let res = await this.request("jobs", data);
    //     return res.jobs;
    // }

    // static async updateUser(password, firstName, lastName, email) {
    //     const user = JSON.parse(localStorage.getItem("user"));
    //     let data = {};
    //     if (password) data["password"] = password;
    //     if (firstName) data["firstName"] = firstName;
    //     if (lastName) data["lastName"] = lastName;
    //     if (email) data["email"] = email;
    //     let res = await this.request(`users/${user.username}`, data, "patch");
    //     return res;
    // }

    // static async getUserData() {
    //     const user = JSON.parse(localStorage.getItem("user")) || {
    //         username: "test2",
    //     };
    //     let res = await this.request(`users/${user.username}`);
    //     return res;
    // }

    // static async apply(username, jobId) {
    //     let res = await this.request(
    //         `users/${username}/jobs/${jobId}`,
    //         null,
    //         "post"
    //     );
    //     return res;
    // }
}

export default ReadsStashApi;
