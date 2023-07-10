INSERT INTO users
    (username, fname, lname, email, password)
VALUES
    ('test1user', 'test1fname', 'test1lname', 'test1email', 'test1password'),
    ('test2user', 'test2fname', 'test2lname', 'test2email', 'test2password');

INSERT INTO reads
    (title)
VALUES
    ('test1read'),
    ('test2read');

INSERT INTO collections
    (name, user_id)
VALUES
    ('test1collection', 1),
    ('test2collection', 2);

INSERT INTO badges
    (name, thumbnail)
VALUES
    ('test1badge', 'test1thumbnail'),
    ('test2badge', 'test2thumbnail');

INSERT INTO users_reads
    (user_id, read_id)
VALUES
    (1,1),
    (2,2);

INSERT INTO authors
    (name)
VALUES
    ('test1author'),
    ('test2author');

INSERT INTO publishers
    (name)
VALUES
    ('test1publisher'),
    ('test2publisher');

INSERT INTO users_badges
    (user_id, badge_id)
VALUES
    (1,1),
    (2,2);

INSERT INTO reads_collections
    (read_id, collection_id)
VALUES
    (1,1),
    (2,2);

INSERT INTO reads_authors
    (read_id, author_id)
VALUES
    (1,1),
    (2,2);

INSERT INTO reads_publishers
    (read_id, publisher_id)
VALUES
    (1,1),
    (2,2);

INSERT INTO journals
    (title, date, text, user_id)
VALUES
    ('test1journal', '2023-07-09', 'test1journalEntry', 1),
    ('test2journal', '2023-07-09', 'test2journalEntry', 2);

INSERT INTO reads_ratings
    (rating, users_reads_id)
VALUES
    (5, 1),
    (4, 2);

INSERT INTO reads_reviews
    (review, date, users_reads_id)
VALUES
    ('test1review', '2023-07-09', 1),
    ('test2review', '2023-07-09', 2);

INSERT INTO followed
    (followed_id, user_id)
VALUES
    (1, 2),
    (2, 1);

INSERT INTO followers
    (follower_id, user_id)
VALUES
    (1,2),
    (2,1);

INSERT INTO recommendations
    (recommendation, friend_id, user_id)
VALUES
    ('test1message', 2, 1),
    ('test2message', 1, 2);