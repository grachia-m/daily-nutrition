-- Preserve unknown old yields, recipe IDs and logged snapshots.
alter table public.custom_recipes alter column time_minutes drop not null;
alter table public.custom_recipes add column servings integer check(servings between 1 and 100);
create function public.set_recipe_batch_yield() returns trigger
language plpgsql security invoker set search_path=''
as $$ begin new.servings := (new.recipe_json->>'servings')::integer; return new; end $$;
revoke all on function public.set_recipe_batch_yield() from public,anon,authenticated;
create trigger set_recipe_batch_yield before insert or update of recipe_json on public.custom_recipes
for each row execute function public.set_recipe_batch_yield();
