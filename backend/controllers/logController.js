const { insertLogs, getLogs } = require('../services/logService');

const VALID_SEVERITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const VALID_STATUSES = ['Resolved', 'Unresolved'];
const REQUIRED_FIELDS = ['actor', 'role', 'action', 'resource', 'resourceType', 'ipAddress', 'region', 'severity', 'status', 'timestamp'];

const uploadLogs = async (req, res) => {
  try {
    const logs = req.body;

    if (!Array.isArray(logs) || logs.length === 0) {
      return res.status(400).json({ message: 'Request body must be a non-empty array of log records' });
    }

    const errors = [];

    for (let i = 0; i < logs.length; i++) {
      const log = logs[i];
      const rowNum = i + 2;

      for (const field of REQUIRED_FIELDS) {
        if (!log[field] || String(log[field]).trim() === '') {
          errors.push({ row: rowNum, field, issue: `Missing or empty` });
        }
      }

      if (log.severity && !VALID_SEVERITIES.includes(String(log.severity).toUpperCase())) {
        errors.push({ row: rowNum, field: 'severity', issue: `Invalid value "${log.severity}". Must be LOW, MEDIUM, HIGH or CRITICAL` });
      }

      if (log.status && !VALID_STATUSES.includes(log.status)) {
        errors.push({ row: rowNum, field: 'status', issue: `Invalid value "${log.status}". Must be "Resolved" or "Unresolved"` });
      }

      if (log.timestamp) {
        const date = new Date(log.timestamp);
        if (isNaN(date.getTime())) {
          errors.push({ row: rowNum, field: 'timestamp', issue: `Invalid date format "${log.timestamp}"` });
        }
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        message: `Upload failed — ${errors.length} error(s) found. Fix and re-upload.`,
        errors
      });
    }

    const result = await insertLogs(logs);
    const inserted = result.length;
    const skipped = logs.length - inserted;
    res.status(201).json({
      message: `${inserted} logs inserted successfully${skipped > 0 ? `, ${skipped} duplicate(s) skipped` : ''}`
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const fetchLogs = async (req, res) => {
  try {
    const data = await getLogs(req.query);
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { uploadLogs, fetchLogs };