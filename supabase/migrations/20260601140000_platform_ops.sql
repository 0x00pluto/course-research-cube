-- 运营配置（US-D4 / §10.3）
create table if not exists platform_settings (
  key text primary key,
  value text not null,
  updated_at text not null default (datetime('now')),
  updated_by integer references users(id)
);

insert or ignore into platform_settings(key, value) values
  ('min_feedback_for_trend', '3'),
  ('course_design_cost', '5'),
  ('report_generate_cost', '3');

-- 管理后台操作审计（§11.1）
create table if not exists admin_audit_logs (
  id integer primary key autoincrement,
  user_id integer not null references users(id),
  user_name text not null,
  action text not null,
  target_type text not null,
  target_id integer,
  detail text,
  created_at text not null default (datetime('now'))
);

-- 结构化迭代建议（US-D6）
alter table quality_reports add column iteration_actions text;
