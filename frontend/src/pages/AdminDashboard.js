import React, { useState, useEffect, useCallback } from 'react';
import {
  getAdminCourts, createCourt,
  getAdminEquipment, createEquipment,
  getAdminCoaches, createCoach,
  getPricingRules, createPricingRule, togglePricingRule,
} from '../services/api';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('courts');
  const [courts, setCourts] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [coaches, setCoaches] = useState([]);
  const [pricingRules, setPricingRules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showForm, setShowForm] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      switch (activeTab) {
        case 'courts':
          const courtsRes = await getAdminCourts();
          setCourts(courtsRes.data);
          break;
        case 'equipment':
          const equipmentRes = await getAdminEquipment();
          setEquipment(equipmentRes.data);
          break;
        case 'coaches':
          const coachesRes = await getAdminCoaches();
          setCoaches(coachesRes.data);
          break;
        case 'pricing':
          const rulesRes = await getPricingRules();
          setPricingRules(rulesRes.data);
          break;
        default:
          break;
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to load data' });
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    loadData();
  }, [activeTab, loadData]);

  const handleCreateCourt = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    try {
      await createCourt({
        name: formData.get('name'),
        type: formData.get('type'),
        basePrice: parseFloat(formData.get('basePrice')),
      });
      setMessage({ type: 'success', text: 'Court created successfully' });
      setShowForm(false);
      loadData();
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to create court' });
    }
  };

  const handleCreateEquipment = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    try {
      await createEquipment({
        name: formData.get('name'),
        type: formData.get('type'),
        totalStock: parseInt(formData.get('totalStock')),
        rentalPrice: parseFloat(formData.get('rentalPrice')),
      });
      setMessage({ type: 'success', text: 'Equipment created successfully' });
      setShowForm(false);
      loadData();
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to create equipment' });
    }
  };

  const handleCreateCoach = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const availability = [];
    for (let i = 0; i < 7; i++) {
      const startTime = formData.get(`day${i}_start`);
      const endTime = formData.get(`day${i}_end`);
      if (startTime && endTime) {
        availability.push({
          dayOfWeek: i,
          startTime,
          endTime,
        });
      }
    }

    try {
      await createCoach({
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        hourlyRate: parseFloat(formData.get('hourlyRate')),
        availability,
      });
      setMessage({ type: 'success', text: 'Coach created successfully' });
      setShowForm(false);
      loadData();
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to create coach' });
    }
  };

  const handleCreatePricingRule = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const ruleData = {
      name: formData.get('name'),
      type: formData.get('type'),
      modifier: {
        type: formData.get('modifierType'),
        value: parseFloat(formData.get('modifierValue')),
      },
    };

    if (formData.get('type') === 'peak_hour') {
      ruleData.startTime = formData.get('startTime');
      ruleData.endTime = formData.get('endTime');
    } else if (formData.get('type') === 'weekend') {
      const days = [];
      for (let i = 0; i < 7; i++) {
        if (formData.get(`day${i}`)) {
          days.push(i);
        }
      }
      ruleData.daysOfWeek = days;
    } else if (formData.get('type') === 'indoor_premium') {
      ruleData.appliesTo = formData.get('appliesTo');
    }

    try {
      await createPricingRule(ruleData);
      setMessage({ type: 'success', text: 'Pricing rule created successfully' });
      setShowForm(false);
      loadData();
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to create pricing rule' });
    }
  };

  const handleToggleRule = async (id) => {
    try {
      await togglePricingRule(id);
      loadData();
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to toggle rule' });
    }
  };

  const tabs = ['courts', 'equipment', 'coaches', 'pricing'];

  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold mb-6">Admin Dashboard</h2>

      {message.text && (
        <div className={`mb-4 p-4 rounded ${
          message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {message.text}
        </div>
      )}

      <div className="bg-white rounded-lg shadow">
        <div className="border-b">
          <div className="flex">
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setShowForm(false);
                }}
                className={`px-6 py-3 font-medium capitalize ${
                  activeTab === tab
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              + Add New
            </button>
          )}

          {showForm && (
            <div className="mb-6 p-4 bg-gray-50 rounded">
              <h3 className="text-lg font-semibold mb-4">Create New {activeTab.slice(0, -1)}</h3>
              {activeTab === 'courts' && (
                <form onSubmit={handleCreateCourt}>
                  <div className="grid grid-cols-2 gap-4">
                    <input name="name" placeholder="Court Name" required className="px-4 py-2 border rounded" />
                    <select name="type" required className="px-4 py-2 border rounded">
                      <option value="">Select Type</option>
                      <option value="indoor">Indoor</option>
                      <option value="outdoor">Outdoor</option>
                    </select>
                    <input name="basePrice" type="number" step="0.01" placeholder="Base Price" required className="px-4 py-2 border rounded" />
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Create</button>
                    <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 bg-gray-300 rounded">Cancel</button>
                  </div>
                </form>
              )}

              {activeTab === 'equipment' && (
                <form onSubmit={handleCreateEquipment}>
                  <div className="grid grid-cols-2 gap-4">
                    <input name="name" placeholder="Equipment Name" required className="px-4 py-2 border rounded" />
                    <select name="type" required className="px-4 py-2 border rounded">
                      <option value="">Select Type</option>
                      <option value="racket">Racket</option>
                      <option value="shoes">Shoes</option>
                    </select>
                    <input name="totalStock" type="number" placeholder="Total Stock" required className="px-4 py-2 border rounded" />
                    <input name="rentalPrice" type="number" step="0.01" placeholder="Rental Price" required className="px-4 py-2 border rounded" />
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Create</button>
                    <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 bg-gray-300 rounded">Cancel</button>
                  </div>
                </form>
              )}

              {activeTab === 'coaches' && (
                <form onSubmit={handleCreateCoach}>
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <input name="name" placeholder="Name" required className="px-4 py-2 border rounded" />
                      <input name="email" type="email" placeholder="Email" required className="px-4 py-2 border rounded" />
                      <input name="phone" placeholder="Phone" required className="px-4 py-2 border rounded" />
                    </div>
                    <input name="hourlyRate" type="number" step="0.01" placeholder="Hourly Rate" required className="px-4 py-2 border rounded" />
                    <div className="text-sm font-medium mb-2">Availability (leave empty for unavailable days)</div>
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="w-12">{day}:</span>
                        <input name={`day${idx}_start`} type="time" className="px-4 py-2 border rounded" />
                        <span>-</span>
                        <input name={`day${idx}_end`} type="time" className="px-4 py-2 border rounded" />
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Create</button>
                    <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 bg-gray-300 rounded">Cancel</button>
                  </div>
                </form>
              )}

              {activeTab === 'pricing' && (
                <form onSubmit={handleCreatePricingRule}>
                  <div className="space-y-4">
                    <input name="name" placeholder="Rule Name" required className="w-full px-4 py-2 border rounded" />
                    <select name="type" required className="w-full px-4 py-2 border rounded" onChange={(e) => {
                      // Show/hide relevant fields based on type
                    }}>
                      <option value="">Select Rule Type</option>
                      <option value="peak_hour">Peak Hour</option>
                      <option value="weekend">Weekend</option>
                      <option value="indoor_premium">Indoor Premium</option>
                      <option value="holiday">Holiday</option>
                    </select>
                    <div className="grid grid-cols-2 gap-4">
                      <select name="modifierType" required className="px-4 py-2 border rounded">
                        <option value="multiplier">Multiplier</option>
                        <option value="fixed_add">Fixed Add</option>
                        <option value="fixed_subtract">Fixed Subtract</option>
                        <option value="percentage">Percentage</option>
                      </select>
                      <input name="modifierValue" type="number" step="0.01" placeholder="Value" required className="px-4 py-2 border rounded" />
                    </div>
                    <div id="peak-hour-fields" className="grid grid-cols-2 gap-4">
                      <input name="startTime" type="time" placeholder="Start Time" className="px-4 py-2 border rounded" />
                      <input name="endTime" type="time" placeholder="End Time" className="px-4 py-2 border rounded" />
                    </div>
                    <div id="weekend-fields" className="space-y-2">
                      <div className="text-sm font-medium">Select Days:</div>
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, idx) => (
                        <label key={idx} className="flex items-center gap-2">
                          <input name={`day${idx}`} type="checkbox" />
                          <span>{day}</span>
                        </label>
                      ))}
                    </div>
                    <select name="appliesTo" className="w-full px-4 py-2 border rounded">
                      <option value="all">All Courts</option>
                      <option value="indoor">Indoor Only</option>
                      <option value="outdoor">Outdoor Only</option>
                    </select>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Create</button>
                    <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 bg-gray-300 rounded">Cancel</button>
                  </div>
                </form>
              )}
            </div>
          )}

          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <div className="space-y-4">
              {activeTab === 'courts' && courts.map(court => (
                <div key={court._id} className="p-4 border rounded flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold">{court.name}</h4>
                    <p className="text-sm text-gray-600">{court.type} • ${court.basePrice}/hr</p>
                  </div>
                  <span className={`px-3 py-1 rounded text-sm ${court.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {court.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              ))}

              {activeTab === 'equipment' && equipment.map(item => (
                <div key={item._id} className="p-4 border rounded flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold">{item.name}</h4>
                    <p className="text-sm text-gray-600">{item.type} • Stock: {item.totalStock} • ${item.rentalPrice}/hr</p>
                  </div>
                </div>
              ))}

              {activeTab === 'coaches' && coaches.map(coach => (
                <div key={coach._id} className="p-4 border rounded">
                  <h4 className="font-semibold">{coach.name}</h4>
                  <p className="text-sm text-gray-600">{coach.email} • ${coach.hourlyRate}/hr</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Available: {coach.availability.length} day(s)
                  </p>
                </div>
              ))}

              {activeTab === 'pricing' && pricingRules.map(rule => (
                <div key={rule._id} className="p-4 border rounded flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold">{rule.name}</h4>
                    <p className="text-sm text-gray-600">
                      {rule.type} • {rule.modifier.type}: {rule.modifier.value}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleRule(rule._id)}
                      className={`px-3 py-1 rounded text-sm ${
                        rule.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {rule.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

