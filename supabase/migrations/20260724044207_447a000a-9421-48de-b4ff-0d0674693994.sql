
create or replace function public.challenge_leaderboard(_slug text default 'success-code-30day', _limit int default 25)
returns table(user_id uuid, display_name text, avatar_url text, completed_days int, best_streak int)
language sql
stable
security definer
set search_path = public
as $$
  with runs as (
    select cp.user_id, cp.day_number,
      cp.day_number - row_number() over (partition by cp.user_id order by cp.day_number) as grp
    from public.challenge_progress cp
    where cp.challenge_slug = _slug and cp.completed_at is not null
  ),
  streaks as (
    select user_id, count(*)::int as streak_len
    from runs
    group by user_id, grp
  ),
  best as (
    select user_id, max(streak_len)::int as best_streak
    from streaks
    group by user_id
  ),
  totals as (
    select user_id, count(*)::int as completed_days
    from public.challenge_progress
    where challenge_slug = _slug and completed_at is not null
    group by user_id
  )
  select t.user_id,
    coalesce(nullif(p.display_name, ''), 'Anonymous') as display_name,
    p.avatar_url,
    t.completed_days,
    coalesce(b.best_streak, 0) as best_streak
  from totals t
  left join best b on b.user_id = t.user_id
  left join public.profiles p on p.id = t.user_id
  order by t.completed_days desc, coalesce(b.best_streak, 0) desc
  limit _limit;
$$;

revoke all on function public.challenge_leaderboard(text, int) from public;
grant execute on function public.challenge_leaderboard(text, int) to anon, authenticated;
