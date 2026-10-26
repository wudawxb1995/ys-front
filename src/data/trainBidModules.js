// 左侧目录采用投标文件《大模型训推平台响应方案》的模块名称。
// 第二项指向已有演示页面，用于复用相应的交互内容。
export const trainBidModules = {
  pretrain: [
    ['本地源数据集管理模块', 'sets', 'database'],
    ['训练数据智能处理模块', 'clean', 'clean'],
    ['数据集详情预览模块', 'preview', 'eye'],
    ['数据集精细化维护模块', 'maintenance', 'edit'],
    ['数据集训练任务关联模块', 'sets', 'link'],
    ['专域微调数据集生成模块', 'sft', 'train'],
    ['规范训练数据集接入模块', 'sets', 'folder'],
    ['模型训练参数配置模块', 'param', 'sliders'],
    ['训练数据集自动标签模块', 'tags', 'tag'],
    ['历史推理任务管理模块', 'infer', 'list'],
    ['推理任务自定义标签模块', 'infer-tags', 'hash'],
    ['推理任务多标签筛选模块', 'infer-tags', 'filter'],
  ],
  conf: [
    ['模型生成结果置信度评分模块', 'score', 'chart'],
    ['多方法置信度评估模块', 'process', 'graph'],
    ['多维加权综合置信度评估模块', 'weighted', 'sliders'],
    ['大模型业务强弱项识别模块', 'strength', 'radar'],
  ],
  lora: [
    ['细粒度领域知识注入模块', 'knowledge', 'book'],
    ['微调过程监控与策略优化模块', 'monitor', 'chart'],
    ['多基座大模型微调适配模块', 'jobs', 'model'],
    ['LoRA微调训练配置模块', 'lora-config', 'sliders'],
    ['基座模型增量微调与训练启动模块', 'jobs', 'train'],
  ],
  mgr: [
    ['模型全生命周期管理模块', 'models', 'timeline'],
    ['模型版本控制与快速部署模块', 'versions', 'compare'],
    ['模型管理界面与标准化服务模块', 'api', 'api'],
    ['基座与微调模型统一管理模块', 'models', 'model'],
    ['vLLM模型部署适配模块', 'deploy', 'signal'],
  ],
  quant: [
    ['量化模型参数配置与推理模块', 'quant-run', 'sliders'],
    ['多量化模型测评与对比分析模块', 'cmp', 'compare'],
    ['推理模型智能适配推荐模块', 'recommend', 'spark'],
  ],
  prompt: [
    ['提示模板智能检索生成模块', 'chat', 'search'],
    ['提示模板标准化入库模块', 'lib', 'database'],
    ['提示模板库管理与持续优化模块', 'prompt-feedback', 'book'],
  ],
  eval: [
    ['模型评估指标预置管理模块', 'metrics', 'rule'],
    ['模型评估体系与任务管理模块', 'eval-jobs', 'task'],
    ['模型在线调试模块', 'debug', 'chat'],
    ['自定义评估指标属性管理模块', 'metrics', 'sliders'],
    ['自定义评估指标新增校验模块', 'metrics', 'audit'],
    ['已创建评估指标更新管理模块', 'metrics', 'edit'],
  ],
}
