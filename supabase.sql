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
