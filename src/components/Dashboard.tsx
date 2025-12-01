import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Users, Building2, DollarSign, CheckSquare, TrendingUp, Calendar } from 'lucide-react';

type Stats = {
  totalContacts: number;
  totalCompanies: number;
  totalDeals: number;
  totalDealValue: number;
  activeTasks: number;
  overdueTasks: number;
  recentActivities: number;
};

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    totalContacts: 0,
    totalCompanies: 0,
    totalDeals: 0,
    totalDealValue: 0,
    activeTasks: 0,
    overdueTasks: 0,
    recentActivities: 0,
  });
  const [dealsByStage, setDealsByStage] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [
        contactsResult,
        companiesResult,
        dealsResult,
        tasksResult,
        activitiesResult,
      ] = await Promise.all([
        supabase.from('contacts').select('id', { count: 'exact', head: true }),
        supabase.from('companies').select('id', { count: 'exact', head: true }),
        supabase.from('deals').select('*'),
        supabase.from('tasks').select('*'),
        supabase.from('activities').select('id', { count: 'exact', head: true }),
      ]);

      const deals = dealsResult.data || [];
      const tasks = tasksResult.data || [];

      const totalValue = deals.reduce((sum, deal) => sum + deal.value, 0);

      const activeTasks = tasks.filter(
        (t) => t.status === 'pending' || t.status === 'in_progress'
      ).length;

      const overdueTasks = tasks.filter(
        (t) =>
          (t.status === 'pending' || t.status === 'in_progress') &&
          t.due_date &&
          new Date(t.due_date) < new Date()
      ).length;

      const stageCount = deals.reduce((acc, deal) => {
        acc[deal.stage] = (acc[deal.stage] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      setStats({
        totalContacts: contactsResult.count || 0,
        totalCompanies: companiesResult.count || 0,
        totalDeals: deals.length,
        totalDealValue: totalValue,
        activeTasks,
        overdueTasks,
        recentActivities: activitiesResult.count || 0,
      });

      setDealsByStage(stageCount);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  const statCards = [
    {
      name: 'Total Contacts',
      value: stats.totalContacts,
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      name: 'Total Companies',
      value: stats.totalCompanies,
      icon: Building2,
      color: 'bg-purple-500',
    },
    {
      name: 'Total Deals',
      value: stats.totalDeals,
      icon: DollarSign,
      color: 'bg-green-500',
    },
    {
      name: 'Deal Value',
      value: `$${stats.totalDealValue.toLocaleString()}`,
      icon: TrendingUp,
      color: 'bg-green-600',
    },
    {
      name: 'Active Tasks',
      value: stats.activeTasks,
      icon: CheckSquare,
      color: 'bg-orange-500',
    },
    {
      name: 'Overdue Tasks',
      value: stats.overdueTasks,
      icon: Calendar,
      color: 'bg-red-500',
    },
  ];

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-sm text-gray-700">
          Overview of your CRM activities and performance
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.name}
              className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="p-5">
                <div className="flex items-center">
                  <div className={`flex-shrink-0 rounded-md p-3 ${stat.color}`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {stat.name}
                      </dt>
                      <dd className="text-2xl font-semibold text-gray-900">
                        {stat.value}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Deals by Stage</h3>
            <div className="space-y-4">
              {Object.entries(dealsByStage).map(([stage, count]) => {
                const percentage = stats.totalDeals > 0
                  ? (count / stats.totalDeals) * 100
                  : 0;

                return (
                  <div key={stage}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="font-medium text-gray-700 capitalize">
                        {stage.replace('_', ' ')}
                      </span>
                      <span className="text-gray-500">{count} deals</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
              {Object.keys(dealsByStage).length === 0 && (
                <p className="text-sm text-gray-500">No deals yet</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Stats</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Average Deal Value</span>
                <span className="text-sm font-semibold text-gray-900">
                  ${stats.totalDeals > 0
                    ? Math.round(stats.totalDealValue / stats.totalDeals).toLocaleString()
                    : 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Contacts per Company</span>
                <span className="text-sm font-semibold text-gray-900">
                  {stats.totalCompanies > 0
                    ? (stats.totalContacts / stats.totalCompanies).toFixed(1)
                    : 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Task Completion Rate</span>
                <span className="text-sm font-semibold text-gray-900">
                  {stats.activeTasks + stats.overdueTasks > 0
                    ? Math.round((stats.activeTasks / (stats.activeTasks + stats.overdueTasks)) * 100)
                    : 0}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Recent Activities</span>
                <span className="text-sm font-semibold text-gray-900">
                  {stats.recentActivities}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-blue-900 mb-2">Welcome to your CRM!</h3>
        <p className="text-sm text-blue-700">
          Start by adding contacts and companies, create deals to track your sales pipeline,
          and log activities to keep track of all interactions. Use tasks to stay organized
          and never miss a follow-up.
        </p>
      </div>
    </div>
  );
}
