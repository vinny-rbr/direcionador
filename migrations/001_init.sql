create table if not exists users (
  id serial primary key,
  email text unique not null,
  username text unique not null,
  password_hash text not null,
  display_name text not null default '',
  bio text not null default '',
  theme text not null default 'mono',
  plan text not null default 'free' check (plan in ('free', 'pro')),
  created_at timestamptz not null default now()
);

create table if not exists links (
  id serial primary key,
  user_id integer not null references users(id) on delete cascade,
  label text not null,
  url text not null,
  icon text not null default 'link',
  featured boolean not null default false,
  position integer not null default 0
);

create table if not exists socials (
  id serial primary key,
  user_id integer not null references users(id) on delete cascade,
  icon text not null,
  url text not null,
  position integer not null default 0
);

create index if not exists idx_links_user on links(user_id);
create index if not exists idx_socials_user on socials(user_id);
