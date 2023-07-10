\echo 'Delete and recreate reads_stash db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE IF EXISTS reads_stash;

CREATE DATABASE reads_stash;

\c reads_stash
\i reads-stash-schema.sql

\echo 'Delete and recreate reads_stash_test db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE IF EXISTS reads_stash_test;

CREATE DATABASE reads_stash_test;

\c reads_stash_test
\i reads-stash-schema.sql
\i reads-stash-seed.sql