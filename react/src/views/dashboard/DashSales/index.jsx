import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Divider
} from '@mui/material';
import {
  PendingActions as PendingIcon,
  CheckCircle as CheckedIcon,
  Forward as ForwardIcon,
  ThumbUp as RecommendedIcon,
  ThumbDown as NotRecommendedIcon,
  Verified as ApprovedIcon,
  Cancel as RejectedIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material';
import axios from 'axios';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function DashSales() {
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState({
    total_complaints: 0,
    status_breakdown: {},
    priority_breakdown: {},
    recent_complaints: 0,
    channel_breakdown: {}
  });

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:8000/api/complaints/statistics');
      setStatistics(response.data);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  // Chart data for Status Breakdown
  const statusChartData = {
    labels: ['Pending', 'Assigned', 'Ongoing', 'Completed'],
    datasets: [{
      data: [
        statistics.status_breakdown?.Pending || 0,
        statistics.status_breakdown?.Assigned || 0,
        statistics.status_breakdown?.Ongoing || statistics.status_breakdown?.['In Progress'] || 0,
        statistics.status_breakdown?.Completed || statistics.status_breakdown?.Resolved || statistics.status_breakdown?.Closed || 0
      ],
      backgroundColor: ['#5e72e4', '#11cdef', '#fb6340', '#2dce89'],
      borderColor: '#fff',
      borderWidth: 2,
    }]
  };

  // Chart data for Priority Breakdown
  const priorityChartData = {
    labels: ['High Priority', 'Medium Priority', 'Low Priority'],
    datasets: [{
      data: [
        statistics.priority_breakdown?.high || 0,
        statistics.priority_breakdown?.medium || 0,
        statistics.priority_breakdown?.low || 0
      ],
      backgroundColor: ['#f5365c', '#fb6340', '#2dce89'],
      borderColor: '#fff',
      borderWidth: 2,
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 15,
          font: {
            size: 11
          },
          usePointStyle: true,
          pointStyle: 'circle'
        }
      }
    }
  };

  const StatusCard = ({ icon: Icon, count, label, borderColor, iconColor }) => (
    <Card 
      sx={{ 
        borderLeft: `4px solid ${borderColor}`,
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        transition: 'all 0.3s',
        '&:hover': {
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          transform: 'translateY(-2px)'
        }
      }}
    >
      <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 2 }}>
        <Box 
          sx={{ 
            backgroundColor: `${iconColor}15`,
            borderRadius: '8px',
            p: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Icon sx={{ fontSize: 32, color: iconColor }} />
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h4" fontWeight={700} color="text.primary">
            {count}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {label}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, backgroundColor: '#f5f7fa', minHeight: '100vh' }}>
      {/* Breadcrumb */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography 
          variant="body2" 
          sx={{ color: '#666', cursor: 'pointer' }}
        >
          Home
        </Typography>
        <Typography variant="body2" sx={{ color: '#666' }}>›</Typography>
        <Typography variant="body2" sx={{ color: '#1976d2', fontWeight: 500 }}>
          Dashboard
        </Typography>
      </Box>

      {/* Page Title */}
      <Typography variant="h5" fontWeight={600} mb={4}>
        Dashboard
      </Typography>

      <Grid container spacing={3}>
        {/* Complaint Application Details Section */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', borderRadius: 2 }}>
            <Typography variant="h6" fontWeight={600} mb={3} color="text.primary">
              Complaint Application Details
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <StatusCard
                  icon={PendingIcon}
                  count={statistics.status_breakdown?.Pending || 0}
                  label="Pending"
                  borderColor="#5e72e4"
                  iconColor="#5e72e4"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatusCard
                  icon={AssignmentIcon}
                  count={statistics.status_breakdown?.Assigned || 0}
                  label="Assigned"
                  borderColor="#11cdef"
                  iconColor="#11cdef"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatusCard
                  icon={ForwardIcon}
                  count={statistics.status_breakdown?.Ongoing || statistics.status_breakdown?.['In Progress'] || 0}
                  label="Ongoing"
                  borderColor="#fb6340"
                  iconColor="#fb6340"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatusCard
                  icon={CheckedIcon}
                  count={statistics.status_breakdown?.Completed || statistics.status_breakdown?.Resolved || statistics.status_breakdown?.Closed || 0}
                  label="Completed"
                  borderColor="#2dce89"
                  iconColor="#2dce89"
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Priority Level Details Section */}
        <Grid item xs={12} lg={7}>
          <Paper sx={{ p: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', borderRadius: 2, height: '100%' }}>
            <Typography variant="h6" fontWeight={600} mb={3} color="text.primary">
              Priority Level Details
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <StatusCard
                  icon={AssignmentIcon}
                  count={statistics.priority_breakdown?.high || 0}
                  label="High Priority"
                  borderColor="#f5365c"
                  iconColor="#f5365c"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <StatusCard
                  icon={AssignmentIcon}
                  count={statistics.priority_breakdown?.medium || 0}
                  label="Medium Priority"
                  borderColor="#fb6340"
                  iconColor="#fb6340"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <StatusCard
                  icon={AssignmentIcon}
                  count={statistics.priority_breakdown?.low || 0}
                  label="Low Priority"
                  borderColor="#2dce89"
                  iconColor="#2dce89"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <StatusCard
                  icon={AssignmentIcon}
                  count={statistics.total_complaints}
                  label="Total Applications"
                  borderColor="#5e72e4"
                  iconColor="#5e72e4"
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Status Distribution Chart */}
        <Grid item xs={12} lg={5}>
          <Paper sx={{ p: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', borderRadius: 2, height: '100%' }}>
            <Typography variant="h6" fontWeight={600} mb={2} color="text.primary">
              Status Distribution
            </Typography>
            <Box sx={{ 
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: 280,
              mt: 2
            }}>
              <Box sx={{ maxWidth: 280, width: '100%' }}>
                <Pie data={statusChartData} options={chartOptions} />
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Priority Distribution Chart */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', borderRadius: 2 }}>
            <Typography variant="h6" fontWeight={600} mb={2} color="text.primary">
              Priority Distribution
            </Typography>
            <Box sx={{ 
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              py: 3
            }}>
              <Box sx={{ maxWidth: 400, width: '100%' }}>
                <Pie data={priorityChartData} options={chartOptions} />
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
