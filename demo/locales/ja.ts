import type { DemoCopy } from './types';

export const ja = {
  sections: {
    welcome: {
      title: 'ワークスペースの概要',
      description:
        'Northstar はプロジェクト、メンバー、タスクを一か所にまとめます。OrfinSupport を紹介するための架空のワークスペースです。',
    },
    projects: {
      title: '進行中のプロジェクト',
      description:
        '進捗と期限を確認できます。Brand refresh は 72%、Website experience は 48% 完了しています。カードを開くと詳細が見られます。',
    },
    capacity: {
      title: 'チームのリズム',
      description: 'グラフには日ごとの完了タスクが表示され、忙しい日を把握できます。',
    },
    activity: {
      title: '最近の出来事',
      description: 'プロジェクトの節目、新しいファイル、チームからの更新をまとめて確認できます。',
    },
    tasks: {
      title: '次のステップ',
      description: '完了したタスクにチェックを入れるか、プロジェクトを開いて全体を確認できます。',
    },
    'project-board': {
      title: 'すべてのプロジェクト',
      description: '状態でプロジェクトを絞り込み、新規作成や詳細の確認ができます。',
    },
    knowledge: {
      title: 'チームのナレッジ',
      description:
        '入門ガイド、引き渡し手順、Studio プランを確認できます。Orfin はこれらの記事を回答に利用します。',
    },
    settings: {
      title: 'アシスタントの設定',
      description:
        'テーマと言語、機能、記憶する内容を選べます。変更はすぐに Orfin に反映されます。',
    },
  },
  plan: '架空の Studio プランは 1 人あたり月額 $24 で、プロジェクト数無制限、ゲスト、100 GB が含まれます。チームは 12 人です。このデモでは課金されません。',
  capacity:
    'サンプルチームは 12 人で、利用可能な日数は 48 日です。36 日が計画済みで稼働率は 75%、残りは 12 日です。',
  privacy:
    'Orfin は通常、指定されたセクションだけを読み取ります。ページ全体の情報は任意です。入力欄と data-orfin-private 領域は除外されます。履歴は設定から削除できます。',
  followup: '続けて質問するか、プロジェクトの探索を続けてください。',
  planTitle: 'ご利用の Studio プラン',
} satisfies DemoCopy;
