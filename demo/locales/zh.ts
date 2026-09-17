import type { DemoCopy } from './types';

export const zh = {
  sections: {
    welcome: {
      title: '工作区概览',
      description:
        'Northstar 将项目、团队和任务整合在一起。这是用于展示 OrfinSupport 的虚构工作区。',
    },
    projects: {
      title: '进行中的项目',
      description:
        '查看进度和截止日期。Brand refresh 已完成 72%，Website experience 已完成 48%。打开项目卡片可查看详情。',
    },
    capacity: {
      title: '团队节奏',
      description: '图表展示每天完成的任务，帮助您了解哪些日子比较繁忙。',
    },
    activity: {
      title: '最新动态',
      description: '在这里查看项目里程碑、新文件和团队更新。',
    },
    tasks: {
      title: '接下来的任务',
      description: '勾选已完成的任务，或打开项目了解整体情况。',
    },
    'project-board': {
      title: '所有项目',
      description: '按状态筛选项目，创建新项目并查看详情。',
    },
    knowledge: {
      title: '团队知识库',
      description: '查看入门指南、交付流程和 Studio 方案。Orfin 可以利用这些文章回答问题。',
    },
    settings: {
      title: '助手设置',
      description: '选择主题和语言，开启功能并决定记住哪些选择。更改会立即应用到 Orfin。',
    },
  },
  plan: '演示中的 Studio 方案为每位成员每月 $24，包含无限项目、访客和 100 GB 存储。团队有 12 人。这些都是虚构数据，演示不会收费。',
  capacity: '示例团队有 12 人和 48 个可用工作日，已安排 36 天，占用率为 75%，还剩 12 天。',
  privacy:
    'Orfin 默认只读取已标记的区域。整个页面的上下文需要主动启用。输入字段和 data-orfin-private 区域不会被读取。您可以在设置中清除历史。',
  followup: '您可以继续提问，或继续了解项目。',
  planTitle: '您的 Studio 方案',
} satisfies DemoCopy;
