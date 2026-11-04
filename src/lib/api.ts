// API utility functions for making requests to the backend

export async function apiRequest(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const token = localStorage.getItem('codeverse_token');

    const response = await fetch(endpoint, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.error || 'Request failed' };
    }

    return { success: true, data };
  } catch (error) {
    return { success: false, error: 'Network error' };
  }
}

export async function updateUserXP(userId: string, xp: number) {
  return apiRequest(`/api/users/${userId}`, {
    method: 'PATCH',
    body: JSON.stringify({ xp }),
  });
}

export async function updateUserCoins(userId: string, coins: number) {
  return apiRequest(`/api/users/${userId}`, {
    method: 'PATCH',
    body: JSON.stringify({ coins }),
  });
}

export async function updateUserStreak(userId: string, streak: number) {
  return apiRequest(`/api/users/${userId}`, {
    method: 'PATCH',
    body: JSON.stringify({ streak }),
  });
}
