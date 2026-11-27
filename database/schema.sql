-- Hosted schema for Daily Nutrition. Auth credentials remain in Supabase Auth.
create table public.account_settings (
 user_id uuid primary key references auth.users(id) on delete cascade,
 display_name text not null default '' check (length(display_name)<=80),
 language text not null default 'ru' check (language in ('ru','en','es')), timezone text not null default 'Europe/Madrid',
 active_member_id text, snapshot jsonb,
 revision bigint not null default 0 check (revision>=0),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 check (snapshot is null or (jsonb_typeof(snapshot)='object' and snapshot->>'version'='4'))
);
create table public.family_members (
 user_id uuid not null references auth.users(id) on delete cascade, member_id text not null,
 display_name text not null check(length(display_name) between 1 and 40),
 sex text not null check(sex in ('male','female')), weight_kg numeric not null check(weight_kg between 40 and 180),
 height_cm numeric check(height_cm between 130 and 220), age numeric check(age between 18 and 100),
 daily_kcal integer not null check(daily_kcal between 1200 and 5000), training_bonus_kcal integer not null check(training_bonus_kcal between 0 and 1000),
 in_shopping boolean not null, is_archived boolean not null default false, archived_at timestamptz,
 profile_json jsonb not null, primary key(user_id,member_id)
);
create table public.meal_plans (
 user_id uuid not null references auth.users(id) on delete cascade, meal_date date not null,
 meal_slot smallint not null check(meal_slot between 0 and 3), recipe_id text not null,
 primary key(user_id,meal_date,meal_slot)
);
create table public.intake_logs (
 user_id uuid not null, member_id text not null, meal_date date not null,
 meal_slot smallint not null check(meal_slot between 0 and 3), recipe_id text not null, snapshot jsonb not null,
 primary key(user_id,member_id,meal_date,meal_slot),
 foreign key(user_id,member_id) references public.family_members(user_id,member_id) on delete cascade
);
create table public.hydration_entries (
 user_id uuid not null, member_id text not null, entry_date date not null, milliliters integer not null check(milliliters between 0 and 20000),
 primary key(user_id,member_id,entry_date), foreign key(user_id,member_id) references public.family_members(user_id,member_id) on delete cascade
);
create table public.recipe_portions (
 user_id uuid not null, member_id text not null, recipe_group text not null, ingredient_amounts jsonb not null,
 primary key(user_id,member_id,recipe_group), foreign key(user_id,member_id) references public.family_members(user_id,member_id) on delete cascade
);
create table public.shopping_checks (
 user_id uuid not null references auth.users(id) on delete cascade, check_key text not null check(length(check_key)<=120), checked boolean not null,
 primary key(user_id,check_key)
);
create table public.custom_foods (
 user_id uuid not null references auth.users(id) on delete cascade, food_id text not null,
 name_ru text not null check(length(name_ru) between 1 and 120), name_es text not null check(length(name_es) between 1 and 160), category text not null,
 kcal_per_100g numeric not null check(kcal_per_100g between 0 and 1000), protein_per_100g numeric not null check(protein_per_100g between 0 and 100),
 fat_per_100g numeric not null check(fat_per_100g between 0 and 100), carbs_per_100g numeric not null check(carbs_per_100g between 0 and 100),
 primary key(user_id,food_id)
);
create table public.custom_recipes (
 user_id uuid not null references auth.users(id) on delete cascade, recipe_id text not null,
 title text not null check(length(title) between 2 and 120), meal_slot smallint not null check(meal_slot between 0 and 3),
 time_minutes smallint not null check(time_minutes between 1 and 240), ingredients jsonb not null, steps jsonb not null,
 recipe_json jsonb not null, primary key(user_id,recipe_id)
);
-- RLS is both authentication and ownership: no anonymous access, no cross-account rows.
do $$
declare t text;
begin
 foreach t in array array['account_settings','family_members','meal_plans','intake_logs','hydration_entries','recipe_portions','shopping_checks','custom_foods','custom_recipes'] loop
  execute format('alter table public.%I enable row level security',t);
  execute format('revoke all on table public.%I from anon',t);
  execute format('grant select,insert,update,delete on table public.%I to authenticated',t);
  execute format('create policy own_rows on public.%I for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id)',t);
 end loop;
end $$;
create function public.load_nutrition_state() returns jsonb
language sql stable security invoker set search_path=''
as $$ select jsonb_build_object('state',snapshot,'revision',revision,'displayName',display_name,'updatedAt',updated_at) from public.account_settings where user_id=(select auth.uid()); $$;
revoke all on function public.load_nutrition_state() from public,anon;
grant execute on function public.load_nutrition_state() to authenticated;
create function public.save_nutrition_state(p_state jsonb,p_expected_revision bigint,p_display_name text default null) returns bigint
language plpgsql security invoker set search_path=''
as $$
declare
 v_user uuid := auth.uid(); v_revision bigint; v_member jsonb; v_member_id text; v_pair record; v_recipe jsonb; v_profile record; v_index integer;
begin
 if v_user is null then raise exception 'Authentication required' using errcode='28000'; end if;
 if p_state is null or jsonb_typeof(p_state)<>'object' or p_state->>'version'<>'4' or jsonb_typeof(p_state->'profiles')<>'array' or jsonb_array_length(p_state->'profiles') not between 1 and 8 or octet_length(p_state::text)>2000000 then raise exception 'Invalid nutrition state'; end if;
 if p_state ? 'language' and (jsonb_typeof(p_state->'language')<>'string' or p_state->>'language' not in ('ru','en','es')) then raise exception 'Invalid language'; end if;
 if p_display_name is not null and length(p_display_name)>80 then raise exception 'Display name too long'; end if;
 insert into public.account_settings(user_id) values(v_user) on conflict(user_id) do nothing;
 select revision into v_revision from public.account_settings where user_id=v_user for update;
 if p_expected_revision is null or v_revision<>p_expected_revision then raise exception 'Nutrition sync conflict: reload cloud state' using errcode='40001'; end if;
 -- One transaction persists a canonical snapshot and queryable projections.
 delete from public.intake_logs where user_id=v_user;
 delete from public.hydration_entries where user_id=v_user;
 delete from public.recipe_portions where user_id=v_user;
 delete from public.family_members where user_id=v_user;
 delete from public.meal_plans where user_id=v_user;
 delete from public.shopping_checks where user_id=v_user;
 delete from public.custom_recipes where user_id=v_user;
 delete from public.custom_foods where user_id=v_user;
 for v_profile in
  select value as profile,false as archived,null::timestamptz as removed_at from jsonb_array_elements(p_state->'profiles')
  union all
  select value->'profile',true,(value->>'removedAt')::timestamptz from jsonb_array_elements(coalesce(p_state->'archivedProfiles','[]'))
 loop
  v_member:=v_profile.profile; v_member_id:=v_member->>'id';
  insert into public.family_members(user_id,member_id,display_name,sex,weight_kg,height_cm,age,daily_kcal,training_bonus_kcal,in_shopping,is_archived,archived_at,profile_json)
  values(v_user,v_member_id,v_member->>'name',v_member->>'sex',(v_member->>'weight')::numeric,(v_member->>'height')::numeric,(v_member->>'age')::numeric,(v_member->>'kcal')::integer,(v_member->>'bonus')::integer,(v_member->>'inShopping')::boolean,v_profile.archived,v_profile.removed_at,v_member);
  for v_pair in select key,value from jsonb_each(coalesce(v_member->'logged','{}')) loop
   insert into public.intake_logs values(v_user,v_member_id,split_part(v_pair.key,':',1)::date,split_part(v_pair.key,':',2)::smallint,v_pair.value->>'id',v_pair.value);
  end loop;
  for v_pair in select key,value from jsonb_each_text(coalesce(v_member->'water','{}')) loop
   insert into public.hydration_entries values(v_user,v_member_id,v_pair.key::date,v_pair.value::integer);
  end loop;
  for v_pair in select key,value from jsonb_each(coalesce(v_member->'recipeAmounts','{}')) loop
   insert into public.recipe_portions values(v_user,v_member_id,v_pair.key,v_pair.value);
  end loop;
 end loop;
 for v_pair in select key,value from jsonb_each(coalesce(p_state->'overrides','{}')) loop
  for v_index in 0..3 loop
   insert into public.meal_plans values(v_user,v_pair.key::date,v_index,v_pair.value->>v_index);
  end loop;
 end loop;
 for v_pair in select key,value from jsonb_each_text(coalesce(p_state->'bought','{}')) loop
  insert into public.shopping_checks values(v_user,v_pair.key,v_pair.value::boolean);
 end loop;
 for v_pair in select key,value from jsonb_each(coalesce(p_state->'customFoods','{}')) loop
  insert into public.custom_foods values(v_user,v_pair.key,v_pair.value->'food'->>0,v_pair.value->>'spanish',v_pair.value->'food'->>1,(v_pair.value->'food'->>2)::numeric,(v_pair.value->'food'->>3)::numeric,(v_pair.value->'food'->>4)::numeric,(v_pair.value->'food'->>5)::numeric);
 end loop;
 for v_recipe in select value from jsonb_array_elements(coalesce(p_state->'customRecipes','[]')) loop
  insert into public.custom_recipes values(v_user,v_recipe->>'id',v_recipe->>'title',(v_recipe->>'slot')::smallint,(v_recipe->>'time')::smallint,v_recipe->'ingredients',v_recipe->'steps',v_recipe);
 end loop;
 update public.account_settings set snapshot=p_state,language=coalesce(p_state->>'language',language),revision=v_revision+1,active_member_id=p_state->>'activeProfileId',display_name=coalesce(p_display_name,display_name),updated_at=now() where user_id=v_user;
 return v_revision+1;
end $$;
revoke all on function public.save_nutrition_state(jsonb,bigint,text) from public,anon;
grant execute on function public.save_nutrition_state(jsonb,bigint,text) to authenticated;

-- Project-created event trigger is internal, not a callable anonymous RPC.
revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
