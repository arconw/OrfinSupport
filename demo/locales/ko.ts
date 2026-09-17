import type { DemoCopy } from './types';

export const ko = {
  sections: {
    welcome: {
      title: '작업 공간 한눈에 보기',
      description:
        'Northstar는 프로젝트, 팀원, 작업을 한곳에 모읍니다. OrfinSupport를 소개하기 위한 가상의 작업 공간입니다.',
    },
    projects: {
      title: '진행 중인 프로젝트',
      description:
        '진행률과 마감일을 확인하세요. Brand refresh는 72%, Website experience는 48% 완료됐습니다. 카드를 열면 자세한 내용을 볼 수 있습니다.',
    },
    capacity: {
      title: '팀의 리듬',
      description: '차트는 날짜별 완료 작업을 보여 주며 바쁜 날을 파악하는 데 도움이 됩니다.',
    },
    activity: {
      title: '최근 소식',
      description: '프로젝트 주요 단계, 새 파일, 팀 업데이트를 한곳에서 확인하세요.',
    },
    tasks: {
      title: '다음 할 일',
      description: '완료한 작업을 표시하거나 프로젝트를 열어 전체 상황을 확인하세요.',
    },
    'project-board': {
      title: '모든 프로젝트',
      description: '상태별로 프로젝트를 필터링하고 새 프로젝트를 만들거나 세부 정보를 확인하세요.',
    },
    knowledge: {
      title: '팀 지식 모음',
      description:
        '시작 안내서, 인계 절차, Studio 요금제를 찾을 수 있습니다. Orfin은 이 문서를 답변에 활용합니다.',
    },
    settings: {
      title: '도우미 설정',
      description:
        '테마와 언어, 사용할 기능, 기억할 내용을 선택하세요. 변경 사항은 Orfin에 바로 적용됩니다.',
    },
  },
  plan: '가상의 Studio 요금제는 1인당 월 $24이며 무제한 프로젝트, 게스트, 100 GB를 제공합니다. 팀원은 12명입니다. 이 데모에서는 결제가 발생하지 않습니다.',
  capacity:
    '예시 팀은 12명이며 사용 가능한 작업일은 48일입니다. 36일이 계획되어 가동률은 75%이고 12일이 남아 있습니다.',
  privacy:
    'Orfin은 기본적으로 표시된 섹션만 읽습니다. 전체 페이지 정보는 선택 사항입니다. 입력 필드와 data-orfin-private 영역은 제외됩니다. 설정에서 기록을 지울 수 있습니다.',
  followup: '추가로 질문하거나 프로젝트를 계속 둘러보세요.',
  planTitle: '내 Studio 요금제',
} satisfies DemoCopy;
