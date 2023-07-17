CREATE TABLE users
(
    id SERIAL PRIMARY KEY,
    username VARCHAR(30) UNIQUE NOT NULL,
    fname VARCHAR(30) NOT NULL,
    lname VARCHAR(30) NOT NULL,
    email VARCHAR(50) NOT NULL,
    password TEXT NOT NULL,
    exp INTEGER,
    total_books INTEGER,
    total_pages INTEGER
);

CREATE TABLE reads
(
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    description VARCHAR(500),
    isbn VARCHAR(20),
    avg_rating INTEGER,
    print_type VARCHAR(20),
    publisher VARCHAR(50)
);

CREATE TABLE collections
(
    id SERIAL PRIMARY KEY,
    name VARCHAR(30) NOT NULL,
    user_id INTEGER NOT NULL REFERENCES users ON DELETE CASCADE
);

CREATE TABLE badges
(
    id SERIAL PRIMARY KEY,
    name VARCHAR(30) NOT NULL,
    thumbnail VARCHAR(30) NOT NULL
);

CREATE TABLE users_reads
(
    id SERIAL PRIMARY KEY,
    rating INTEGER,
    review_text VARCHAR(7500),
    review_date DATE,
    user_id INTEGER NOT NULL REFERENCES users ON DELETE CASCADE,
    read_id INTEGER NOT NULL REFERENCES reads ON DELETE CASCADE
);

CREATE TABLE authors
(
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

CREATE TABLE users_badges
(
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users ON DELETE CASCADE,
    badge_id INTEGER NOT NULL REFERENCES badges ON DELETE CASCADE
);

CREATE TABLE reads_collections
(
    id SERIAL PRIMARY KEY,
    read_id INTEGER NOT NULL REFERENCES reads ON DELETE CASCADE,
    collection_id INTEGER NOT NULL REFERENCES collections ON DELETE CASCADE
);

CREATE TABLE reads_authors
(
    id SERIAL PRIMARY KEY,
    read_id INTEGER NOT NULL REFERENCES reads ON DELETE CASCADE,
    author_id INTEGER NOT NULL REFERENCES authors ON DELETE CASCADE
);

CREATE TABLE journals
(
    id SERIAL PRIMARY KEY,
    title VARCHAR(50) NOT NULL,
    date DATE NOT NULL,
    text VARCHAR(7500),
    user_id INTEGER NOT NULL REFERENCES users ON DELETE CASCADE
);

CREATE TABLE users_followed
(
    id SERIAL PRIMARY KEY,
    followed_id INTEGER UNIQUE NOT NULL REFERENCES users ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users ON DELETE CASCADE
);

CREATE TABLE users_followers
(
    id SERIAL PRIMARY KEY,
    follower_id INTEGER UNIQUE NOT NULL REFERENCES users ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users ON DELETE CASCADE
);

CREATE TABLE recommendations
(
    id SERIAL PRIMARY KEY,
    recommendation VARCHAR(1000) NOT NULL,
    receiver_id INTEGER NOT NULL REFERENCES users ON DELETE CASCADE,
    sender_id INTEGER NOT NULL REFERENCES users ON DELETE CASCADE
);

-- test inserts

INSERT INTO users (username, fname, lname, email, password) VALUES 
('t1u', 't1fname', 't1lname', 't1email', 't1password'),
('t2u', 't2fname', 't2lname', 't2email', 't2password'),
('t3u', 't3fname', 't3lname', 't3email', 't3password'),
('t4u', 't4fname', 't4lname', 't4email', 't4password'),
('t5u', 't5fname', 't5lname', 't5email', 't5password');

INSERT INTO reads (title, isbn) VALUES 
('t1read', 1234567891011),
('t2read', 1234567891012),
('t3read', 1234567891013),
('t4read', 1234567891014),
('t5read', 1234567891015);

INSERT INTO collections (name, user_id) VALUES 
('t1ucollection', 1),
('t2ucollection', 2),
('t3ucollection', 3),
('t4ucollection', 4),
('t5ucollection', 5);

INSERT INTO badges (name, thumbnail) VALUES
('t1badge', 't1thumbnail'),
('t2badge', 't2thumbnail'),
('t3badge', 't3thumbnail'),
('t4badge', 't4thumbnail'),
('t5badge', 't5thumbnail');

INSERT INTO users_reads (user_id, read_id) VALUES
(1, 1),
(2, 2),
(3, 3),
(4, 4),
(5, 5);

INSERT INTO authors (name) VALUES 
('t1author'),
('t2author'),
('t3author'),
('t4author'),
('t5author');

INSERT INTO users_badges (user_id, badge_id) VALUES
(1, 1),
(2, 2),
(3, 3),
(4, 4),
(5, 5);

INSERT INTO reads_collections (read_id, collection_id) VALUES
(1,1),
(2,2),
(3,3),
(4,4),
(5,5);

INSERT INTO reads_authors (read_id, author_id) VALUES
(1,1),
(2,2),
(3,3),
(4,4),
(5,5);

INSERT INTO journals (title, date, user_id) VALUES
('t1journal', '2023-07-12', 1),
('t2journal', '2023-07-12', 2),
('t3journal', '2023-07-12', 3),
('t4journal', '2023-07-12', 4),
('t5journal', '2023-07-12', 5);

INSERT INTO users_followed (followed_id, user_id) VALUES
(2, 1),
(3, 2),
(4, 3),
(5, 4),
(1, 5);

INSERT INTO users_followers (follower_id, user_id) VALUES
(1,2),
(2,3),
(3,4),
(4,5),
(5,1);

INSERT INTO recommendations (recommendation, receiver_id, sender_id) VALUES
('t1recommendation', 2, 1),
('t2recommendation', 3, 2),
('t3recommendation', 4, 3),
('t4recommendation', 5, 4),
('t5recommendation', 1, 5);

