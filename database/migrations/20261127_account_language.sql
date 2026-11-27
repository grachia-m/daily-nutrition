-- Persist the selected UI language with the same ownership and revision checks.
alter table public.account_settings add constraint account_settings_language_check check (language in ('ru','en','es'));
create or replace function public.save_nutrition_state(p_state jsonb,p_expected_revision bigint,p_display_name text default null) returns bigint
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
