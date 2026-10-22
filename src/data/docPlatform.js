const feature = (id, name) => ({ id, name })
const module = (id, name, scene, features) => ({ id, name, scene, features })

export const docPlatformModules = {
  collect: [
    module('doc-collect', '文档归集', 'upload', [
      feature('multi-source-access', '多源文档接入'), feature('document-type-archive', '文档类型归档'), feature('ocr-processing', 'OCR识别处理'), feature('keyword-search', '组合关键词检索'),
    ]),
    module('doc-classify', '文档分类标注', 'classify', [
      feature('class-rule-config', '文档分类规则配置'), feature('auto-classify', '文档自动分类'), feature('smart-tagging', '智能标签标注'), feature('precise-search', '多维度精准检索'), feature('batch-fetch', '文档批量调取'),
    ]),
    module('ontology-model', '领域本体建模', 'ontology', [
      feature('concept-define', '核心概念定义'), feature('attribute-define', '概念属性定义'), feature('relation-define', '概念关系定义'), feature('ontology-manage', '标准化本体模型管理'),
    ]),
    module('doc-transfer', '文档信息传递关系建模', 'transfer', [
      feature('doc-type-config', '文书类型配置'), feature('match-keyword-config', '匹配关键词配置'), feature('content-transfer-define', '文档内容传递关系定义'), feature('content-refine-define', '文档内容细化关系定义'), feature('review-chain-define', '跨文书审查链路定义'),
    ]),
    module('entity-extract', '审查业务实体抽取', 'extract', [
      feature('entity-type-define', '实体类型定义'), feature('extract-source-config', '实体抽取来源配置'), feature('chapter-filter-config', '章节过滤配置'), feature('semantic-search-config', '语义检索策略配置'), feature('entity-visual-mark', '实体可视化标识'),
    ]),
    module('entity-constraint', '实体语义约束建模', 'constraint', [
      feature('relation-canvas-manage', '关系建模画布管理'), feature('entity-relation-model', '实体关联关系建模'), feature('constraint-direction', '实体约束方向定义'), feature('network-validate', '实体网络结构验证'),
    ]),
    module('term-map', '跨文书术语映射', 'terms', [
      feature('synonym-manage', '同义词组管理'), feature('term-map-config', '术语映射配置'), feature('term-disambiguation', '术语语义消歧'), feature('term-map-apply', '术语映射应用'),
    ]),
    module('review-policy', '审查规则策略管理', 'policy', [
      feature('policy-create', '审查策略创建'), feature('policy-status', '审查策略状态管理'), feature('rule-level-config', '审查规则级别配置'), feature('review-object-config', '审查对象关联配置'), feature('policy-apply-check', '审查策略应用校验'),
    ]),
    module('model-validate', '审查建模可视化验证', 'validation', [
      feature('domain-graph-preview', '领域图谱预览'), feature('entity-doc-compare', '实体文书抽取对照'), feature('relation-flow-visual', '关系流向可视化'), feature('model-consistency', '建模一致性验证'),
    ]),
    module('knowledge-asset', '审查知识资产管控', 'knowledge', [
      feature('pre-rule-manage', '预定义审查规则管理'), feature('domain-kb-manage', '领域文档知识库管理'), feature('review-vectorize', '审查知识向量化'), feature('review-kb-partition', '审查知识分库管理'), feature('review-kb-link', '审查知识库联动'), feature('review-batch-import', '审查知识批量导入'), feature('review-auto-rule', '审查知识自动规则化'),
    ]),
    module('knowledge-service', '领域知识服务调用', 'api', [
      feature('kb-api-config', '知识库接口配置'), feature('kb-api-call', '知识库接口调用'), feature('service-data-parse', '知识服务数据解析'),
    ]),
  ],
  write: [
    module('template-manage', '标准化文档模板管理', 'template', [
      feature('standard-template-library', '标准模板库构建'), feature('template-custom-config', '模板自定义配置'), feature('template-rule-bind', '模板规则绑定'), feature('atomic-clause-pack', '原子化条款封装'), feature('template-permission', '模板权限管控'), feature('template-version', '模板版本迭代管理'),
    ]),
    module('outline-design', '文档提纲智能设计', 'outline', [
      feature('design-type-config', '文档设计类型配置'), feature('outline', '标准化提纲生成'), feature('framework-build', '文档框架搭建'), feature('clause-fill', '文档条款填充'), feature('outline-optimize', '提纲表述优化'), feature('term-calibrate', '专业术语校准'), feature('outline-level-adjust', '提纲层级调整'), feature('outline-point-maintain', '提纲要点维护'),
    ]),
    module('knowledge-generate', '知识驱动文档生成', 'generate', [
      feature('generate-requirement', '文档生成需求配置'), feature('history-knowledge-extract', '历史资料知识提取'), feature('draft', '领域文档内容生成'), feature('official-document-generate', '军队机关公文生成'), feature('standard-phrase-recommend', '标准话术推荐'), feature('grammar-polish', '文档语法润色'),
    ]),
    module('generation-trace', '文档生成溯源与版本管控', 'generation-trace', [
      feature('trace', '文档生成过程追踪'), feature('clause-source-trace', '文书条款来源追溯'), feature('citation-trace', '引用依据追溯'), feature('version-record-manage', '文档版本与修改记录管理'), feature('source-jump', '原文依据一键跳转'),
    ]),
  ],
  review: [
    module('review-rule-model', '审查规则标准建模', 'rule-model', [
      feature('review-rule-config', '审查规则配置'), feature('cross-doc-rule-manage', '跨文档关联规则管理'), feature('rule-template-bind', '规则模板绑定'), feature('rule-change-link', '规则变更联动'), feature('template-rule-check', '模板规则适配校验'), feature('kb-rule-build', '知识库驱动规则构建'), feature('review-rule-version', '审查规则版本管理'),
    ]),
    module('natural-rule', '自然语言审查规则生成', 'natural-rule', [
      feature('natural-requirement-parse', '自然语言需求解析'), feature('kb-reference-link', '知识库参考关联'), feature('smart-rule-generate', '智能审查规则生成'), feature('manual-rule-write', '审查规则手动编写'),
    ]),
    module('standard-parse', '审查标准智能解析', 'standard-parse', [
      feature('standard-upload', '审查标准上传'), feature('standard-template-parse', '标准模板结构解析'), feature('review-point-identify', '审查要点识别'), feature('structured-template-generate', '结构化审查模板生成'),
    ]),
    module('strategy-review', '多策略融合智能审查', 'strategy-review', [
      feature('semantic-rule-review', '语义规则审查'), feature('ontology-logic-review', '本体逻辑审查'), feature('run', '多策略联合推理'), feature('adaptive-strategy', '自适应审查策略组合'),
    ]),
    module('cross-review', '跨文档联合审查', 'cross-review', [
      feature('multi-doc-entity-extract', '多文档实体智能抽取'), feature('cross-consistency-check', '跨文档一致性联动校验'), feature('difference-source-locate', '审查差异原文定位'), feature('cross-compliance-review', '跨文档合规穿透审查'), feature('risk-smart-level', '审查风险智能分级'), feature('rectification-suggest', '合规整改建议生成'), feature('evidence-chain-build', '审查证据链构建'), feature('cross-association-identify', '跨文档关联智能识别'), feature('related-doc-complete', '关联文档完整性校验'), feature('cross-logic-close', '跨文档逻辑闭环验证'), feature('cross-cause-check', '跨文档因果关系核查'), feature('consistency-chain-view', '一致性链路图展示'),
    ]),
    module('multi-agent-review', '多智能体协同审查', 'agent-review', [
      feature('review-task-plan', '审查任务自主规划'), feature('special-agent-combine', '专项智能体组合'), feature('multi-step-reason', '多步推理执行'), feature('collaborative-flow', '协同审查流程管理'), feature('deep-review', '深度审查执行'),
    ]),
    module('skill-review', '专业技能包智能审查', 'skill-review', [
      feature('skill-create', '专业技能包制作'), feature('skill-manage', '专业技能包管理'), feature('skill-auto-load', '技能包自动识别加载'), feature('agent-autonomous-review', '智能体自主审查'), feature('human-interactive-review', '人机交互式审查'),
    ]),
    module('standard-doc-review', '标准化文档审查', 'standard-review', [
      feature('review-template-select', '审查标准模板选择'), feature('language-grammar-review', '文档语言语法审查'), feature('standard-compliance-review', '文档标准符合性审查'), feature('logic-review', '文档逻辑性审查'), feature('semantic-rule-doc-review', '文档语义规则审查'), feature('kb-enhance-review', '知识库增强审查'), feature('review-process-record', '审查过程记录'),
    ]),
    module('review-result', '审查结果智能处理', 'result-review', [
      feature('issue-class-level', '审查问题分类分级'), feature('result-visual-mark', '审查结果可视化标注'), feature('smart-suggestion', '智能修改建议生成'), feature('suggestion-basis-link', '建议依据关联'), feature('issues', '审查结果复核修订'), feature('result-file-download', '审查成果文件生成与下载'),
    ]),
    module('review-trace', '审查过程追溯', 'review-trace', [
      feature('review-history-manage', '审查历史记录管理'), feature('review-track-trace', '审查轨迹追溯'), feature('reason-chain-display', '审查理由链展示'), feature('review-result-recheck', '审查结果追溯复核'),
    ]),
    module('review-migration', '审查知识数据迁移', 'migration', [
      feature('review-data-import', '审查知识数据导入'), feature('review-data-export', '审查知识数据导出'), feature('knowledge-encrypt', '知识数据加密'), feature('migration-result-check', '数据迁移结果校验'),
    ]),
  ],
  report: [
    module('result-mapping', '审查成果归集映射', 'result-mapping', [
      feature('review-system-link', '审查系统联动'), feature('review-result-auto-collect', '审查成果自动归集'), feature('review-result-analysis', '审查成果智能分析'), feature('review-result-structure', '审查成果结构化解析'), feature('review-result-template-map', '审查成果模板映射'), feature('report-content-class', '报告内容分类'), feature('report-content-summary', '报告内容汇总'), feature('review-result-stat', '审查成果统计'), feature('report-template-fill', '报告模板内容填充'),
    ]),
    module('multi-scene-report', '多场景报告智能生成', 'report-generate', [
      feature('report-scene-identify', '报告生成场景识别'), feature('report-template-match', '报告模板自适应匹配'), feature('report-logic-match', '报告生成逻辑匹配'), feature('review-report-generate', '审查报告智能生成'), feature('specified-report-generate', '指定模板评审报告生成'), feature('report-format-output', '报告格式输出'),
    ]),
    module('report-compliance', '报告合规校验与溯源', 'report-compliance', [
      feature('report-complete-check', '报告内容完整性校验'), feature('report-accuracy-check', '报告内容准确性校验'), feature('report-logic-check', '报告逻辑一致性校验'), feature('report-issue-mark', '报告问题自动标记'), feature('conclusion-trace', '审查结论链路溯源'), feature('issue-desc-trace', '问题描述链路溯源'), feature('stat-data-trace', '数据统计链路溯源'), feature('review-basis-display', '审查依据关联展示'),
    ]),
  ],
}

export function cleanDocLabel(name) {
  return name.replace(/模块$/, '').replace(/功能$/, '')
}

export function moduleByScene(scene) {
  return Object.values(docPlatformModules).flat().find((item) => item.scene === scene)
}
