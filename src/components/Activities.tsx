import { useState, useEffect } from 'react';
import { supabase, Activity } from '../lib/supabase';
import { Plus, Phone, Mail, Calendar, FileText } from 'lucide-react';

const ACTIVITY_ICONS = {
  call: Phone,
  email: Mail,
  meeting: Calendar,
  note: FileText,
};

const ACTIVITY_COLORS = {
  call: 'bg-blue-100 text-blue-800',
  email: 'bg-purple-100 text-purple-800',
  meeting: 'bg-green-100 text-green-800',
  note: 'bg-yellow-100 text-yellow-800',
};

export default function Activities() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    type: 'note' as 'call' | 'email' | 'meeting' | 'note',
    subject: '',
    description: '',
    activity_date: new Date().toISOString().slice(0, 16),
  });

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .order('activity_date', { ascending: false });

      if (error) throw error;
      setActivities(data || []);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('activities').insert([formData]);
      if (error) throw error;

      setIsModalOpen(false);
      resetForm();
      fetchActivities();
    } catch (error) {
      console.error('Error saving activity:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      type: 'note',
      subject: '',
      description: '',
      activity_date: new Date().toISOString().slice(0, 16),
    });
  };

  const groupActivitiesByDate = () => {
    const groups: Record<string, Activity[]> = {};
    activities.forEach((activity) => {
      const date = new Date(activity.activity_date).toLocaleDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(activity);
    });
    return groups;
  };

  const activityGroups = groupActivitiesByDate();

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Activity Log</h1>
          <p className="mt-2 text-sm text-gray-700">
            Track all interactions with contacts and companies
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Log Activity
          </button>
        </div>
      </div>

      <div className="mt-8 flow-root">
        <div className="-my-2 overflow-x-auto">
          {Object.entries(activityGroups).map(([date, dateActivities]) => (
            <div key={date} className="mb-8">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">{date}</h3>
              <div className="space-y-4">
                {dateActivities.map((activity) => {
                  const Icon = ACTIVITY_ICONS[activity.type];
                  return (
                    <div
                      key={activity.id}
                      className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start space-x-4">
                        <div
                          className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                            ACTIVITY_COLORS[activity.type]
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <div>
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  ACTIVITY_COLORS[activity.type]
                                }`}
                              >
                                {activity.type}
                              </span>
                              <h4 className="text-sm font-medium text-gray-900 mt-1">
                                {activity.subject}
                              </h4>
                            </div>
                            <span className="text-sm text-gray-500">
                              {new Date(activity.activity_date).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                          {activity.description && (
                            <p className="mt-2 text-sm text-gray-600">{activity.description}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {activities.length === 0 && (
          <div className="text-center py-12 text-gray-500">No activities logged yet</div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Log Activity</h3>
            </div>
            <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Activity Type *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2"
                >
                  <option value="call">Call</option>
                  <option value="email">Email</option>
                  <option value="meeting">Meeting</option>
                  <option value="note">Note</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Subject *</label>
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2"
                  placeholder="e.g., Follow-up call with client"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2"
                  placeholder="Add details about this activity..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Date & Time *</label>
                <input
                  type="datetime-local"
                  required
                  value={formData.activity_date}
                  onChange={(e) => setFormData({ ...formData, activity_date: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  Log Activity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
