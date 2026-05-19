export const getHeaders = () => {
  const token = getAccessToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
};

export const setTokens = (accessToken, refreshToken) => {
  localStorage.setItem('ACCESS_TOKEN', accessToken);
  localStorage.setItem('REFRESH_TOKEN', refreshToken);
};

export const clearTokens = () => {
  localStorage.removeItem('ACCESS_TOKEN');
  localStorage.removeItem('REFRESH_TOKEN');
};

export const getRefreshToken = () => localStorage.getItem('REFRESH_TOKEN');

export const getAccessToken = () => localStorage.getItem('ACCESS_TOKEN');

export const isLoggedIn = () => {
  const token = getAccessToken();
  return token != null;
}