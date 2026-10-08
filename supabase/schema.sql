-- NDMO / NDI Compliance Tracker – database schema (v2)
-- Safe to run again at any time: it NEVER deletes existing data. Run it again after every software upgrade.
create extension if not exists pgcrypto with schema extensions;

create table if not exists app_users (
  id uuid primary key default gen_random_uuid(), username text unique not null, display_name text,
  role text not null default 'viewer' check (role in ('admin','contributor','viewer')),
  pass_hash text not null, active boolean not null default true, must_change boolean not null default false,
  failed_attempts int not null default 0, locked_until timestamptz, last_login timestamptz, created_at timestamptz not null default now());
create table if not exists app_sessions (token uuid primary key default gen_random_uuid(), user_id uuid not null references app_users(id) on delete cascade, expires_at timestamptz not null);
create table if not exists app_settings (key text primary key, value jsonb);
create table if not exists app_progress (
  item_key text primary key, done boolean not null default false, done_at timestamptz, due date, owner text, reviewer text,
  wf text not null default 'Not started', start_date date, pct int not null default 0, ref text, note text,
  is_sample boolean not null default false, updated_by text, updated_at timestamptz not null default now());
create table if not exists app_files (id bigserial primary key, item_key text not null, filename text not null, mime text, size int, data text not null, uploaded_by text, uploaded_at timestamptz default now(), is_sample boolean default false);
create index if not exists app_files_key on app_files(item_key);
create table if not exists app_nodes (id uuid primary key default gen_random_uuid(), parent_id uuid references app_nodes(id) on delete cascade, mode text not null check (mode in ('ndmo','ndi','oe')), title text not null, body text default '', sort int default 0, created_by text, updated_at timestamptz default now());
create table if not exists app_audit (id bigserial primary key, at timestamptz default now(), username text, action text, detail text);
create table if not exists app_meta (key text primary key, value text);
-- future upgrades: add new columns here with "alter table ... add column if not exists ..."
insert into app_meta values ('schema_version','2') on conflict (key) do update set value = excluded.value;

alter table app_users enable row level security; alter table app_sessions enable row level security; alter table app_settings enable row level security;
alter table app_progress enable row level security; alter table app_files enable row level security; alter table app_nodes enable row level security;
alter table app_audit enable row level security; alter table app_meta enable row level security;
revoke all on app_users, app_sessions, app_settings, app_progress, app_files, app_nodes, app_audit, app_meta from public, anon, authenticated;

-- first administrator (only when there are no users yet). You must change this password at first login.
insert into app_users (username, display_name, role, pass_hash, must_change)
select 'admin', 'Administrator', 'admin', extensions.crypt('admin', extensions.gen_salt('bf')), true where not exists (select 1 from app_users);

-- ---------- internal helpers (not callable from the browser) ----------
create or replace function _me(tok uuid) returns app_users language plpgsql security definer set search_path = public, extensions as $$
declare u app_users;
begin
  select au.* into u from app_sessions s join app_users au on au.id = s.user_id where s.token = tok and s.expires_at > now() and au.active;
  if not found then raise exception 'not_authenticated'; end if;
  return u;
end $$;
create or replace function _need(tok uuid, roles text[]) returns app_users language plpgsql security definer set search_path = public, extensions as $$
declare u app_users;
begin u := _me(tok); if not (u.role = any(roles)) then raise exception 'forbidden'; end if; return u; end $$;
create or replace function _audit(who text, act text, det text default '') returns void language sql security definer set search_path = public as $$
  insert into app_audit (username, action, detail) values (who, act, det) $$;
revoke execute on function _me(uuid), _need(uuid, text[]), _audit(text, text, text) from public, anon, authenticated;

-- ---------- authentication ----------
create or replace function app_login(p_username text, p_password text) returns json language plpgsql security definer set search_path = public, extensions as $$
declare u app_users; t uuid;
begin
  select * into u from app_users where lower(username) = lower(p_username);
  if not found then perform _audit(p_username, 'login_failed', 'unknown user'); return json_build_object('error', 'invalid_credentials'); end if;
  if not u.active then return json_build_object('error', 'account_disabled'); end if;
  if u.locked_until is not null and u.locked_until > now() then return json_build_object('error', 'account_locked'); end if;
  if u.pass_hash <> crypt(p_password, u.pass_hash) then
    update app_users set failed_attempts = failed_attempts + 1, locked_until = case when failed_attempts + 1 >= 5 then now() + interval '15 minutes' else null end where id = u.id;
    perform _audit(u.username, 'login_failed', 'wrong password'); return json_build_object('error', 'invalid_credentials');
  end if;
  update app_users set failed_attempts = 0, locked_until = null, last_login = now() where id = u.id;
  delete from app_sessions where expires_at < now();
  insert into app_sessions (user_id, expires_at) values (u.id, now() + interval '12 hours') returning token into t;
  perform _audit(u.username, 'login', '');
  return json_build_object('token', t);
end $$;
create or replace function app_logout(tok uuid) returns void language sql security definer set search_path = public as $$ delete from app_sessions where token = tok $$;
create or replace function app_change_password(tok uuid, old_pw text, new_pw text) returns void language plpgsql security definer set search_path = public, extensions as $$
declare u app_users;
begin
  u := _me(tok);
  if u.pass_hash <> crypt(old_pw, u.pass_hash) then raise exception 'wrong_password'; end if;
  if length(new_pw) < 8 or new_pw = 'admin' then raise exception 'weak_password'; end if;
  update app_users set pass_hash = crypt(new_pw, gen_salt('bf')), must_change = false where id = u.id;
  perform _audit(u.username, 'password_changed', '');
end $$;

-- ---------- load everything the screen needs in one call ----------
create or replace function app_get_state(tok uuid) returns json language plpgsql security definer set search_path = public, extensions as $$
declare u app_users;
begin
  u := _me(tok);
  return json_build_object(
    'me', json_build_object('username', u.username, 'display_name', u.display_name, 'role', u.role, 'must_change', u.must_change),
    'settings', coalesce((select json_object_agg(key, value) from app_settings), '{}'::json),
    'progress', coalesce((select json_agg(x) from (select p.item_key, p.done, p.done_at, p.due, p.owner, p.reviewer, p.wf, p.start_date, p.pct, p.ref, p.note, p.is_sample, p.updated_by,
        (select count(*) from app_files f where f.item_key = p.item_key) as files from app_progress p) x), '[]'::json),
    'nodes', coalesce((select json_agg(n order by n.sort, n.title) from app_nodes n), '[]'::json));
end $$;

-- ---------- tracking ----------
create or replace function app_set_progress(tok uuid, k text, patch jsonb) returns void language plpgsql security definer set search_path = public, extensions as $$
declare u app_users; fin boolean := coalesce((patch->>'done')::boolean, false);
begin
  u := _need(tok, array['admin', 'contributor']);
  if (patch ? 'done') and fin and not exists (select 1 from app_files where item_key = k)
     and coalesce(nullif(coalesce(patch->>'ref', (select ref from app_progress where item_key = k)), ''), '') = '' then
    raise exception 'evidence_required';
  end if;
  insert into app_progress (item_key) values (k) on conflict do nothing;
  update app_progress set
    done_at = case when (patch ? 'date') and (done or fin) then (patch->>'date')::timestamptz
                   when (patch ? 'done') and fin then coalesce(done_at, now())
                   when (patch ? 'done') then null else done_at end,
    done = case when patch ? 'done' then fin else done end,
    wf = case when (patch ? 'done') and fin then 'Completed' when (patch ? 'done') and wf = 'Completed' then 'In progress' else coalesce(patch->>'wf', wf) end,
    pct = case when (patch ? 'done') and fin then 100 else coalesce(nullif(patch->>'pct', '')::int, pct) end,
    due = case when patch ? 'due' then nullif(patch->>'due', '')::date else due end,
    start_date = case when patch ? 'start' then nullif(patch->>'start', '')::date else start_date end,
    owner = case when patch ? 'owner' then patch->>'owner' else owner end,
    reviewer = case when patch ? 'reviewer' then patch->>'reviewer' else reviewer end,
    ref = case when patch ? 'ref' then patch->>'ref' else ref end,
    note = case when patch ? 'note' then patch->>'note' else note end,
    is_sample = false, updated_by = u.username, updated_at = now()
  where item_key = k;
  if patch ? 'done' then perform _audit(u.username, case when fin then 'completed' else 'reopened' end, k); end if;
end $$;
create or replace function app_bulk_progress(tok uuid, p_rows jsonb, p_wipe boolean default false) returns int language plpgsql security definer set search_path = public, extensions as $$
declare u app_users; n int;
begin
  u := _need(tok, array['admin']);
  if p_wipe then delete from app_files where is_sample; delete from app_progress where is_sample; end if;
  insert into app_progress (item_key, done, done_at, due, owner, reviewer, wf, start_date, pct, ref, note, is_sample, updated_by)
  select r->>'k', coalesce((r->>'done')::boolean, false), nullif(r->>'date', '')::timestamptz, nullif(r->>'due', '')::date, r->>'owner', r->>'reviewer',
         coalesce(r->>'wf', 'Not started'), nullif(r->>'start', '')::date, coalesce((r->>'pct')::int, 0), r->>'ref', r->>'note', coalesce((r->>'sample')::boolean, true), u.username
  from jsonb_array_elements(p_rows) r
  on conflict (item_key) do update set done = excluded.done, done_at = excluded.done_at, due = excluded.due, owner = excluded.owner, reviewer = excluded.reviewer, wf = excluded.wf,
    start_date = excluded.start_date, pct = excluded.pct, ref = excluded.ref, note = excluded.note, is_sample = excluded.is_sample, updated_by = excluded.updated_by, updated_at = now()
  where app_progress.is_sample;   -- real (non-sample) data is never overwritten
  get diagnostics n = row_count;
  perform _audit(u.username, case when p_wipe then 'sample_populated' else 'bulk_import' end, n || ' rows');
  return n;
end $$;
create or replace function app_clear(tok uuid, p_what text) returns void language plpgsql security definer set search_path = public, extensions as $$
declare u app_users;
begin
  u := _need(tok, array['admin']);
  if p_what = 'sample' then delete from app_files where is_sample; delete from app_progress where is_sample;
  elsif p_what = 'all' then delete from app_files; delete from app_progress;
  else raise exception 'bad_request'; end if;
  perform _audit(u.username, 'cleared_' || p_what, '');
end $$;

-- ---------- evidence files ----------
create or replace function app_add_file(tok uuid, k text, fname text, mime text, b64 text) returns bigint language plpgsql security definer set search_path = public, extensions as $$
declare u app_users; fid bigint;
begin
  u := _need(tok, array['admin', 'contributor']);
  if length(b64) > 4500000 then raise exception 'file_too_large'; end if;
  insert into app_progress (item_key) values (k) on conflict do nothing;
  insert into app_files (item_key, filename, mime, size, data, uploaded_by) values (k, fname, mime, (length(b64) * 3 / 4)::int, b64, u.username) returning id into fid;
  perform _audit(u.username, 'file_uploaded', k || ' / ' || fname);
  return fid;
end $$;
create or replace function app_list_files(tok uuid, k text) returns json language plpgsql security definer set search_path = public as $$
begin perform _me(tok);
  return coalesce((select json_agg(json_build_object('id', id, 'filename', filename, 'mime', mime, 'size', size, 'uploaded_by', uploaded_by, 'uploaded_at', uploaded_at) order by id) from app_files where item_key = k), '[]'::json);
end $$;
create or replace function app_get_file(tok uuid, p_id bigint) returns json language plpgsql security definer set search_path = public as $$
begin perform _me(tok);
  return (select json_build_object('filename', filename, 'mime', mime, 'data', data) from app_files where id = p_id);
end $$;
create or replace function app_get_files_bulk(tok uuid, p_keys text[]) returns json language plpgsql security definer set search_path = public as $$
begin perform _me(tok);
  return coalesce((select json_agg(json_build_object('item_key', item_key, 'filename', filename, 'mime', mime, 'data', data)) from app_files where item_key = any(p_keys)), '[]'::json);
end $$;
create or replace function app_delete_file(tok uuid, p_id bigint) returns void language plpgsql security definer set search_path = public as $$
declare u app_users; f app_files;
begin
  u := _need(tok, array['admin', 'contributor']);
  select * into f from app_files where id = p_id;
  if found and (u.role = 'admin' or f.uploaded_by = u.username) then delete from app_files where id = p_id; perform _audit(u.username, 'file_deleted', f.item_key || ' / ' || f.filename);
  else raise exception 'forbidden'; end if;
end $$;

-- ---------- user management (admin only) ----------
create or replace function app_list_users(tok uuid) returns json language plpgsql security definer set search_path = public as $$
begin perform _need(tok, array['admin']);
  return coalesce((select json_agg(json_build_object('id', id, 'username', username, 'display_name', display_name, 'role', role, 'active', active, 'locked', coalesce(locked_until > now(), false), 'last_login', last_login, 'created_at', created_at) order by username) from app_users), '[]'::json);
end $$;
create or replace function app_create_user(tok uuid, p_username text, p_display text, p_role text, p_password text) returns void language plpgsql security definer set search_path = public, extensions as $$
declare a app_users;
begin
  a := _need(tok, array['admin']);
  if p_username !~ '^[A-Za-z0-9._-]{3,40}$' then raise exception 'bad_username'; end if;
  if length(p_password) < 8 then raise exception 'weak_password'; end if;
  if p_role not in ('admin', 'contributor', 'viewer') then raise exception 'bad_role'; end if;
  insert into app_users (username, display_name, role, pass_hash, must_change) values (p_username, p_display, p_role, crypt(p_password, gen_salt('bf')), true);
  perform _audit(a.username, 'user_created', p_username || ' (' || p_role || ')');
exception when unique_violation then raise exception 'username_taken';
end $$;
create or replace function app_update_user(tok uuid, p_uid uuid, p_display text, p_role text, p_active boolean, p_unlock boolean default false) returns void language plpgsql security definer set search_path = public as $$
declare a app_users; t app_users;
begin
  a := _need(tok, array['admin']);
  select * into t from app_users where id = p_uid;
  if not found then raise exception 'user_not_found'; end if;
  if p_role not in ('admin', 'contributor', 'viewer') then raise exception 'bad_role'; end if;
  if t.role = 'admin' and (p_role <> 'admin' or not p_active) and (select count(*) from app_users where role = 'admin' and active and id <> p_uid) = 0 then raise exception 'last_admin'; end if;
  update app_users set display_name = p_display, role = p_role, active = p_active,
    failed_attempts = case when p_unlock then 0 else failed_attempts end, locked_until = case when p_unlock then null else locked_until end where id = p_uid;
  if (not p_active) or p_role <> t.role then delete from app_sessions where user_id = p_uid; end if;
  perform _audit(a.username, 'user_updated', t.username || ' role=' || p_role || ' active=' || p_active::text);
end $$;
create or replace function app_reset_password(tok uuid, p_uid uuid, p_password text) returns void language plpgsql security definer set search_path = public, extensions as $$
declare a app_users;
begin
  a := _need(tok, array['admin']);
  if length(p_password) < 8 then raise exception 'weak_password'; end if;
  update app_users set pass_hash = crypt(p_password, gen_salt('bf')), must_change = true, failed_attempts = 0, locked_until = null where id = p_uid;
  delete from app_sessions where user_id = p_uid;
  perform _audit(a.username, 'password_reset', p_uid::text);
end $$;
create or replace function app_revoke_sessions(tok uuid, p_uid uuid default null) returns void language plpgsql security definer set search_path = public as $$
declare a app_users;
begin
  a := _need(tok, array['admin']);
  delete from app_sessions where (p_uid is null and user_id <> a.id) or user_id = p_uid;
  perform _audit(a.username, 'sessions_revoked', coalesce(p_uid::text, 'all others'));
end $$;
create or replace function app_audit(tok uuid, p_limit int default 200) returns json language plpgsql security definer set search_path = public as $$
begin perform _need(tok, array['admin']);
  return coalesce((select json_agg(x) from (select at, username, action, detail from app_audit order by id desc limit p_limit) x), '[]'::json);
end $$;

-- ---------- branding / menu content (admin only) ----------
create or replace function app_save_setting(tok uuid, p_key text, p_value jsonb) returns void language plpgsql security definer set search_path = public as $$
declare a app_users;
begin
  a := _need(tok, array['admin']);
  if p_key not in ('color', 'logo', 'seal', 'signature') then raise exception 'bad_request'; end if;
  insert into app_settings (key, value) values (p_key, p_value) on conflict (key) do update set value = excluded.value;
  perform _audit(a.username, 'setting_saved', p_key);
end $$;
create or replace function app_save_node(tok uuid, p_id uuid, p_parent uuid, p_mode text, p_title text, p_body text, p_sort int) returns uuid language plpgsql security definer set search_path = public as $$
declare a app_users; nid uuid;
begin
  a := _need(tok, array['admin']);
  if p_id is null then
    insert into app_nodes (parent_id, mode, title, body, sort, created_by) values (p_parent, p_mode, p_title, coalesce(p_body, ''), coalesce(p_sort, 0), a.username) returning id into nid;
  else
    update app_nodes set title = p_title, body = coalesce(p_body, ''), sort = coalesce(p_sort, sort), updated_at = now() where id = p_id returning id into nid;
  end if;
  perform _audit(a.username, 'menu_saved', p_title);
  return nid;
end $$;
create or replace function app_delete_node(tok uuid, p_id uuid) returns void language plpgsql security definer set search_path = public as $$
declare a app_users;
begin
  a := _need(tok, array['admin']);
  delete from app_progress where item_key = 'X:' || p_id::text;
  delete from app_nodes where id = p_id;
  perform _audit(a.username, 'menu_deleted', p_id::text);
end $$;

-- ---------- backup / restore (admin only) ----------
create or replace function app_export(tok uuid, p_files boolean default false) returns json language plpgsql security definer set search_path = public as $$
declare a app_users;
begin
  a := _need(tok, array['admin']);
  perform _audit(a.username, 'exported_backup', case when p_files then 'with files' else 'without files' end);
  return json_build_object('version', 2, 'exported_at', now(),
    'progress', coalesce((select json_agg(p) from app_progress p), '[]'::json), 'nodes', coalesce((select json_agg(n) from app_nodes n), '[]'::json),
    'settings', coalesce((select json_object_agg(key, value) from app_settings), '{}'::json),
    'users', coalesce((select json_agg(json_build_object('username', username, 'display_name', display_name, 'role', role, 'active', active)) from app_users), '[]'::json),
    'files', case when p_files then coalesce((select json_agg(f) from app_files f), '[]'::json) else '[]'::json end);
end $$;
create or replace function app_import(tok uuid, p_data jsonb) returns void language plpgsql security definer set search_path = public as $$
declare a app_users; r jsonb;
begin
  a := _need(tok, array['admin']);
  for r in select value from jsonb_array_elements(coalesce(p_data->'progress', '[]'::jsonb)) loop
    insert into app_progress (item_key, done, done_at, due, owner, reviewer, wf, start_date, pct, ref, note, is_sample, updated_by)
    values (r->>'item_key', coalesce((r->>'done')::boolean, false), nullif(r->>'done_at', '')::timestamptz, nullif(r->>'due', '')::date, r->>'owner', r->>'reviewer', coalesce(r->>'wf', 'Not started'),
            nullif(r->>'start_date', '')::date, coalesce((r->>'pct')::int, 0), r->>'ref', r->>'note', coalesce((r->>'is_sample')::boolean, false), r->>'updated_by')
    on conflict (item_key) do update set done = excluded.done, done_at = excluded.done_at, due = excluded.due, owner = excluded.owner, reviewer = excluded.reviewer, wf = excluded.wf,
      start_date = excluded.start_date, pct = excluded.pct, ref = excluded.ref, note = excluded.note, is_sample = excluded.is_sample, updated_at = now();
  end loop;
  for r in select value from jsonb_array_elements(coalesce(p_data->'nodes', '[]'::jsonb)) loop
    insert into app_nodes (id, mode, title, body, sort, created_by) values ((r->>'id')::uuid, r->>'mode', r->>'title', coalesce(r->>'body', ''), coalesce((r->>'sort')::int, 0), r->>'created_by')
    on conflict (id) do update set title = excluded.title, body = excluded.body, sort = excluded.sort;
  end loop;
  for r in select value from jsonb_array_elements(coalesce(p_data->'nodes', '[]'::jsonb)) loop
    update app_nodes set parent_id = nullif(r->>'parent_id', '')::uuid where id = (r->>'id')::uuid;
  end loop;
  insert into app_settings (key, value) select key, value from jsonb_each(coalesce(p_data->'settings', '{}'::jsonb)) on conflict (key) do update set value = excluded.value;
  for r in select value from jsonb_array_elements(coalesce(p_data->'files', '[]'::jsonb)) loop
    insert into app_files (id, item_key, filename, mime, size, data, uploaded_by, uploaded_at) values ((r->>'id')::bigint, r->>'item_key', r->>'filename', r->>'mime', (r->>'size')::int, r->>'data', r->>'uploaded_by', (r->>'uploaded_at')::timestamptz)
    on conflict (id) do nothing;
  end loop;
  perform setval(pg_get_serial_sequence('app_files', 'id'), greatest((select coalesce(max(id), 1) from app_files), 1));
  perform _audit(a.username, 'imported_backup', '');
end $$;
