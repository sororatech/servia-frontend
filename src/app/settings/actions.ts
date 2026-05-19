// src/app/settings/actions.ts
'use server';

import { revalidatePath } from 'next/cache';
import { getRecruiterHeaders, fetchJson, getApiUrl } from '@/utils/serverFetch';
import { Recruiter } from '@/types/settings';

// ✅ Helper: Check auth before any action
async function requireAuth() {
  const headers = await getRecruiterHeaders();
  if (!headers) {
    throw new Error('Authentication required');
  }
  return headers;
}

export async function createRecruiter(formData: {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  department: string;
  role: string;
}) {
  try {
    const headers = await requireAuth();
    
    console.log('📡 Creating recruiter:', { email: formData.email, department: formData.department });

    const response = await fetchJson<Recruiter>('/users/recruiters/create/', {
      method: 'POST',
      headers,
      body: JSON.stringify(formData),
    });
    
    revalidatePath('/settings');
    console.log('✅ Recruiter created successfully');
    return { success: true, data: response };
    
  } catch (error: any) {
    console.error('❌ createRecruiter error:', {
      message: error.message,
      stack: error.stack?.substring(0, 200)
    });
    
    // ✅ User-friendly error messages
    let userError = 'Failed to create recruiter';
    if (error.message?.includes('Authentication')) {
      userError = 'Session expired. Please log in again.';
    } else if (error.message?.includes('Access Denied') || error.message?.includes('403')) {
      userError = 'You do not have permission to create recruiters. Contact an administrator.';
    } else if (error.message?.includes('email')) {
      userError = 'A recruiter with this email already exists.';
    }
    
    return { success: false, error: userError };
  }
}

export async function updateRecruiter(id: string, updates: Partial<Recruiter>) {
  try {
    const headers = await requireAuth();
    
    const response = await fetchJson<Recruiter>(`/users/recruiters/${id}/`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(updates),
    });
    
    revalidatePath('/settings');
    return { success: true, data: response };
    
  } catch (error: any) {
    console.error('❌ updateRecruiter error:', error.message);
    
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
    
    await fetchJson(`/users/recruiters/${id}/`, {
      method: 'DELETE',
      headers,
    });
    
    revalidatePath('/settings');
    return { success: true };
    
  } catch (error: any) {
    console.error('❌ deleteRecruiter error:', error.message);
    
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
    
    const response = await fetchJson<Recruiter>(`/users/recruiters/${id}/`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ is_active }),
    });
    
    revalidatePath('/settings');
    return { success: true, data: response };
    
  } catch (error: any) {
    console.error('❌ toggleRecruiterStatus error:', error.message);
    
    let userError = 'Failed to update status';
    if (error.message?.includes('403')) {
      userError = 'Permission denied. Only admins can change recruiter status.';
    }
    
    return { success: false, error: userError };
  }
}