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
    description VARCHAR(2000),
    isbn VARCHAR(20) UNIQUE NOT NULL,
    avg_rating FLOAT,
    print_type VARCHAR(20),
    published_date DATE,
    info_link VARCHAR(1000),
    page_count INTEGER,
    thumbnail VARCHAR(1000)
);

CREATE TABLE collections
(
    id SERIAL PRIMARY KEY,
    name VARCHAR(30) NOT NULL,
    user_username VARCHAR(30) NOT NULL REFERENCES users (username) ON DELETE CASCADE
);

CREATE TABLE badges
(
    id SERIAL PRIMARY KEY,
    name VARCHAR(30) UNIQUE NOT NULL,
    thumbnail VARCHAR(30) NOT NULL
);

CREATE TABLE users_reads
(
    id SERIAL PRIMARY KEY,
    rating INTEGER,
    review_text VARCHAR(7500),
    review_date DATE,
    user_username VARCHAR(30) NOT NULL REFERENCES users (username) ON DELETE CASCADE,
    read_isbn VARCHAR(20) NOT NULL REFERENCES reads (isbn) ON DELETE CASCADE
);

CREATE TABLE authors
(
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE users_badges
(
    id SERIAL PRIMARY KEY,
    name VARCHAR(30) NOT NULL REFERENCES badges (name) ON DELETE CASCADE,
    user_username VARCHAR(30) NOT NULL REFERENCES users (username) ON DELETE CASCADE
);

CREATE TABLE reads_collections
(
    id SERIAL PRIMARY KEY,
    read_isbn VARCHAR(20) NOT NULL REFERENCES reads (isbn) ON DELETE CASCADE,
    collection_id INTEGER NOT NULL REFERENCES collections ON DELETE CASCADE
);

CREATE TABLE reads_authors
(
    id SERIAL PRIMARY KEY,
    read_isbn VARCHAR(20) NOT NULL REFERENCES reads (isbn) ON DELETE CASCADE,
    author_name VARCHAR(100) NOT NULL REFERENCES authors (name) ON DELETE CASCADE
);

CREATE TABLE journals
(
    id SERIAL PRIMARY KEY,
    title VARCHAR(50) NOT NULL,
    date DATE NOT NULL,
    text VARCHAR(7500),
    user_username VARCHAR(30) NOT NULL REFERENCES users (username) ON DELETE CASCADE
);

CREATE TABLE users_followed
(
    id SERIAL PRIMARY KEY,
    followed_username VARCHAR(30) NOT NULL REFERENCES users (username) ON DELETE CASCADE,
    user_username VARCHAR(30) NOT NULL REFERENCES users (username) ON DELETE CASCADE
);

CREATE TABLE users_followers
(
    id SERIAL PRIMARY KEY,
    follower_username VARCHAR(30) NOT NULL REFERENCES users (username) ON DELETE CASCADE,
    user_username VARCHAR(30) NOT NULL REFERENCES users (username) ON DELETE CASCADE
);

CREATE TABLE recommendations
(
    id SERIAL PRIMARY KEY,
    recommendation VARCHAR(1000) NOT NULL,
    receiver_username VARCHAR(30) NOT NULL REFERENCES users (username) ON DELETE CASCADE,
    sender_username VARCHAR(30) NOT NULL REFERENCES users (username) ON DELETE CASCADE
);

-- test inserts

INSERT INTO users (username, fname, lname, email, password) VALUES 
('t1u', 't1fname', 't1lname', 't1email', 't1password'),
('t2u', 't2fname', 't2lname', 't2email', 't2password'),
('t3u', 't3fname', 't3lname', 't3email', 't3password'),
('t4u', 't4fname', 't4lname', 't4email', 't4password'),
('t5u', 't5fname', 't5lname', 't5email', 't5password');

INSERT INTO reads (title, isbn, description, avg_rating, print_type, published_date) VALUES 
('t1read', 1234567891011, 'test 1 book description', 3.5, 'BOOK', '2023-01-01' ),
('t2read', 1234567891012, 'test 2 book description', 4, 'BOOK', '2023-01-01' ),
('t3read', 1234567891013, 'test 3 book description', 4.5, 'BOOK', '2023-01-01' ),
('t4read', 1234567891014, 'test 4 book description', 5, 'BOOK', '2023-01-01' ),
('t5read', 1234567891015, 'test 5 book description', 2.5, 'BOOK', '2023-01-01' );

INSERT INTO collections (name, user_username) VALUES 
('t1ucollection', 't1u'),
('t2ucollection', 't2u'),
('t3ucollection', 't3u'),
('t4ucollection', 't4u'),
('t5ucollection', 't5u');

INSERT INTO badges (name, thumbnail) VALUES
('t1badge', 't1thumbnail'),
('t2badge', 't2thumbnail'),
('t3badge', 't3thumbnail'),
('t4badge', 't4thumbnail'),
('t5badge', 't5thumbnail');

INSERT INTO users_reads (rating, review_text, review_date, user_username, read_isbn) VALUES
(4, 'test 1 review text', '2023-07-22', 't1u', 1234567891011),
(2, 'test 2 review text', '2023-07-22', 't1u', 1234567891012),
(3, 'test 3 review text', '2023-07-22', 't1u', 1234567891013),
(4, 'test 4 review text', '2023-07-22', 't1u', 1234567891014),
(5, 'test 5 review text', '2023-07-22', 't1u', 1234567891015);

INSERT INTO authors (name) VALUES 
('t1author'),
('t2author'),
('t3author'),
('t4author'),
('t5author');

INSERT INTO users_badges (user_username, name) VALUES
('t1u', 't1badge'),
('t2u', 't2badge'),
('t3u', 't3badge'),
('t4u', 't4badge'),
('t5u', 't5badge');

INSERT INTO reads_collections (read_isbn, collection_id) VALUES
(1234567891011,1),
(1234567891011,2),
(1234567891011,3),
(1234567891012,2),
(1234567891015,3),
(1234567891015,4),
(1234567891015,5);

INSERT INTO reads_authors (read_isbn, author_name) VALUES
(1234567891011,'t1author'),
(1234567891012,'t2author'),
(1234567891013,'t3author'),
(1234567891014,'t4author'),
(1234567891015,'t5author');

INSERT INTO journals (title, date, user_username) VALUES
('t1journal', '2023-07-12', 't1u'),
('t2journal', '2023-07-12', 't2u'),
('t3journal', '2023-07-12', 't3u'),
('t4journal', '2023-07-12', 't4u'),
('t5journal', '2023-07-12', 't5u');

INSERT INTO users_followed (followed_username, user_username) VALUES
('t2u', 't1u'),
('t3u', 't2u'),
('t4u', 't3u'),
('t5u', 't4u'),
('t1u', 't5u');

INSERT INTO users_followers (follower_username, user_username) VALUES
('t1u','t2u'),
('t2u','t3u'),
('t3u','t4u'),
('t4u','t5u'),
('t5u','t1u');

INSERT INTO recommendations (recommendation, receiver_username, sender_username) VALUES
('t1recommendation', 't2u', 't1u'),
('t2recommendation', 't3u', 't2u'),
('t3recommendation', 't4u', 't3u'),
('t4recommendation', 't5u', 't4u'),
('t5recommendation', 't1u', 't5u');

