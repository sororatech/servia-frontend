'use server';

import { revalidatePath } from 'next/cache';
import { getRecruiterHeaders, fetchJson } from '@/utils/serverFetch';
import { Recruiter } from '@/types/settings';

async function requireAuth() {
  const headers = await getRecruiterHeaders();
  if (!headers) {
    throw new Error('Authentication required');
  }
  return headers as HeadersInit;
}

export async function createRecruiter(formData: {
  user: {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
  };
  department: string;
  role: string;
  is_active: boolean;
}) {
  try {
    const headers = await requireAuth();
    
    const response = await fetchJson<Recruiter>(
      '/users/recruiters/create/',
      headers,
      {
        method: 'POST',
        body: formData as any,
      }
    );
    
    revalidatePath('/settings');
    return { success: true, data: response };
    
  } catch (error: any) {
    let userError = 'Failed to create recruiter';
    if (error.message?.includes('Authentication')) {
      userError = 'Session expired. Please log in again.';
    } else if (error.message?.includes('Access Denied') || error.message?.includes('403')) {
      userError = 'Permission denied. Only administrators can create recruiters.';
    } else if (error.message?.includes('email')) {
      userError = 'A recruiter with this email already exists.';
    }
    
    return { success: false, error: userError };
  }
}

export async function updateRecruiter(id: string, updates: Partial<Recruiter>) {
  try {
    const headers = await requireAuth();
    
    const response = await fetchJson<Recruiter>(
      `/users/recruiters/${id}/`,
      headers,
      {
        method: 'PATCH',
        body: updates as any,
      }
    );
    
    revalidatePath('/settings');
    return { success: true, data: response };
    
  } catch (error: any) {
    let userError = 'Failed to update recruiter';
    if (error.message?.includes('Authentication')) {
      userError = 'Session expired. Please log in again.';
    } else if (error.message?.includes('403')) {
      userError = 'Permission denied. Contact an administrator.';
    }
    
    return { success: false, error: userError };
  }
}

export async function deleteRecruiter(id: string) {
  try {
    const headers = await requireAuth();
    
    await fetchJson(
      `/users/recruiters/${id}/`,
      headers,
      {
        method: 'DELETE',
      }
    );
    
    revalidatePath('/settings');
    return { success: true };
    
  } catch (error: any) {
    let userError = 'Failed to delete recruiter';
    if (error.message?.includes('403')) {
      userError = 'Permission denied. Only admins can delete recruiters.';
    }
    
    return { success: false, error: userError };
  }
}

export async function toggleRecruiterStatus(id: string, is_active: boolean) {
  try {
    const headers = await requireAuth();
    
    const response = await fetchJson<Recruiter>(
      `/users/recruiters/${id}/`,
      headers,
      {
        method: 'PATCH',
        body: { is_active } as any,
      }
    );
    
    revalidatePath('/settings');
    return { success: true, data: response };
    
  } catch (error: any) {
    let userError = 'Failed to update status';
    if (error.message?.includes('403')) {
      userError = 'Permission denied. Only admins can change recruiter status.';
    }
    
    return { success: false, error: userError };
  }
}