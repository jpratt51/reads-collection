import React from "react";
import { Link } from "react-router-dom";

const CollectionCard = ({ name, id, username }) => {
    return (
        <div>
            <Link
                to={`/user/collections/${name}`}
                state={{ name, id, username }}
            >
                <h1>{name}</h1>
            </Link>
        </div>
    );
};

export default CollectionCard;
