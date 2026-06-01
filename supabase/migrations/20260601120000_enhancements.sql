-- 课程框架结构化存储、设计进度、分享过期
alter table courses add column framework_modules text;
alter table courses add column design_started_at text;
alter table courses add column parent_course_id integer references courses(id);

alter table share_links add column expires_at text;
