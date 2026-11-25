-- Chạy toàn bộ file này trong Supabase: SQL Editor > New query > Run. File chạy lại nhiều lần được; nếu đã chạy bản trước, hãy chạy lại cả file.
-- (Nếu bạn đã chạy bản cũ có bảng `trees` kiểu mỗi người một dòng và chưa có dữ liệu quan trọng,
--  hãy chạy trước:  drop table if exists public.trees cascade;  rồi chạy file này.)

-- 1) Bảng các cây tri thức: mỗi người có nhiều cây
create table if not exists public.trees (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null default 'Cây của tôi',
  data        jsonb not null,
  version     integer not null default 1,
  share_token text unique,                       -- có giá trị = đang bật liên kết chia sẻ (chỉ xem)
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists trees_user_idx on public.trees (user_id);

alter table public.trees enable row level security;
drop policy if exists "trees_select_own" on public.trees;
create policy "trees_select_own" on public.trees for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "trees_insert_own" on public.trees;
create policy "trees_insert_own" on public.trees for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists "trees_update_own" on public.trees;
create policy "trees_update_own" on public.trees for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists "trees_delete_own" on public.trees;
create policy "trees_delete_own" on public.trees for delete to authenticated using ((select auth.uid()) = user_id);

-- 2) Chia sẻ chỉ xem: người xem chỉ lấy được cây khi biết đúng mã chia sẻ (không liệt kê được)
create or replace function public.get_shared_tree(tok text)
returns table (name text, data jsonb)
language sql security definer set search_path = public as $$
  select t.name, t.data - 'T' - 'V' - 'sel' from public.trees t
  where tok is not null and length(tok) >= 16 and t.share_token = tok
$$;
revoke all on function public.get_shared_tree(text) from public;
grant execute on function public.get_shared_tree(text) to anon, authenticated;

-- 3) Xoá tài khoản của chính mình (các cây bị xoá theo)
create or replace function public.delete_my_account()
returns void language plpgsql security definer set search_path = public, auth as $$
begin
  delete from auth.users where id = auth.uid();
end $$;
revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;

-- 4) Kho ảnh riêng tư; mỗi người chỉ truy cập thư mục mang id của mình
insert into storage.buckets (id, name, public) values ('note-images', 'note-images', false)
on conflict (id) do nothing;

drop policy if exists "images_select_own" on storage.objects;
create policy "images_select_own" on storage.objects for select to authenticated
  using (bucket_id = 'note-images' and (storage.foldername(name))[1] = (select auth.uid())::text);
drop policy if exists "images_insert_own" on storage.objects;
create policy "images_insert_own" on storage.objects for insert to authenticated
  with check (bucket_id = 'note-images' and (storage.foldername(name))[1] = (select auth.uid())::text);
drop policy if exists "images_delete_own" on storage.objects;
create policy "images_delete_own" on storage.objects for delete to authenticated
  using (bucket_id = 'note-images' and (storage.foldername(name))[1] = (select auth.uid())::text);
-- 5) Gửi chỉ phần thay đổi: ghép "bản vá" vào cây ngay trong cơ sở dữ liệu (kiểm tra phiên bản để chống ghi đè)
create or replace function public.patch_tree(p_id uuid, p_base integer, p_patch jsonb)
returns integer
language plpgsql
set search_path = public
as $$
declare
  cur_version integer;
  d jsonb;
  nn jsonb;
begin
  select version, data into cur_version, d
    from public.trees where id = p_id and user_id = auth.uid() for update;
  if not found then raise exception 'not_found'; end if;
  if cur_version <> p_base then raise exception 'conflict'; end if;

  nn := coalesce(d -> 'N', '{}'::jsonb) || coalesce(p_patch -> 'set', '{}'::jsonb);   -- thêm/sửa note
  if jsonb_array_length(coalesce(p_patch -> 'del', '[]'::jsonb)) > 0 then             -- xoá note
    nn := nn - (select array_agg(x) from jsonb_array_elements_text(p_patch -> 'del') x);
  end if;
  d := jsonb_set(d, '{N}', nn);
  d := d || coalesce(p_patch -> 'top', '{}'::jsonb);                                    -- uid, T, lv, rad, LK

  update public.trees set data = d, version = cur_version + 1, updated_at = now() where id = p_id;
  return cur_version + 1;
end $$;
revoke all on function public.patch_tree(uuid, integer, jsonb) from public, anon;
grant execute on function public.patch_tree(uuid, integer, jsonb) to authenticated;

-- 6) Bản vá theo từng trường: với note đã có, chỉ gửi các trường đã đổi (ví dụ kéo note chỉ gửi x, y, không gửi lại nội dung trang).
--    Trang tự dùng hàm này khi có; nếu chưa cài thì vẫn dùng patch_tree ở phần 5.
--    p_patch = { "set": {id: note mới}, "upd": {id: {"s": {trường: giá trị}, "d": [trường bị bỏ]}}, "del": [id], "top": {...} }
create or replace function public.patch_tree2(p_id uuid, p_base integer, p_patch jsonb)
returns integer
language plpgsql
set search_path = public
as $$
declare
  cur_version integer;
  d jsonb;
  nn jsonb;
  k text;
  v jsonb;
begin
  select version, data into cur_version, d
    from public.trees where id = p_id and user_id = auth.uid() for update;
  if not found then raise exception 'not_found'; end if;
  if cur_version <> p_base then raise exception 'conflict'; end if;

  nn := coalesce(d -> 'N', '{}'::jsonb) || coalesce(p_patch -> 'set', '{}'::jsonb);   -- note mới
  for k, v in select * from jsonb_each(coalesce(p_patch -> 'upd', '{}'::jsonb)) loop  -- sửa từng trường của note đã có
    if nn ? k then
      nn := jsonb_set(nn, array[k],
              ((nn -> k) || coalesce(v -> 's', '{}'::jsonb))
              - coalesce((select array_agg(x) from jsonb_array_elements_text(coalesce(v -> 'd', '[]'::jsonb)) x), '{}'::text[]));
    end if;
  end loop;
  if jsonb_array_length(coalesce(p_patch -> 'del', '[]'::jsonb)) > 0 then             -- xoá note
    nn := nn - (select array_agg(x) from jsonb_array_elements_text(p_patch -> 'del') x);
  end if;
  d := jsonb_set(d, '{N}', nn);
  d := d || coalesce(p_patch -> 'top', '{}'::jsonb);                                    -- uid, T, lv, rad, LK

  update public.trees set data = d, version = cur_version + 1, updated_at = now() where id = p_id;
  return cur_version + 1;
end $$;
revoke all on function public.patch_tree2(uuid, integer, jsonb) from public, anon;
grant execute on function public.patch_tree2(uuid, integer, jsonb) to authenticated;

-- 7) Giới hạn để một tài khoản không làm đầy cơ sở dữ liệu: mỗi cây tối đa 10 MB, mỗi người tối đa 100 cây.
--    "not valid": các cây đã có sẵn không bị kiểm tra lúc chạy file, nhưng mọi lần lưu sau đó đều bị kiểm tra.
alter table public.trees drop constraint if exists trees_data_size;
alter table public.trees add constraint trees_data_size check (pg_column_size(data) <= 10485760) not valid;

create or replace function public.trees_limit()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if (select count(*) from public.trees where user_id = new.user_id) >= 100 then
    raise exception 'too_many_trees';
  end if;
  return new;
end $$;
drop trigger if exists trees_limit on public.trees;
create trigger trees_limit before insert on public.trees
  for each row execute function public.trees_limit();

-- 8) Thiết bị đã đăng nhập: xem danh sách, xem thiết bị nào đang hoạt động, đăng xuất từ xa.
--    Mỗi trình duyệt/thiết bị tự báo "tôi còn hoạt động" (touch_device) khoảng mỗi phút khi đang mở.
--    revoke_device xoá phiên đăng nhập (auth.sessions) của thiết bị đó, nên nó không làm mới được token nữa và bị đăng xuất.
create table if not exists public.devices (
  id         uuid primary key,                                   -- do trình duyệt tự sinh, lưu trong localStorage
  user_id    uuid not null references auth.users(id) on delete cascade,
  session_id uuid,                                               -- phiên đăng nhập hiện tại của thiết bị (claim session_id trong JWT)
  name       text not null default '',
  ua         text not null default '',
  created_at timestamptz not null default now(),
  last_seen  timestamptz not null default now(),
  revoked_at timestamptz
);
create index if not exists devices_user_idx on public.devices (user_id, last_seen desc);
alter table public.devices enable row level security;           -- không có policy: chỉ truy cập qua các hàm bên dưới

-- Thiết bị gọi định kỳ. Trả 'ok', hoặc 'revoked' nếu thiết bị này đã bị đăng xuất từ xa (khi đó phải tự đăng xuất).
create or replace function public.touch_device(p_id uuid, p_name text, p_ua text)
returns text
language plpgsql security definer set search_path = public
as $$
declare
  uid uuid := auth.uid();
  sid uuid := nullif(auth.jwt() ->> 'session_id', '')::uuid;
  d public.devices;
begin
  if uid is null then raise exception 'not_authenticated'; end if;
  select * into d from public.devices where id = p_id;
  if found and d.user_id <> uid then raise exception 'forbidden'; end if;
  if found and d.revoked_at is not null and d.session_id is not distinct from sid then
    return 'revoked';                                              -- vẫn là phiên cũ đã bị thu hồi
  end if;
  insert into public.devices (id, user_id, session_id, name, ua, last_seen, revoked_at)
  values (p_id, uid, sid, left(coalesce(p_name, ''), 80), left(coalesce(p_ua, ''), 300), now(), null)
  on conflict (id) do update
    set session_id = excluded.session_id, name = excluded.name, ua = excluded.ua, last_seen = now(), revoked_at = null;
  return 'ok';
end $$;

-- Danh sách thiết bị của tôi (chưa bị đăng xuất). online = có tín hiệu trong 3 phút gần nhất.
create or replace function public.list_devices()
returns table (id uuid, name text, created_at timestamptz, last_seen timestamptz, online boolean)
language sql stable security definer set search_path = public
as $$
  select d.id, d.name, d.created_at, d.last_seen, d.last_seen > now() - interval '3 minutes'
  from public.devices d
  where d.user_id = auth.uid() and d.revoked_at is null
  order by d.last_seen desc
$$;

-- Đăng xuất một thiết bị từ xa.
create or replace function public.revoke_device(p_id uuid)
returns boolean
language plpgsql security definer set search_path = public
as $$
declare d public.devices;
begin
  select * into d from public.devices where id = p_id and user_id = auth.uid();
  if not found then return false; end if;
  update public.devices set revoked_at = now() where id = p_id;
  if d.session_id is not null then
    delete from auth.sessions where id = d.session_id and user_id = auth.uid();   -- kéo theo refresh_tokens của phiên đó
  end if;
  return true;
end $$;

-- Đăng xuất mọi thiết bị khác, chỉ giữ thiết bị hiện tại.
create or replace function public.revoke_other_devices(p_keep uuid)
returns integer
language plpgsql security definer set search_path = public
as $$
declare n integer := 0; r record;
begin
  for r in select id, session_id from public.devices where user_id = auth.uid() and id <> p_keep and revoked_at is null loop
    update public.devices set revoked_at = now() where id = r.id;
    if r.session_id is not null then delete from auth.sessions where id = r.session_id and user_id = auth.uid(); end if;
    n := n + 1;
  end loop;
  return n;
end $$;

-- Khi tự đăng xuất bình thường: bỏ thiết bị này khỏi danh sách.
create or replace function public.forget_device(p_id uuid)
returns void
language sql security definer set search_path = public
as $$ delete from public.devices where id = p_id and user_id = auth.uid() $$;

revoke all on function public.touch_device(uuid, text, text), public.list_devices(), public.revoke_device(uuid),
  public.revoke_other_devices(uuid), public.forget_device(uuid) from public, anon;
grant execute on function public.touch_device(uuid, text, text), public.list_devices(), public.revoke_device(uuid),
  public.revoke_other_devices(uuid), public.forget_device(uuid) to authenticated;
