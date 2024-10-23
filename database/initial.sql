CREATE SEQUENCE seq_users START 1;

CREATE TABLE users(
    id int4 not null default nextval('seq_users'),
    "name" varchar(150) not null,
    password varchar(50) not null,
    created_at timestamptz not null,
    updated_at timestamptz not null,
    deleted_at timestamptz,
    primary key (id)
);

CREATE SEQUENCE seq_manage_urls START 1;

CREATE TABLE manage_urls(
    id int4 not null default nextval('seq_manage_urls'),
    url_origin text not null,
    url_short text not null,
    user_id int4,
    click_count int8 default 0,
    created_at timestamptz not null,
    updated_at timestamptz not null,
    deleted_at timestamptz,
    primary key (id)
);