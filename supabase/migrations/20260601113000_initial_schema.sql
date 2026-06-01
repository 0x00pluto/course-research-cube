create table if not exists users (
  id integer primary key autoincrement,
  name text not null,
  email text not null unique,
  password text not null,
  role text not null check (role in ('INTERNAL','OPC','MANAGER','ADMIN')),
  scope text not null check (scope in ('INTERNAL','OPC')),
  points integer not null default 0,
  created_at text not null default (datetime('now'))
);

create table if not exists sessions (
  id integer primary key autoincrement,
  user_id integer not null references users(id) on delete cascade,
  token text not null unique,
  expires_at text not null,
  created_at text not null default (datetime('now'))
);

create table if not exists courses (
  id integer primary key autoincrement,
  owner_id integer not null references users(id),
  scope text not null check (scope in ('INTERNAL','OPC')),
  title text not null,
  course_type text not null,
  learner_type text not null,
  core_problem text not null,
  market_info text not null,
  user_insight text not null,
  product_embedding text not null,
  trainer_tips text not null,
  framework text not null,
  version integer not null default 1,
  status text not null default 'DRAFT',
  created_at text not null default (datetime('now')),
  updated_at text not null default (datetime('now'))
);

create table if not exists course_outputs (
  id integer primary key autoincrement,
  course_id integer not null references courses(id) on delete cascade,
  outline text not null,
  workbook text not null,
  deck_package text not null,
  source_kind text not null check (source_kind in ('KNOWLEDGE','AI_GENERATED','MANUAL')),
  risk_notice text not null,
  created_at text not null default (datetime('now'))
);

create table if not exists knowledge_items (
  id integer primary key autoincrement,
  category text not null check (category in ('MODULE','CASE','TRAINER_TIP')),
  title text not null,
  content text not null,
  source_kind text not null check (source_kind in ('KNOWLEDGE','AI_GENERATED','MANUAL')),
  scope text not null check (scope in ('INTERNAL','OPC')),
  review_status text not null default 'APPROVED' check (review_status in ('PENDING','APPROVED','REJECTED')),
  created_by integer not null references users(id),
  reviewed_by integer references users(id),
  created_at text not null default (datetime('now')),
  updated_at text not null default (datetime('now'))
);

create table if not exists feedbacks (
  id integer primary key autoincrement,
  course_id integer not null references courses(id) on delete cascade,
  feedback_type text not null check (feedback_type in ('SURVEY','ORAL')),
  score integer not null check (score between 1 and 5),
  module_name text not null,
  content text not null,
  review_status text not null default 'PENDING' check (review_status in ('PENDING','APPROVED','REJECTED')),
  created_by integer not null references users(id),
  reviewed_by integer references users(id),
  created_at text not null default (datetime('now'))
);

create table if not exists quality_reports (
  id integer primary key autoincrement,
  course_id integer not null references courses(id) on delete cascade,
  generated_by integer not null references users(id),
  report_text text not null,
  summary_score real not null,
  created_at text not null default (datetime('now'))
);

create table if not exists billing_logs (
  id integer primary key autoincrement,
  user_id integer not null references users(id),
  action text not null check (action in ('COURSE_DESIGN_START','REPORT_GENERATE','RECHARGE')),
  points_delta integer not null,
  note text not null,
  created_at text not null default (datetime('now'))
);

create table if not exists share_links (
  id integer primary key autoincrement,
  report_id integer not null references quality_reports(id) on delete cascade,
  owner_id integer not null references users(id),
  token text not null unique,
  is_active integer not null default 1,
  created_at text not null default (datetime('now'))
);

create table if not exists growth_cards (
  id integer primary key autoincrement,
  user_id integer not null references users(id),
  card_text text not null,
  created_at text not null default (datetime('now'))
);

create table if not exists version_comparisons (
  id integer primary key autoincrement,
  course_id integer not null references courses(id) on delete cascade,
  base_version integer not null,
  target_version integer not null,
  diff_text text not null,
  created_at text not null default (datetime('now'))
);

create table if not exists strategy_insights (
  id integer primary key autoincrement,
  scope text not null check (scope in ('INTERNAL','OPC')),
  title text not null,
  insight text not null,
  created_at text not null default (datetime('now'))
);
