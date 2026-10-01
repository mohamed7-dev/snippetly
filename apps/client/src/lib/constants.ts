import { DEFAULT_DEVELOPER_API_PATH_PREFIX } from '@snippetly/common/lib';

export const API_URL = import.meta.env.VITE_API_URL;
export const DEVELOPER_API_URL = import.meta.env.VITE_API_URL + '/' + DEFAULT_DEVELOPER_API_PATH_PREFIX;

export const LOCAL_STORAGE_SESSION_TOKEN_KEY = 'ls:session_token';
