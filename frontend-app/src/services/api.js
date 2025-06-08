const BASE_URL = 'http://36.91.27.150:815/api';

export async function loginUser(payload) {
  const res = await fetch(`${BASE_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  return { status: res.status, data };
}
