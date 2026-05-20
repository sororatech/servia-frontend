import { fetchAnalyticsFromMultipleEndpoints } from '@/lib/api';
import AnalyticsDashboard from './components/AnalyticsDashboard';

export default async function ReportsPage() {
  let initialData;
  try {
    initialData = await fetchAnalyticsFromMultipleEndpoints();
  } catch (error) {
    console.warn('Server-side analytics fetch failed, client will retry:', error);
  }

  return <AnalyticsDashboard initialData={initialData} />;
}