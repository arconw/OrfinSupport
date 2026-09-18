import type { ThemePreset } from './types';

export interface ThemeTokens {
  scheme: 'light' | 'dark';
  accent: string;
  surface: string;
  soft: string;
  text: string;
  muted: string;
  border: string;
  radius: string;
  header: 'plain' | 'tinted' | 'lined';
  shadow: string;
}

export const themePresets: Record<ThemePreset, ThemeTokens> = {
  cloud: {
    scheme: 'light',
    accent: '#4361ee',
    surface: '#ffffff',
    soft: '#f3f5fb',
    text: '#25334a',
    muted: '#616f85',
    border: '#e0e5ef',
    radius: '22px',
    header: 'plain',
    shadow: '0 20px 70px #24376326',
  },
  iris: {
    scheme: 'light',
    accent: '#7451bb',
    surface: '#fdfbff',
    soft: '#f0eafa',
    text: '#362947',
    muted: '#70607f',
    border: '#e3d8f0',
    radius: '26px',
    header: 'tinted',
    shadow: '0 18px 64px #4d346b2b',
  },
  lagoon: {
    scheme: 'light',
    accent: '#096b78',
    surface: '#fbfefe',
    soft: '#e6f3f3',
    text: '#183e47',
    muted: '#4e7178',
    border: '#cce2e4',
    radius: '16px',
    header: 'lined',
    shadow: '0 16px 54px #16495126',
  },
  sand: {
    scheme: 'light',
    accent: '#805b18',
    surface: '#fffdf7',
    soft: '#f5eddc',
    text: '#3d3525',
    muted: '#766b55',
    border: '#e6dcc6',
    radius: '14px',
    header: 'plain',
    shadow: '0 12px 48px #57401c24',
  },
  rose: {
    scheme: 'light',
    accent: '#aa3b60',
    surface: '#fffafb',
    soft: '#faeaf0',
    text: '#492635',
    muted: '#856070',
    border: '#edd7e0',
    radius: '28px',
    header: 'tinted',
    shadow: '0 20px 64px #73344c26',
  },
  midnight: {
    scheme: 'dark',
    accent: '#a7b8ff',
    surface: '#1b2436',
    soft: '#253149',
    text: '#f0f3ff',
    muted: '#b3bfd5',
    border: '#3b4860',
    radius: '22px',
    header: 'plain',
    shadow: '0 20px 70px #080e2466',
  },
  graphite: {
    scheme: 'dark',
    accent: '#d5e3ef',
    surface: '#24272c',
    soft: '#32373e',
    text: '#f2f5f8',
    muted: '#b9c2cc',
    border: '#484f59',
    radius: '12px',
    header: 'lined',
    shadow: '0 16px 52px #10141966',
  },
  forest: {
    scheme: 'dark',
    accent: '#9bd5bc',
    surface: '#20332d',
    soft: '#2c443a',
    text: '#eff8f3',
    muted: '#b1c9ba',
    border: '#456252',
    radius: '18px',
    header: 'tinted',
    shadow: '0 18px 64px #102c2466',
  },
  plum: {
    scheme: 'dark',
    accent: '#e0b2ea',
    surface: '#32283e',
    soft: '#45364f',
    text: '#fbf0ff',
    muted: '#cbb9d3',
    border: '#64516e',
    radius: '26px',
    header: 'tinted',
    shadow: '0 22px 64px #28163566',
  },
  espresso: {
    scheme: 'dark',
    accent: '#e9c390',
    surface: '#342c28',
    soft: '#473b32',
    text: '#fff5e9',
    muted: '#cdbdad',
    border: '#675344',
    radius: '14px',
    header: 'lined',
    shadow: '0 14px 56px #2b1e1466',
  },
};

export const supportedThemes = Object.keys(themePresets) as ThemePreset[];
