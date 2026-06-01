-- 课后问卷
create table if not exists course_surveys (
  id integer primary key autoincrement,
  course_id integer not null references courses(id) on delete cascade,
  token text not null unique,
  title text not null,
  is_active integer not null default 1,
  created_by integer not null references users(id),
  created_at text not null default (datetime('now'))
);

create table if not exists survey_responses (
  id integer primary key autoincrement,
  survey_id integer not null references course_surveys(id) on delete cascade,
  module_name text not null default '整体',
  score integer not null check (score between 1 and 5),
  content text not null,
  respondent_label text,
  created_at text not null default (datetime('now'))
);

-- 输出物分段来源
alter table course_outputs add column section_sources text;

-- 交付状态：DRAFT/READY/BLOCKED/RELEASED
-- 已有 status 字段，沿用并扩展 BLOCKED、RELEASED

-- 反馈审核后知识库建议
create table if not exists knowledge_suggestions (
  id integer primary key autoincrement,
  feedback_id integer not null references feedbacks(id) on delete cascade,
  category text not null check (category in ('MODULE','CASE','TRAINER_TIP')),
  title text not null,
  content text not null,
  scope text not null check (scope in ('INTERNAL','OPC')),
  status text not null default 'PENDING' check (status in ('PENDING','APPROVED','DISMISSED')),
  knowledge_item_id integer references knowledge_items(id),
  created_at text not null default (datetime('now'))
);
