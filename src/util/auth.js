export const getHeaders = () => {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  return headers;
}

export const saveToken = (token) => {
  sessionStorage.setItem('token', token);
}

export const getToken = () => {
  return sessionStorage.getItem('token');
}

export const remoteToken = () => {
  sessionStorage.removeItem('token');
}

export const isLoggedIn = () => {
  const token = getToken();
  if (!token) {
    return false;
  }
  return true
}