# 课研魔方 V1.0 软著材料脚本

## 前置

- 已安装并登录 `lark-cli`（`lark-cli auth login`）
- 本地 `pnpm dev` 运行于 http://localhost:3000
- token 见 `doc-tokens.env`

## 流程

```bash
cd "/Users/peng.zhi/Documents/Object/软著申请项目/4.课程设计产品-课研魔方"

# 1. 抽取源码（前/后各 2500 行）
.soft-reg/extract-source.sh

# 2. 上传源代码文档（失败可 ./upload-source.sh back <chunk>）
.soft-reg/upload-source.sh

# 3. 编辑 docs/soft-copyright/manual/ch*.md（每章含功能说明 + 1/2/3 操作步骤）后上传手册
.soft-reg/upload-manual.sh
# 续传勿用：易重复章节；若中断请重新执行 upload-manual.sh 1 整本覆盖

# 4. 信息采集表与设计说明书
.soft-reg/upload-info-form.sh
.soft-reg/upload-design.sh

# 5. 更新父 Wiki 索引表
.soft-reg/update-index.sh
```
