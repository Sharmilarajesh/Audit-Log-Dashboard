const Log = require('../models/Log');

const insertLogs = async (logs) => {
  return await Log.insertMany(logs, { ordered: false });
};

const getLogs = async (query) => {
  const {
    page = 1,
    limit = 20,
    search = '',
    severity,
    status,
    role,
    sortField = 'timestamp',
    sortOrder = 'desc'
  } = query;

  const filter = {};

  if (search) {
    const escapedSearch = search.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const searchRegex = new RegExp(escapedSearch, 'i');
    filter.$or = [
      { actor: searchRegex },
      { action: searchRegex },
      { resource: searchRegex },
      { role: searchRegex },
      { resourceType: searchRegex },
      { ipAddress: searchRegex },
      { region: searchRegex }
    ];
  }
  if (severity) filter.severity = severity;
  if (status)   filter.status = status;
  if (role)     filter.role = role;

  const sort = { [sortField]: sortOrder === 'asc' ? 1 : -1 };
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [logs, total] = await Promise.all([
    Log.find(filter).sort(sort).skip(skip).limit(parseInt(limit)),
    Log.countDocuments(filter)
  ]);

  return {
    logs,
    total,
    page: parseInt(page),
    totalPages: Math.ceil(total / parseInt(limit))
  };
};

module.exports = { insertLogs, getLogs };